package MusicBrainz::Server::Edit::Artist::AddAnnotation;
use Moose;

use MusicBrainz::Server::Constants qw( $EDIT_ARTIST_ADD_ANNOTATION );

extends 'MusicBrainz::Server::Edit::Annotation::Edit';

sub edit_name { 'Add artist annotation' }
sub edit_type { $EDIT_ARTIST_ADD_ANNOTATION }

sub related_entities { { artist => [ shift->artist_id ] } }
sub models { [qw( Artist )] }

sub _model { 'Artist' }
sub _type { 'artist' }

has 'artist_id' => (
    isa => 'Int',
    is => 'rw',
    lazy => 1,
    default => sub { shift->data->{entity_id} }
);

has 'artist' => (
    isa => 'Artist',
    is => 'rw',
);

sub initialize
{
    my ($self, %opts) = @_;
    $opts{entity_id} = delete $opts{artist_id};
    $self->data({
        %opts,
        editor_id => $self->editor_id,
    });
}

__PACKAGE__->register_type;
__PACKAGE__->meta->make_immutable;
no Moose;

1;
