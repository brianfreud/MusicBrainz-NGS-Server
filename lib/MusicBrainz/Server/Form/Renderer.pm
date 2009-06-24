package MusicBrainz::Server::Form::Renderer;
use Moose;

use HTML::Tiny;
use Switch;

has 'h' => (
    is => 'ro',
    default => sub { HTML::Tiny->new }
);

sub render_field
{
    my ($self, $field) = @_;
    if ($field->does('MusicBrainz::Server::Form::FieldRenderer'))
    {
        $field->render($self);
    }
    else
    {
        warn "Rendering " . $field->name;
        my $render = 'render_' . $field->widget;
        $self->can($render) ? $self->$render($field) : warn "Cannot find $render";
    }
}

sub _render_input
{
    my ($self, $field, $type, %attrs) = @_;
    return $self->h->input({
            type => $type,
            id => $field->id,
            value => $field->fif,
            name => $field->full_name,
            %attrs
        });
}

sub render_text
{
    my ($self, $field, %attrs) = @_;
    return $self->_render_input($field, 'text', %attrs);
}

sub render_password
{
    my ($self, $field, %attrs) = @_;
    return $self->_render_input($field, 'password', %attrs);
}

sub render_textarea
{
    my ($self, $field, %attrs) = @_;
    return $self->h->textarea({
            name => $field->full_name,
            id => $field->id
        });
}

sub render_label
{
    my ($self, $field, %attr) = @_;
    return $self->h->label({
            id => 'label-' . $field->id,
            for => $field->id,
            class => $field->required ? "required" : undef
        }, $field->label);
}

sub render_select
{
    my ($self, $field, %attr) = @_;

    my @options = map {
        $self->h->option({
            value => $_->{value},
            selected => defined $field->value && $field->value == $_->{value} ? "selected" : undef,
        }, $_->{label})
    } @{ $field->options };
    
    if (!$field->required)
    {
        unshift @options, $self->h->option({
            selected => !defined $field->value ? "selected" : undef,
        }, ' ')
    }

    return $self->h->select({
        id => $field->id,
        name => $field->name
    }, \@options);
}

sub render_row
{
    my ($self, $field) = @_;
    return $self->h->p([
            $self->render_label($field),
            $self->h->div({ class => 'row' }, [$self->render_field($field)])
        ]);
}

sub render_submit
{
    my ($self, $label) = @_;
    return $self->h->p({ class => 'no-label' }, [
        $self->h->input({
            type => 'submit',
            value => $label
        }) ]);
}

1;
