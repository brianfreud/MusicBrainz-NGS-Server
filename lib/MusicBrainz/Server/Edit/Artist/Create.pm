package MusicBrainz::Server::Edit::Artist::Create;
use Moose;

use MooseX::Types::Moose qw( Int Str );
use MooseX::Types::Structured qw( Dict Optional );
use MusicBrainz::Server::Constants qw( $EDIT_ARTIST_CREATE );
use MusicBrainz::Server::Data::Artist;
use MusicBrainz::Server::Types qw( :edit_status );

extends 'MusicBrainz::Server::Edit';

sub edit_type { $EDIT_ARTIST_CREATE }
sub edit_name { "Create Artist" }

has 'artist_id' => (
    isa => 'Int',
    is  => 'rw'
);

has 'artist' => (
    isa => 'Artist',
    is => 'rw'
);

has '+data' => (
    isa => Dict[
        name => Str,
        sort_name => Optional[Str],
        gender => Optional[Int],
        country => Optional[Int],
        comment => Optional[Str],
    ]
);

before 'insert' => sub
{
    my $self = shift;
    my %data = %{ $self->data };
    $data{sort_name} ||= $data{name};

    my $artist_data = MusicBrainz::Server::Data::Artist->new(c => $self->c);
    my $artist = $artist_data->insert( \%data );

    $self->artist($artist);
    $self->artist_id($artist->id);
};

sub accept
{
    return $STATUS_APPLIED;
}

sub reject
{
}

around 'to_hash' => sub
{
    my ($orig, $self) = @_;
    my $hash = $self->$orig;
    $hash->{artist_id} = $self->artist_id;
    return $hash;
};

before 'restore' => sub
{
    my ($self, $hash) = @_;
    $self->artist_id(delete $hash->{artist_id});
};

__PACKAGE__->meta->make_immutable;
__PACKAGE__->register_type;

no Moose;

1;

