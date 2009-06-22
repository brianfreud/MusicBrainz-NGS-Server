package MusicBrainz::Server::Edit::Artist::Merge;
use Moose;

use MusicBrainz::Server::Constants qw( $EDIT_ARTIST_MERGE );
use MusicBrainz::Server::Data::Artist;
use MooseX::Types::Moose qw( Int );
use MooseX::Types::Structured qw( Dict );

extends 'MusicBrainz::Server::Edit';

sub edit_type { $EDIT_ARTIST_MERGE }
sub edit_name { "Merge Artists" }

sub old_artist_id
{
    return shift->data->{old_artist};
}

sub new_artist_id
{
    return shift->data->{new_artist};
}

has [qw( old_artist new_artist )] => (
    isa => 'Artist',
    is => 'rw'
);

has '+data' => (
    isa => Dict[
        new_artist => Int,
        old_artist => Int,
    ]
);

sub create
{
    my ($class, $old_artist, $new_artist, @args) = @_;
    return $class->new(data => { old_artist => $old_artist, new_artist => $new_artist }, @args);
}

override 'accept' => sub
{
    my $self = shift;
    my $artist_data = MusicBrainz::Server::Data::Artist->new(c => $self->c);
    my $artist = $artist_data->merge($self->old_artist_id => $self->new_artist_id);
};

__PACKAGE__->register_type;
__PACKAGE__->meta->make_immutable;
no Moose;

1;
