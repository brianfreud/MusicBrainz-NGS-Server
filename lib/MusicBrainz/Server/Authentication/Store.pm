package MusicBrainz::Server::Authentication::Store;

use strict;
use warnings;

use MusicBrainz::Server::Entity::Editor;
use UserPreference;

sub new
{
    my ($class, $config, $app, $realm) = @_;
    bless { }, $class;
}

sub find_user
{
    my ($self, $authinfo, $c) = @_;
    return $c->model('Editor')->get_by_name($authinfo->{username});
}

sub for_session
{
    my ($self, $c, $user) = @_;

    return {
        'id' => $user->id,
        'name' => $user->name,
    };
}

sub from_session
{
    my ($self, $c, $frozen) = @_;

    my $user = MusicBrainz::Server::Entity::Editor->new(
        id => $frozen->{id},
        name => $frozen->{name}
    );

    return $user;
}

1;
