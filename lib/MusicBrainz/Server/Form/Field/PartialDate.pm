package MusicBrainz::Server::Form::Field::PartialDate;
use HTML::FormHandler::Moose;

extends 'HTML::FormHandler::Field::Compound';
with 'MusicBrainz::Server::Form::FieldRenderer';

has_field 'year' => (
    type => 'Integer',
    required => 1,
);

has_field 'month' => (
    type => 'Integer',
    range_start => 1,
    range_end => 12,
);

has_field 'day' => (
    type => 'Integer',
    range_start => 1,
    range_end => 31,
);

sub render
{
    my ($self, $renderer) = @_;
    return (
        $renderer->render_text($self->field('year'), size => 4), ' - ',
        $renderer->render_text($self->field('month'), size => 2), ' - ',
        $renderer->render_text($self->field('day'), size => 2),
    );
}

1;
