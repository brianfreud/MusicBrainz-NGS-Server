package MusicBrainz::Server::Controller::Annotation;

use strict;
use warnings;

use base 'MusicBrainz::Server::Controller';

sub latest : Chained('/') PathPart('annotation') CaptureArgs(2)
{
    my ($self, $c, $type, $gid) = @_;

    my $entity = $c->model($type)->get_by_gid($gid);
    my $annotation = $c->model($type)->annotation->get_latest($entity->id);

    $c->stash(
        annotation => $annotation,
        entity => $entity
    );
}

sub view : Chained('latest') PathPart('') { }

sub for_entity : Chained('/') PathPart('annotation') CaptureArgs(2)
{
    my ($self, $c, $type, $id) = @_;
    $c->stash->{entity} = $c->model(ucfirst $type)->load($id);
}

sub edit : Chained('for_entity') PathPart('edit') Form('Annotation::Edit')
{
    my ($self, $c, $revision) = @_;

    my $latest = $c->model('Annotation')->load_revision($c->stash->{entity}, $revision);
    my $form   = $self->form;

    $form->field('annotation')->value($latest->text)
        if $latest;

    return unless $self->submit_and_validate($c);

    $c->model('Annotation')->update_annotation($c->stash->{entity}, $form->value('annotation') || '',
        $form->value('change_log'), $form->value('edit_note'));
}

sub history : Chained('for_entity') PathPart
{
    my ($self, $c) = @_;
    $c->stash->{annotations} = $c->model('Annotation')->load_all($c->stash->{entity});
}

1;
