#!/usr/bin/perl -w

use strict;
use FindBin;
use lib "$FindBin::Bin/../../../lib";

use DBDefs;
use MusicBrainz;
use MusicBrainz::Server::Validation;
use Sql;

my $mb = MusicBrainz->new;
$mb->Login(db => "READWRITE");
my $sql = Sql->new($mb->dbh);

my $raw_mb = MusicBrainz->new;
$raw_mb->Login(db => "RAWDATA");
my $raw_sql = Sql->new($raw_mb->dbh);

$sql->Begin;
$raw_sql->Begin;
eval {

print "Converting artist data\n";

$raw_sql->Do("
    INSERT INTO artist_rating_raw (artist, editor, rating)
        SELECT artist, editor, rating * 20 FROM public.artist_rating_raw
    ");

$raw_sql->Do("
    INSERT INTO artist_tag_raw (artist, editor, tag)
        SELECT artist, moderator, tag FROM public.artist_tag_raw
    ");

print "Converting label data\n";

$raw_sql->Do("
    INSERT INTO label_rating_raw (label, editor, rating)
        SELECT label, editor, rating * 20 FROM public.label_rating_raw
    ");

$raw_sql->Do("
    INSERT INTO label_tag_raw (label, editor, tag)
        SELECT label, moderator, tag FROM public.label_tag_raw
    ");

print "Converting recording data\n";

$raw_sql->Do("
    INSERT INTO recording_rating_raw (recording, editor, rating)
        SELECT track, editor, rating * 20 FROM public.track_rating_raw
    ");

$raw_sql->Do("
    INSERT INTO recording_tag_raw (recording, editor, tag)
        SELECT track, moderator, tag FROM public.track_tag_raw
    ");

print "Converting release group data\n";


print " * Loading release group map\n";
my $albums = $sql->SelectListOfHashes("SELECT id, release_group FROM public.album");
my %rg_map = map { $_->{id} => $_->{release_group} } @$albums;
$albums = undef;

$raw_sql->Do("CREATE AGGREGATE array_accum (basetype = anyelement, sfunc = array_append, stype = anyarray, initcond = '{}')");

print " * Converting raw tags\n";
my %aggr;
$raw_sql->Select("
    SELECT tag, moderator, array_accum(release)
    FROM public.release_tag_raw
    GROUP BY tag, moderator");
while (1) {
    my $row = $raw_sql->NextRowRef or last;
    my ($tag, $editor, $ids) = @$row;
    # Unpack the array if using old DBD::Pg
    if (ref $ids ne 'ARRAY') {
        $ids = [ $ids =~ /(\d+)/g ];
    }
    # Map album ids to release_group ids, remove duplicates
    my %ids = map { $rg_map{$_} => 1 } @$ids;
    my @ids = keys %ids;
    foreach my $id (@ids) {
        $raw_sql->Do("
            INSERT INTO release_group_tag_raw (release_group, editor, tag)
            VALUES (?, ?, ?)", $id, $editor, $tag);
        unless (exists $aggr{$id}) {
            $aggr{$id} = {};
        }
        if (exists $aggr{$id}{$tag}) {
            $aggr{$id}->{$tag} += 1;
        }
        else {
            $aggr{$id}->{$tag} = 1;
        }
    }
}
$raw_sql->Finish;

print " * Converting aggregated tags\n";
foreach my $id (keys %aggr) {
    my %tags = %{ $aggr{$id} };
    foreach my $tag (keys %tags) {
        $sql->Do("
            INSERT INTO release_group_tag (release_group, tag, count)
            VALUES (?, ?, ?)", $id, $tag, $tags{$tag});
    }
}
%aggr = ();

print " * Converting raw ratings\n";
# Iterate over all raw ratings
$raw_sql->Select("
    SELECT rating * 20, editor, release
    FROM public.release_rating_raw
    ORDER BY editor");
my $user_id = 0;
my @user_data;
while (1) {
    my $row = $raw_sql->NextRowRef;
    my $new_user_id = $row ? $row->[1] : 0;
    if ($user_id != $new_user_id) {
        # If this is a new user, process their ratings
        if (@user_data) {
            my %rg_rating_sum;
            my %rg_rating_cnt;
            # Map albums to RGs and calculate sums/counts
            foreach $row (@user_data) {
                my ($rating, $editor, $album) = @$row;
                my $rg = $rg_map{$album};
                $rg_rating_sum{$rg} += $rating;
                $rg_rating_cnt{$rg} += 1;
            }
            # Iterate over unique RGs and add average raw ratings
            foreach my $rg (keys %rg_rating_sum) {
                my $rating = int(0.5 + $rg_rating_sum{$rg} / $rg_rating_cnt{$rg});
                $raw_sql->Do("
                    INSERT INTO release_group_rating_raw (release_group, editor, rating)
                    VALUES (?, ?, ?)", $rg, $user_id, $rating);
            }
        }
        $user_id = $new_user_id;
        @user_data = ();
    }
    last if !$new_user_id;
    push @user_data, [ @$row ];
}
%rg_map = ();

print " * Converting average ratings\n";
$sql->Do("CREATE UNIQUE INDEX tmp_release_group_meta_idx ON release_group_meta (id)");
$raw_sql->Select("
    SELECT release_group, avg(rating), count(*)
    FROM release_group_rating_raw
    GROUP BY release_group");
while (1) {
    my $row = $raw_sql->NextRowRef or last;
    my ($id, $rating, $count) = @$row;
    $sql->Do("UPDATE release_group_meta SET rating=?, ratingcount=? WHERE id=?", $rating, $count, $id);
}
$raw_sql->Finish;
$sql->Do("DROP INDEX tmp_release_group_meta_idx");

$raw_sql->Do("DROP AGGREGATE array_accum (anyelement)");

print " * Converting CD stubs\n";
$raw_sql->Do("INSERT INTO cdtoc_raw SELECT * FROM public.cdtoc_raw");
$raw_sql->Do("INSERT INTO release_raw SELECT * FROM public.release_raw");
$raw_sql->Do("INSERT INTO track_raw SELECT * FROM public.track_raw");

print " * Loading album->release map\n";

$sql->Select("
    SELECT a.id, r.id AS release
    FROM release r
        JOIN public.album a ON a.gid::uuid = r.gid
");
my %release_map;
while (1) {
    my $row = $sql->NextRowRef or last;
    $release_map{ $row->[0] } = $row->[1];
}
$sql->Finish;

print " * Converting collections\n";

$raw_sql->Select("SELECT id, moderator FROM public.collection_info");
while (1) {
    my $row = $raw_sql->NextRowRef or last;
    my ($id, $editor_id) = @$row;
    $sql->Do("INSERT INTO editor_collection (id, editor) VALUES (?, ?)",
             $id, $editor_id);
}
$raw_sql->Finish;

$raw_sql->Select("SELECT collection_info, album
                  FROM public.collection_has_release_join");
while (1) {
    my $row = $raw_sql->NextRowRef or last;
    my ($collection_id, $album_id) = @$row;
    $sql->Do("INSERT INTO editor_collection_release (collection, release)
              VALUES (?, ?)", $collection_id, $release_map{$album_id});
}
$raw_sql->Finish;

    $sql->Commit;
    $raw_sql->Commit;
};
if ($@) {
    $sql->Rollback;
    $raw_sql->Rollback;
}
