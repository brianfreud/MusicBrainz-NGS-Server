use strict;
use warnings;
use Test::More tests => 5;
use_ok 'MusicBrainz::Server::Entity::Work';
use_ok 'MusicBrainz::Server::Entity::WorkType';
use_ok 'MusicBrainz::Server::Entity::WorkAlias';

my $work = MusicBrainz::Server::Entity::Work->new();

is( $work->type_name, undef );
$work->type(MusicBrainz::Server::Entity::WorkType->new(id => 1, name => 'Composition'));
is( $work->type_name, 'Composition' );
