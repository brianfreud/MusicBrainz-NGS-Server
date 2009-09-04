#!/usr/bin/perl -w

use strict;
use FindBin;
use lib "$FindBin::Bin/../../../lib";

use DBDefs;
use MusicBrainz;
use MusicBrainz::Server::Validation;
use MusicBrainz::Server::Data::Utils qw( placeholders );
use Sql;
use LWP::Simple qw();

my $mb = MusicBrainz->new;
$mb->Login(db => "READWRITE");
my $sql = Sql->new($mb->dbh);

my %ReleaseFormatNames = (
   1 => 'CD',
   2 => 'DVD',
   3 => 'SACD',
   4 => 'DualDisc',
   5 => 'LaserDisc',
   6 => 'MiniDisc',
   7 => 'Vinyl',
   8 => 'Cassette',
   9 => 'Cartridge (4/8-tracks)',
   10 => 'Reel-to-reel',
   11 => 'DAT',
   12 => 'Digital Media',
   13 => 'Other',
   14 => 'Wax Cylinder',
   15 => 'Piano Roll',
   16 => 'DCC',
);

sub mangle_catno
{
    my $catno = lc $_[0] || '';
    $catno =~ s/\W//g; # remove non-alphanumeric characters
    $catno =~ s/(^|[^0-9])0+/$1/g; # remove leading zeros from numbers
    return $catno;
}

sub match_discogs_catno_1
{
    my ($discogs_info, $mb_info, @entity0) = @_;

    # Try to match catalog numbers
    my @matches;
    if ($discogs_info->[1]) {
        my @discogs_catnos = map { mangle_catno($_) } split /;/, $discogs_info->[1];
        foreach my $entity0 (@entity0) {
            my $catno = mangle_catno($mb_info->{$entity0}->{catno});
            my $barcode = $mb_info->{$entity0}->{barcode} || '';
            $barcode =~ s/^0+//; # remove leading zeros
            next unless $catno || $barcode;
            foreach my $discogs_catno (@discogs_catnos) {
                if ($catno eq $discogs_catno ||
                    $barcode eq $discogs_catno ||
                    substr($barcode, 0, -1) eq $discogs_catno) {
                    push @matches, $entity0;
                    last;
                }
            }
        }
    }
    return @matches;
}

sub match_discogs_catno_2
{
    my ($discogs_info, $mb_info, @entity0) = @_;

    # Try to match parts catalog numbers
    my @matches;
    if ($discogs_info->[1]) {
        my @discogs_catnos = map { mangle_catno($_) } split /;/, $discogs_info->[1];
        my $discogs_format = $discogs_info->[5];
        foreach my $entity0 (@entity0) {
            my $catno = mangle_catno($mb_info->{$entity0}->{catno});
            my $format = $ReleaseFormatNames{$mb_info->{$entity0}->{format} || ''};
            next unless $catno && $format;
            foreach my $discogs_catno (@discogs_catnos) {
                if ($discogs_format eq $format &&
                    (index($catno, $discogs_catno) >= 0 ||
                    index($discogs_catno, $catno) >= 0)) {
                    push @matches, $entity0;
                    last;
                }
            }
        }
    }
    return @matches;
}

sub match_discogs_country
{
    my ($discogs_info, $mb_info, @entity0) = @_;

    # Try countries and years
    my @matches;
    if ($discogs_info->[3] && $discogs_info->[4]) {
        my $discogs_year = substr($discogs_info->[4], 0, 4);
        my $discogs_country = $discogs_info->[3];
        my $discogs_format = $discogs_info->[5];
        foreach my $entity0 (@entity0) {
            my $year = substr($mb_info->{$entity0}->{releasedate} || '', 0, 4);
            my $country = $mb_info->{$entity0}->{country} || '';
            $country = "UK" if $country eq "United Kingdom";
            $country = "US" if $country eq "United States";
            my $format = $ReleaseFormatNames{$mb_info->{$entity0}->{format} || ''} || '';
            if ($year && $country && $year eq $discogs_year &&
                $country eq $discogs_country &&
                ($format eq '' || $format eq $discogs_format)) {
                push @matches, $entity0;
                last;
            }
        }
    }
    return @matches;
}

