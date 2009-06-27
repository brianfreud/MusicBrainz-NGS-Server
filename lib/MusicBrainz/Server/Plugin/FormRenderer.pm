package MusicBrainz::Server::Plugin::FormRenderer;

use strict;
use warnings;

use base 'Template::Plugin';

use Carp;
use HTML::Tiny;

sub new
{
    my ($class, $context, $form) = @_;
    warn "Created";
    return bless {
        form => $form,
        h => HTML::Tiny->new
    }, $class;
}

sub form
{
    my $self = shift;
    return $self->{form};
}

sub h
{
    my $self = shift;
    return $self->{h};
}

sub _lookup_field
{
    my ($self, $field_name) = @_;
    return $self->form->field($field_name);
}

sub render_field
{
    my ($self, $field_name, %attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    if ($field->does('MusicBrainz::Server::Form::FieldRenderer'))
    {
        $field->render($self);
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
    my ($self, $field_name, %attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->_render_input($field, 'text', %attrs);
}

sub render_password
{
    my ($self, $field_name, %attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->_render_input($field, 'password', %attrs);
}

sub render_textarea
{
    my ($self, $field_name, %attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->h->textarea({
            name => $field->full_name,
            id => $field->id,
            %attrs
        });
}

sub render_label
{
    my ($self, $field_name, %attr) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->h->label({
            id => 'label-' . $field->id,
            for => $field->id,
            class => $field->required ? "required" : undef
        }, $field->label);
}

sub render_select
{
    my ($self, $field_name, %attr) = @_;
    my $field = $self->_lookup_field($field_name) or return;

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
    my ($self, $field_name, $type, %attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    my $renderer = "render_$type";
    $self->can($renderer) or croak "No renderer $renderer";
    return $self->h->p([
        $self->render_label($field_name),
        $self->$renderer($field_name, %attrs),
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
