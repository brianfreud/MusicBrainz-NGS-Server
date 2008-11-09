package MusicBrainz::Server::Form::Artist::RemoveAlias;

use strict;
use warnings;

use base 'MusicBrainz::Server::Form::Confirm';

sub remove_from
{
    my ($self, $artist) = @_;

    $self->context->model('Artist')->remove_alias(
        $artist,
        $self->item,
        $self->value('edit_note')
    );
}

1;