sub load_release_info
{
    my (@ids) = @_;

    my $data = $sql->SelectListOfHashes('
        SELECT r.id, releasedate, c.name AS country, barcode, catno, l.name AS label, r.format
        FROM public.release r
            LEFT JOIN public.label l ON r.label = l.id
            LEFT JOIN public.country c ON r.country = c.id
        WHERE r.id IN ('.placeholders(@ids).')', @ids);
    return map { $_->{id} => $_ } @$data;
}

$sql->Begin;
eval {

print STDERR "Loading attribute types\n";
my %attr_id_map;
$sql->Select("SELECT * FROM public.link_attribute_type");
while (1) {
    my $row = $sql->NextRowHashRef or last;
    $attr_id_map{$row->{id}} = $row;
}
$sql->Finish;

$sql->Do("TRUNCATE link_attribute_type");
print STDERR "Inserting attribute types\n";
foreach my $attr (values %attr_id_map) {
    next if $attr->{name} eq 'ROOT';
    my $root = $attr;
    while ($root->{parent} > 0) {
        $root = $attr_id_map{$root->{parent}};
    }
    $sql->Do("
        INSERT INTO link_attribute_type
            (id, parent, root, childorder, gid, name, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)",
        $attr->{id}, $attr->{parent} || undef, $root->{id}, $attr->{childorder},
        $attr->{mbid}, $attr->{name}, $attr->{description});
}

my %attr_map;
$sql->Select("SELECT * FROM public.link_attribute_type WHERE parent=0");
while (1) {
    my $row = $sql->NextRowHashRef or last;
    $attr_map{$row->{name}} = $row->{id};
}
$sql->Finish;

my @entity_types = (
    'album', 'artist', 'label', 'track', 'url',
);

my %new_entity_types = (
    'track' => 'recording',
);

my %album_ar_types = (
    'album' => {
        13 => 'release_group',  # cover
        17 => 'release',        # part of set
        11 => 'release_group',  # live performance
        9  => 'release_group',  # DJ-mix
        3  => 'release',        # remaster
        7  => 'release_group',  # remix
        5  => 'release_group',  # mash-up
        2  => 'release',        # first album release
        15 => 'release',        # transliteration
    },
    'artist' => {
        1 => 'release', # performance
        22 => 'release', # live sound
        10 => 'release', # remixes
        13 => 'release', # composition
        17 => 'release', # production
        40 => 'release', # compilations
        41 => 'release', # compiler
        38 => 'release', # mix-DJ
        2 => 'release', # performer
        3 => 'release', # instrument
        4 => 'release', # vocal
        5 => 'release', # performing orchestra
        9 => 'release', # conductor
        44 => 'release_group', # tribute
        11 => 'release', # remixer
        12 => 'release', # samples from artist
        14 => 'release', # composer
        42 => 'release', # librettist
        16 => 'release', # lyricist
        20 => 'release', # audio
        18 => 'release', # producer
        45 => 'release', # mastering
        21 => 'release', # sound
        43 => 'release', # chorus master
        35 => 'release', # publishing
        25 => 'release', # misc
        26 => 'release', # legal representation
        27 => 'release', # booking
        28 => 'release', # artists and repertoire
        30 => 'release', # art direction
        29 => 'release', # creative direction
        24 => 'release', # recording
        34 => 'release', # travel
        36 => 'release', # merchandise
        33 => 'release', # photography
        48 => 'release', # orchestrator
        47 => 'release', # instrumentator
        19 => 'release', # engineer
        31 => 'release', # design/illustration
        32 => 'release', # graphic design
        23 => 'release', # mix
        50 => 'release', # liner notes
        15 => 'release', # arranger
        52 => 'release', # programming
        53 => 'release', # editor
    },
    'label' => {
        2 => 'release', # publishing
    },
    'track' => {
        2 => 'release', # samples material
    },
    'url' => {
        24 => 'release', # discogs
        25 => 'release', # musicmoz
        16 => 'release', # discography
        18 => 'release', # get the music
        29 => 'release', # Affiliate links
        22 => 'release', # other databases
        32 => 'release', # creative commons licensed download
        23 => 'release_group', # wikipedia
        21 => 'release', # download for free
        20 => 'release', # purchase for download
        19 => 'release', # purchase for mail-order
        17 => 'release_group', # review
        30 => 'release', # amazon asin
        34 => 'release', # cover art link
        36 => 'release_group', # ibdb
        37 => 'release_group', # iobdb
        27 => 'release_group', # IMDb
    },
);

$sql->Do("TRUNCATE link_type");
$sql->Do("TRUNCATE link_type_attribute_type");
my %link_type_map;
foreach my $orig_t0 (@entity_types) {
    foreach my $orig_t1 (@entity_types) {
        next if $orig_t0 gt $orig_t1;
        my @new_t;
        my $new_t0 = $new_entity_types{$orig_t0} || $orig_t0;
        my $new_t1 = $new_entity_types{$orig_t1} || $orig_t1;
        if ($orig_t0 eq 'album' && $orig_t1 eq 'album') {
            push @new_t, ['release', 'release'];
            push @new_t, ['release_group', 'release_group'];
        }
        elsif ($orig_t0 eq 'album') {
            push @new_t, ['release', $new_t1];
            push @new_t, ['release_group', $new_t1];
        }
        else {
            push @new_t, [$new_t0, $new_t1];
        }
        my $rows = $sql->SelectListOfHashes("SELECT * FROM public.lt_${orig_t0}_${orig_t1}");
        foreach my $t (@new_t) {
            ($new_t0, $new_t1) = @$t;
            my $reverse = 0;
            if ($new_t0 gt $new_t1) {
                ($new_t0, $new_t1) = ($new_t1, $new_t0);
                $reverse = 1;
            }
            print STDERR "Converting $orig_t0<=>$orig_t1 link types to $new_t0<=>$new_t1\n";
            # Generate IDs for new link types and save them in a global hash
            foreach my $row (@$rows) {
                my $id = $sql->SelectSingleValue("SELECT nextval('link_type_id_seq')");
                my $key = join("_", $new_t0, $new_t1, $row->{id});
                $link_type_map{$key} = $id;
            }
            # Copy over link types from the old schema
            foreach my $row (@$rows) {
                my ($linkphrase, $rlinkphrase);
                if ($reverse) {
                    $linkphrase = $row->{'rlinkphrase'};
                    $rlinkphrase = $row->{'linkphrase'};
                }
                else {
                    $linkphrase = $row->{'linkphrase'};
                    $rlinkphrase = $row->{'rlinkphrase'};
                }
                my $key = join("_", $new_t0, $new_t1, $row->{id});
                my $id = $link_type_map{$key};
                my $parent_id = $row->{parent} || undef;
                if (defined($parent_id)) {
                    # Lookup the parent type
                    $key = join("_", $new_t0, $new_t1, $parent_id);
                    $parent_id = $link_type_map{$key} || undef;
                }
                $sql->Do("
                    INSERT INTO link_type
                        (id, parent, childorder, gid, name, description, linkphrase,
                        rlinkphrase, shortlinkphrase, priority, entitytype0,
                        entitytype1)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ", $id, $parent_id, $row->{childorder}, $row->{mbid},
                $row->{name}, $row->{description}, $linkphrase, $rlinkphrase,
                $row->{shortlinkphrase}, $row->{priority}, $new_t0, $new_t1);
                foreach my $attr (split / /, $row->{attribute}) {
                    my ($name, $limits) = split /=/, $attr;
                    my ($min_l, $max_l) = split /-/, $limits;
                    $sql->Do("
                        INSERT INTO link_type_attribute_type
                            (link_type, attribute_type, min, max)
                            VALUES (?, ?, ?, ?)
                    ", $id, $attr_map{$name}, $min_l || undef, $max_l || undef);
                }
            }
        }
    }
}

print STDERR "Loading release group ID map\n";
my %rg_id_map;
$sql->Select("SELECT id, release_group FROM public.album");
while (1) {
    my $row = $sql->NextRowRef or last;
    $rg_id_map{$row->[0]} = $row->[1];
}
$sql->Finish;

print STDERR "Loading release ID map\n";
my %release_id_map;
$sql->Select("SELECT album, release FROM tmp_release_album");
while (1) {
    my $row = $sql->NextRowRef or last;
    if (exists $release_id_map{$row->[0]}) {
        push @{ $release_id_map{$row->[0]} }, $row->[1];
    }
    else {
        $release_id_map{$row->[0]} = [ $row->[1] ];
    }
}
$sql->Finish;

$sql->Do("TRUNCATE link");
$sql->Do("TRUNCATE link_attribute");

my $m_clean = 0;
my $m_not_clean = 0;

foreach my $orig_t0 (@entity_types) {
    foreach my $orig_t1 (@entity_types) {
        next if $orig_t0 gt $orig_t1;

        my %links;
        my %l_links;
        my $n_links = 0;

        print STDERR "Converting $orig_t0 <=> $orig_t1 links\n";

        my %attribs;
        my $rows = $sql->SelectListOfHashes("SELECT * FROM public.link_attribute WHERE link_type='${orig_t0}_${orig_t1}'");
        foreach my $row (@$rows) {
            my $link = $row->{link};
            if (!exists($attribs{$link})) {
                $attribs{$link} = [];
            }
            push @{$attribs{$link}}, $row->{attribute_type};
        }

        my %discogs;

        if ($orig_t0 eq "album" && $orig_t1 eq "url") {
            # Load also the URLs
            $rows = $sql->SelectListOfHashes("
                SELECT l.*, url.url FROM public.l_${orig_t0}_${orig_t1} l
                LEFT JOIN public.url ON l.link1=url.id");
            # Load Discogs URL data
            LWP::Simple::mirror("http://users.musicbrainz.org/~luks/ngs/discogs.dat", "discogs.dat");
            open(DISCOGS, "<discogs.dat");
            while (<DISCOGS>) {
                my $line = $_;
                $line =~ s/\s*$//;
                my @fields = split /\t/, $line;
                $discogs{$fields[0]} = \@fields;
            }
            close(DISCOGS);
        }
        else {
            $rows = $sql->SelectListOfHashes("SELECT * FROM public.l_${orig_t0}_${orig_t1}");
        }
        my $i = 0;
        my $cnt = scalar(@$rows);
        foreach my $row (@$rows) {
            my $id = $row->{id};

            my @attrs;
            if (exists($attribs{$id})) {
                my %attrs = map { $_ => 1 } @{$attribs{$id}};
                @attrs = keys %attrs;
                @attrs = sort @attrs;
            }

            my $begindate = $row->{begindate} || "0000-00-00";
            my $enddate = $row->{enddate} || "0000-00-00";
            MusicBrainz::Server::Validation::TrimInPlace($begindate);
            MusicBrainz::Server::Validation::TrimInPlace($enddate);
            while (length($begindate) < 10) {
                $begindate .= "-00";
            }
            while (length($enddate) < 10) {
                $enddate .= "-00";
            }

            my $new_t0 = $new_entity_types{$orig_t0} || $orig_t0;
            my $new_t1 = $new_entity_types{$orig_t1} || $orig_t1;
            if ($orig_t0 eq "album") {
                # album-<something>
                $new_t0 = "release";
                if (exists $album_ar_types{$orig_t1}) {
                    # we have a special case for this AR type
                    $new_t0 = $album_ar_types{$orig_t1}->{ $row->{link_type} } || "release";
                }
                if ($orig_t1 eq "album") {
                    # album-album
                    $new_t1 = $new_t0;
                }
            }

            # Move Discogs master URLs the release group
            if ($orig_t0 eq "album" && $orig_t1 eq "url" && $row->{link_type} == 24) {
                if ($row->{url} =~ qr{/master/}) {
                    $new_t0 = "release_group";
                }
            }

            my $reverse = 0;
            if ($new_t0 gt $new_t1) {
                ($new_t0, $new_t1) = ($new_t1, $new_t0);
                $reverse = 1;
            }

            my ($entity0, $entity1);
            if ($reverse) {
                $entity0 = $row->{link1};
                $entity1 = $row->{link0};
            }
            else {
                $entity0 = $row->{link0};
                $entity1 = $row->{link1};
            }

            my @entity0 = ( $entity0 );
            my @entity1 = ( $entity1 );

            if ($new_t0 eq "release_group") {
                # album => release_group
                @entity0 = ( $rg_id_map{$entity0} );
            }
            elsif ($new_t0 eq "release") {
                # album => release1, release2, ...
                @entity0 = @{ $release_id_map{$entity0} };
            }

            if ($new_t1 eq "release_group") {
                # album -> release_group
                @entity1 = ( $rg_id_map{$entity1} );
            }
            elsif ($new_t1 eq "release") {
                # album -> release1, release2, ...
                @entity1 = @{ $release_id_map{$entity1} };
            }

            #if (scalar(@entity0) > 1 && $orig_t0 eq "album" && $orig_t1 eq "url" && $row->{link_type} == 30) {
            #    printf "A %d\n", $row->{link1};
            #}
            #if (scalar(@entity0) > 1 && $orig_t0 eq "album" && $orig_t1 eq "url" && $row->{link_type} == 24) {
            #    printf "D %d\n", $row->{link1};
            #}

            my @new_links;

            # Try to disambiguate Discogs release URLs
            if ($new_t0 eq "release" && $new_t1 eq "url" && $row->{link_type} == 24 && scalar(@entity0) > 1 && scalar(@entity1) == 1) {
                my $discogs_info = $discogs{$row->{link1}};
                if (defined $discogs_info) {
                    my %mb_info = load_release_info(@entity0);
                    my @matches = match_discogs_catno_1($discogs_info, \%mb_info, @entity0);
                    unless (@matches) {
                        @matches = match_discogs_catno_2($discogs_info, \%mb_info, @entity0);
                        unless (@matches) {
                            @matches = match_discogs_country($discogs_info, \%mb_info, @entity0);
                            unless (@matches) {
                                @matches = @entity0;
                            }
                        }
                    }
                    @entity0 = @matches;
                }
            }

            # Try to disambiguate 'part of set' and 'transliteration' ARs
            if ($new_t0 eq "release" && $new_t1 eq "release" &&
                ($row->{link_type} == 15 || $row->{link_type} == 17) &&
                (scalar(@entity0) > 1 || scalar(@entity1) > 1)) {
                #printf STDERR " ** Disambiguating %s and %s\n", join(',', @entity0), join(',', @entity1);
                my @ids = (@entity0, @entity1);
                my $rinfo = $sql->SelectListOfHashes('
                    SELECT id, releasedate, country, barcode, catno, label
                    FROM public.release r
                    WHERE r.id IN ('.placeholders(@ids).')', @ids);
                my %rinfo = map { $_->{id} => $_ } @$rinfo;
                my %used;
                foreach $entity0 (@entity0) {
                    foreach $entity1 (@entity1) {
                        next if $entity0 == $entity1;
                        #printf STDERR "   ** Comparing %s and %s\n", $entity0, $entity1;
                        next unless exists $rinfo{$entity0};
                        next unless exists $rinfo{$entity1};
                        my $m_sum = 0;
                        my $m_cnt = 0;

                        $m_cnt += 1
                            if (defined $rinfo{$entity0}->{releasedate} ||
                                defined $rinfo{$entity1}->{releasedate});
                        $m_sum += 1
                            if (defined $rinfo{$entity0}->{releasedate} &&
                                defined $rinfo{$entity1}->{releasedate} &&
                                $rinfo{$entity0}->{releasedate} eq $rinfo{$entity1}->{releasedate});

                        $m_cnt += 1
                            if (defined $rinfo{$entity0}->{country} ||
                                defined $rinfo{$entity1}->{country});
                        $m_sum += 1
                            if (defined $rinfo{$entity0}->{country} &&
                                defined $rinfo{$entity1}->{country} &&
                                $rinfo{$entity0}->{country} == $rinfo{$entity1}->{country});

                        $m_cnt += 1
                            if (defined $rinfo{$entity0}->{barcode} ||
                                defined $rinfo{$entity1}->{barcode});
                        $m_sum += 1
                            if (defined $rinfo{$entity0}->{barcode} &&
                                defined $rinfo{$entity1}->{barcode} &&
                                $rinfo{$entity0}->{barcode} eq $rinfo{$entity1}->{barcode});

                        $m_cnt += 1
                            if (defined $rinfo{$entity0}->{catno} ||
                                defined $rinfo{$entity1}->{catno});
                        $m_sum += 1
                            if (defined $rinfo{$entity0}->{catno} &&
                                defined $rinfo{$entity1}->{catno} &&
                                 # lower-cased cat#
                                (lc($rinfo{$entity0}->{catno}) eq lc($rinfo{$entity1}->{catno}) ||
                                 # lower-cased cat# without the last character (multi-disc cat#s)
                                 substr(lc($rinfo{$entity0}->{catno}), 0, -1) eq substr(lc($rinfo{$entity1}->{catno}), 0, -1)));

                        $m_cnt += 1
                            if (defined $rinfo{$entity0}->{label} ||
                                defined $rinfo{$entity1}->{label});
                        $m_sum += 1
                            if (defined $rinfo{$entity0}->{label} &&
                                defined $rinfo{$entity1}->{label} &&
                                $rinfo{$entity0}->{label} == $rinfo{$entity1}->{label});

                        my $score = $m_cnt > 0 ? 1.0 * $m_sum / $m_cnt : 0;
                        #printf STDERR "      - %s vs %s, ", $rinfo{$entity0}->{releasedate} || "-", $rinfo{$entity1}->{releasedate} || "-";
                        #printf STDERR "%s vs %s, ", $rinfo{$entity0}->{country} || "-", $rinfo{$entity1}->{country} || "-";
                        #printf STDERR "%s vs %s, ", $rinfo{$entity0}->{barcode} || "-", $rinfo{$entity1}->{barcode} || "-";
                        #printf STDERR "%s vs %s, ", $rinfo{$entity0}->{catno} || "-", $rinfo{$entity1}->{catno} || "-";
                        #printf STDERR "%s vs %s\n", $rinfo{$entity0}->{label} || "-", $rinfo{$entity1}->{label} || "-";
                        #printf STDERR "      Score: %f\n", $score;
                        if ($score >= 1.0) {
                            $used{$entity0} += 1;
                            $used{$entity1} += 1;
                            push @new_links, [$entity0, $entity1];
                        }
                    }
                }
                # If we have some matches, ...
                if (%used) {
                    foreach my $used (values %used) {
                        if ($used > 1) {
                            # Ambiguous match, forget everything
                            @new_links = ();
                            last;
                        }
                    }
                    # And if we still have some matches, generate links for
                    # unused entities. We will lose some links here if
                    # @entity0 or @entity1 is empty, but it doesn't matter,
                    # because we already have more correct matches anyway.
                    if (@new_links) {
                        foreach $entity0 (@entity0) {
                            next if exists $used{$entity0};
                            foreach $entity1 (@entity1) {
                                next if exists $used{$entity1};
                                next if $entity0 == $entity1;
                                push @new_links, [$entity0, $entity1];
                            }
                        }
                    }

                }
                if (@new_links) {
                    #foreach my $r (@new_links) {
                        #printf STDERR "      %d -> %d\n", $r->[0], $r->[1];
                    #}
                    $m_clean += 1;
                #        printf STDERR "      CLEAN MATCH\n";
                }
                else {
                    $m_not_clean += 1;
                }
            }

            # Generate all combinations
            if (!scalar(@new_links)) {
                foreach $entity0 (@entity0) {
                    foreach $entity1 (@entity1) {
                        next if $entity0 == $entity1;
                        push @new_links, [$entity0, $entity1];
                    }
                }
            }

            my $link_type_key = join("_", $new_t0, $new_t1, $row->{link_type});
            my $link_type_id = $link_type_map{$link_type_key};

            my $key = join("_", $link_type_id, $begindate, $enddate, @attrs);
            my $link_id;
            if (!exists($links{$key})) {
                $link_id = $sql->SelectSingleValue("SELECT nextval('link_id_seq')");
                $links{$key} = $link_id;
                my @begindate = split(/-/, $begindate);
                my @enddate = split(/-/, $enddate);
                $sql->Do("
                    INSERT INTO link
                        (id, link_type, begindate_year, begindate_month, begindate_day,
                        enddate_year, enddate_month, enddate_day, attributecount)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ", $link_id, $link_type_id,
                    ($begindate[0] + 0) || undef,
                    ($begindate[1] + 0) || undef,
                    ($begindate[2] + 0) || undef,
                    ($enddate[0] + 0) || undef,
                    ($enddate[1] + 0) || undef,
                    ($enddate[2] + 0) || undef,
                    scalar(@attrs));
                foreach my $attr (@attrs) {
                    $sql->Do("INSERT INTO link_attribute (link, attribute_type) VALUES (?, ?)",
                        $link_id, $attr);
                }
            }
            else {
                $link_id = $links{$key};
            }

            foreach my $r (@new_links) {
                my ($entity0, $entity1) = @$r;
                if ($i % 100 == 0) {
                    printf STDERR " %d/%d\r", $i, $cnt;
                }
                $i += 1;
                $key = join("_", $link_id, $entity0, $entity1);
                if (!exists($l_links{$key})) {
                    $l_links{$key} = 1;
                    $sql->Do("INSERT INTO l_${new_t0}_${new_t1}
                        (link, entity0, entity1) VALUES (?, ?, ?)",
                        $link_id, $entity0, $entity1);
                    $n_links++;
                }
            }

        }

    }

}

#printf STDERR "album-album disamguation: %d/%d clean\n", $m_clean, $m_clean + $m_not_clean;

    $sql->Do("DROP TABLE tmp_release_album");
    $sql->Commit;
};
if ($@) {
    printf STDERR "ERROR: %s\n", $@;
    $sql->Rollback;
}
