package MusicBrainz::Server::Edit::Label::Delete;
use Moose;

use MusicBrainz::Server::Constants qw( $EDIT_LABEL_DELETE );
use MusicBrainz::Server::Data::Label;
use MusicBrainz::Server::Entity::Types;
use MooseX::Types::Moose qw( Int );
use MooseX::Types::Structured qw( Dict );

extends 'MusicBrainz::Server::Edit';

sub edit_type { $EDIT_LABEL_DELETE }
sub edit_name { "Delete Label" }

has '+data' => (
    isa => Dict[
        label => Int
    ]
);

has 'label' => (
    isa => 'Label',
    is => 'rw'
);

sub label_id
{
    return shift->data->{label};
}

sub create
{
    my ($class, $label_id, @args) = @_;
    return $class->new(data => { label => $label_id }, @args);
}

override 'accept' => sub
{
    my $self = shift;
    my $label_data = MusicBrainz::Server::Data::Label->new(c => $self->c);
    $label_data->delete($self->label_id);
};

__PACKAGE__->register_type;
__PACKAGE__->meta->make_immutable;

no Moose;
1;

