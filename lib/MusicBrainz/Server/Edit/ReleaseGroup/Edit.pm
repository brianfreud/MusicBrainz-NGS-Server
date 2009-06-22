package MusicBrainz::Server::Edit::ReleaseGroup::Edit;
use Moose;

use MusicBrainz::Server::Constants qw( $EDIT_RELEASEGROUP_EDIT );
use MusicBrainz::Server::Data::ArtistCredit;
use MusicBrainz::Server::Data::ReleaseGroup;
use MusicBrainz::Server::Data::Utils qw(
    artist_credit_to_ref
    partial_date_to_hash
);
use Moose::Util::TypeConstraints qw( as subtype find_type_constraint );
use MooseX::Types::Moose qw( ArrayRef Maybe Str Int );
use MooseX::Types::Structured qw( Dict Optional );

extends 'MusicBrainz::Server::Edit';

sub edit_type { $EDIT_RELEASEGROUP_EDIT }
sub edit_name { "Edit ReleaseGroup" }

sub release_group_id { shift->data->{release_group} }

has 'release_group' => (
    isa => 'ReleaseGroup',
    is => 'rw'
);

sub entities
{
    my $self = shift;
    return {
        release_group => [ $self->release_group_id ],
    };
}

subtype 'ReleaseGroupHash'
    => as Dict[
        name => Optional[Str],
        type => Optional[Maybe[Int]],
        artist_credit => ArrayRef,
        comment => Optional[Maybe[Str]],
    ];

has '+data' => (
    isa => Dict[
        release_group => Int,
        new => find_type_constraint('ReleaseGroupHash'),
        old => find_type_constraint('ReleaseGroupHash'),
    ]
);

sub _mapping
{
    return (
        type => 'type_id',
        gender => 'gender_id',
        country => 'country_id',
        artist_credit => sub { artist_credit_to_ref(shift->artist_credit) }
    );
}

sub create
{
    my ($class, $release_group, $edit, %args) = @_;
    die "You must specify the release group object to edit" unless defined $release_group;

    if (!$release_group->artist_credit_loaded)
    {
        my $ac_data = MusicBrainz::Server::Data::ArtistCredit->new(c => $args{c});
        $ac_data->load($release_group);
    }

    my %mapping = $class->_mapping;
    my %old = map {
        my $mapped = exists $mapping{$_} ? $mapping{$_} : $_;
        $_ => ref $mapped eq 'CODE' ? $mapped->($release_group) : $release_group->$mapped;
    } keys %$edit;

    return $class->new(data => {
            old => \%old,
            new => $edit,
            release_group => $release_group->id
        }, %args);
};

override 'accept' => sub
{
    my $self = shift;
    my $release_group_data = MusicBrainz::Server::Data::ReleaseGroup->new(c => $self->c);
    my $ac_data = MusicBrainz::Server::Data::ArtistCredit->new(c => $self->c);

    my %data = %{ $self->data->{new} };
    $data{artist_credit} = $ac_data->find_or_insert(@{ $data{artist_credit} });
    $release_group_data->update($self->release_group_id, \%data);
};

__PACKAGE__->meta->make_immutable;
__PACKAGE__->register_type;

no Moose;
1;
