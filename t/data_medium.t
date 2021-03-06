use strict;
use warnings;
use Test::More tests => 24;
use_ok 'MusicBrainz::Server::Data::Medium';

use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+tracklist');

my $medium_data = MusicBrainz::Server::Data::Medium->new(c => $c);

my $medium = $medium_data->get_by_id(1);
is ( $medium->id, 1 );
is ( $medium->tracklist_id, 1 );
is ( $medium->tracklist->track_count, 7 );
is ( $medium->release_id, 1 );
is ( $medium->position, 1 );
is ( $medium->name, 'A Sea of Honey' );
is ( $medium->format_id, 1 );

$medium = $medium_data->get_by_id(2);
is ( $medium->id, 2 );
is ( $medium->tracklist_id, 2 );
is ( $medium->tracklist->track_count, 9 );
is ( $medium->release_id, 1 );
is ( $medium->position, 2 );
is ( $medium->name, 'A Sky of Honey' );
is ( $medium->format_id, 1 );

my ($results, $hits) = $medium_data->find_by_tracklist(1, 10, 0);
is( $hits, 2 );
is ( scalar @$results, 2 );
is( $results->[0]->id, 1 );
is( $results->[0]->release->name, 'Aerial' );
is( $results->[0]->position, 1 );
is( $results->[1]->id, 3 );
is( $results->[1]->release->name, 'Aerial' );
is( $results->[1]->position, 1 );

# just check that it doesn't die
ok( !$medium_data->load() );
