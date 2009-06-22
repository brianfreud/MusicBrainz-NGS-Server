package MusicBrainz::Server::Edit::ReleaseGroup::Merge;
use Moose;

use MusicBrainz::Server::Constants qw( $EDIT_RELEASEGROUP_MERGE );
use MusicBrainz::Server::Data::ReleaseGroup;
use MooseX::Types::Moose qw( Int );
use MooseX::Types::Structured qw( Dict );

extends 'MusicBrainz::Server::Edit';

sub edit_name { "Merge Release Groups" }
sub edit_type { $EDIT_RELEASEGROUP_MERGE }

sub old_release_group_id { shift->data->{old_group} }
sub new_release_group_id { shift->data->{new_group} }

has [qw( old_release_group new_release_group )] => (
    isa => 'ReleaseGroup',
    is => 'rw',
);

has '+data' => (
    isa => Dict[
        old_group => Int,
        new_group => Int,
    ]
);

sub create
{
    my ($class, $old_id, $new_id, %args) = @_;
    return $class->new(data => { old_group => $old_id, new_group => $new_id }, %args);
}

override 'accept' => sub
{
    my ($self) = @_;
    my $data = MusicBrainz::Server::Data::ReleaseGroup->new(c => $self->c);
    $data->merge($self->old_release_group_id, $self->new_release_group_id);
};

__PACKAGE__->register_type;
__PACKAGE__->meta->make_immutable;

no Moose;
1;
