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

sub text
{
    my ($self, $field_name, $attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->_render_input($field, 'text', %$attrs);
}

sub password
{
    my ($self, $field_name, $attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->_render_input($field, 'password', %$attrs);
}

sub textarea
{
    my ($self, $field_name, $attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->h->textarea({
            name => $field->full_name,
            id => $field->id,
            %$attrs
        });
}

sub label
{
    my ($self, $field_name, $label, $attrs) = @_;
    my $fake_label = delete $attrs->{fake};
    if ($fake_label)
    {
        return $self->h->div({
            class => 'label',
            %$attrs
        }, $label);
    }
    else
    {
        my $field = $self->_lookup_field($field_name);
        return $self->h->label({
            id => 'label-' . $field->id,
            for => $field->id,
            class => $field->required ? "required" : undef,
            %$attrs
        }, $label);
    }
}

sub inline_label
{
    my ($self, $field_name, $label, $attrs) = @_;
    my $class = delete $attrs->{class} || '';
    return $self->label($field_name, $label, { class => "inline $class", %$attrs });
}

sub select
{
    my ($self, $field_name, $attrs) = @_;
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
        name => $field->name,
        %{ $attrs || {} }
    }, \@options);
}

sub checkbox
{
    my ($self, $field_name, $attrs) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->_render_input($field, 'checkbox',
        checked => $field->value ? "checked" : undef,
        %$attrs
    );
}

sub date
{
    my ($self, $field_name) = @_;
    my $field = $self->_lookup_field($field_name) or return;
    return $self->h->span({ class => 'partial-date' }, [
        $self->render_text($field->field('year'), size => 4), ' - ',
        $self->render_text($field->field('month'), size => 2), ' - ',
        $self->render_text($field->field('day'), size => 2),
    ]);
}

1;
