package MusicBrainz::Server::Edit::Artist::Delete;
use Moose;

use MusicBrainz::Server::Constants qw( $EDIT_ARTIST_DELETE );
use MusicBrainz::Server::Data::Artist;
use MooseX::Types::Moose qw( Int );
use MooseX::Types::Structured qw( Dict );

extends 'MusicBrainz::Server::Edit';

sub edit_type { $EDIT_ARTIST_DELETE }
sub edit_name { "Delete Artist" }

has '+data' => (
    isa => Dict[
        artist => Int
    ]
);

sub create
{
    my ($class, $artist_id, @args) = @_;
    return $class->new(data => { artist => $artist_id }, @args);
}

override 'accept' => sub
{
    my $self = shift;
    my $artist_data = MusicBrainz::Server::Data::Artist->new(c => $self->c);
    $artist_data->delete($self->data->{artist});
};

__PACKAGE__->register_type;
__PACKAGE__->meta->make_immutable;

no Moose;
1;

