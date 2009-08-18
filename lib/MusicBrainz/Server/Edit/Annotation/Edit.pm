package MusicBrainz::Server::Edit::Annotation::Edit;
use Moose;

use Moose::Util::TypeConstraints qw( enum );
use MooseX::Types::Moose qw( Int Str );
use MooseX::Types::Structured qw( Dict );

extends 'MusicBrainz::Server::Edit';

sub edit_auto_edit { 1 }

has '+data' => (
    isa => Dict[
        editor_id => Int,
        text => Str,
        changelog => Str,
        entity_id => Int,
    ],
);

sub accept
{
    my $self = shift;
    my %data = %{ $self->data };
    $data{ $self->_id_key } = delete $data{entity_id};
    $self->c->model($self->_model)->annotation->edit(\%data);
}

sub _type  { die 'Not implemented' }
sub _model { die 'Not implemented' }

sub _id_key
{
    my $class = shift;
    return $class->_type . '_id';
}

__PACKAGE__->meta->make_immutable;
no Moose;

1;
