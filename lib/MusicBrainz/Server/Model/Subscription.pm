package MusicBrainz::Server::Model::Subscription;

use strict;
use warnings;

use base 'MusicBrainz::Server::Model';

use UserSubscription;

sub users_subscribed_entities
{
    my ($self, $user, $type, $page, $per_page) = @_;

    my $us = UserSubscription->new($self->context->mb->{dbh});
    $us->SetUser($user->id);

    $page ||= 1;
    $per_page ||= 50;

    use Switch;
    switch ($type)
    {
        case ('artist') { return $us->subscribed_artists($page, $per_page); }
        case ('label')  { return $us->subscribed_labels ($page, $per_page); }
    }
    
    return;
}

sub user_artist_count
{
    my ($self, $user) = @_;

    my $us = UserSubscription->new($self->context->mb->{dbh});
    $us->SetUser($user->id);

    return $us->GetNumSubscribedArtists;
}

sub user_label_count
{
    my ($self, $user) = @_;

    my $us = UserSubscription->new($self->context->mb->{dbh});
    $us->SetUser($user->id);

    return $us->GetNumSubscribedLabels;
}

sub user_editor_count
{
    my ($self, $user) = @_;

    my $us = UserSubscription->new($self->context->mb->{dbh});
    $us->SetUser($user->id);

    return $us->GetNumSubscribedEditors;
}

sub unsubscribe_from_artists
{
    my ($self, $user, $entities) = @_;

    my $us = UserSubscription->new($self->context->mb->{dbh});
    $us->SetUser($user->id);

    $us->UnsubscribeArtists(@$entities);
}

sub unsubscribe_from_labels
{
    my ($self, $user, $entities) = @_;

    my $us = UserSubscription->new($self->context->mb->{dbh});
    $us->SetUser($user->id);

    $us->UnsubscribeLabels(@$entities);
}

sub is_user_subscribed_to_entity
{
    my ($self, $user, $entity) = @_;

    my $us = UserSubscription->new($self->dbh);
    $us->SetUser($user->id);

    use Switch;
    switch ($entity->entity_type)
    {
        case ('artist') { return $us->is_subscribed_to_artist($entity); }
        case ('label')  { return $us->is_subscribed_to_artist($entity); }
    }

    return;
}

1;
