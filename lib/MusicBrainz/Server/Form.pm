package MusicBrainz::Server::Form;
use HTML::FormHandler::Moose;

use MusicBrainz::Server::Form::Renderer;

extends 'HTML::FormHandler';

has 'renderer' => (
    is => 'ro',
    default => sub { MusicBrainz::Server::Form::Renderer->new },
    handles => [ 'render_submit' ]
);

sub render_field
{
    my ($self, $field_name) = @_;
    my $field = $self->field($field_name) or return;
    $self->renderer->render_field($field);
}

sub render_row
{
    my ($self, $field_name) = @_;
    my $field = $self->field($field_name) or return;
    $self->renderer->render_row($field);
}

1;
