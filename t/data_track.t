use strict;
use warnings;
use Test::More;
use_ok 'MusicBrainz::Server::Data::Track';

use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+tracklist');

my $track_data = MusicBrainz::Server::Data::Track->new(c => $c);

my $track = $track_data->get_by_id(1);
is ( $track->id, 1 );
is ( $track->name, "King of the Mountain" );
is ( $track->recording_id, 1 );
is ( $track->artist_credit_id, 1 );
is ( $track->position, 1 );

$track = $track_data->get_by_id(3);
is ( $track->id, 3 );
is ( $track->name, "Bertie" );
is ( $track->recording_id, 3 );
is ( $track->artist_credit_id, 1 );
is ( $track->position, 3 );

ok( !$track_data->load() );

my ($tracks, $hits) = $track_data->find_by_recording(1, 10);
is( $hits, 2 );
is( scalar(@$tracks), 2 );
is( $tracks->[0]->id, 1 );
is( $tracks->[0]->position, 1 );
is( $tracks->[0]->tracklist->id, 1 );
is( $tracks->[0]->tracklist->track_count, 7 );
is( $tracks->[0]->tracklist->medium->id, 1 );
is( $tracks->[0]->tracklist->medium->name, "A Sea of Honey" );
is( $tracks->[0]->tracklist->medium->position, 1 );
is( $tracks->[0]->tracklist->medium->release->id, 1 );
is( $tracks->[0]->tracklist->medium->release->name, "Aerial" );
is( $tracks->[1]->id, 1 );
is( $tracks->[1]->position, 1 );
is( $tracks->[1]->tracklist->id, 1 );
is( $tracks->[1]->tracklist->track_count, 7 );
is( $tracks->[1]->tracklist->medium->id, 3 );
is( $tracks->[1]->tracklist->medium->name, "A Sea of Honey" );
is( $tracks->[1]->tracklist->medium->position, 1 );
is( $tracks->[1]->tracklist->medium->release->id, 2 );
is( $tracks->[1]->tracklist->medium->release->name, "Aerial" );

my %names = $track_data->find_or_insert_names('Nocturn', 'Traits');
is(keys %names, 2);
is($names{'Nocturn'}, 15);
ok($names{'Traits'} > 16);

$track = $track_data->insert({
    tracklist_id => 1,
    recording_id => 2,
    name => 'Test track!',
    artist_credit => 1,
    length => 500,
    position => 8,
});


ok(defined $track);
ok($track->id > 0);

$track = $track_data->get_by_id($track->id);
is($track->position, 8);
is($track->tracklist_id, 1);
is($track->artist_credit_id, 1);
is($track->recording_id, 2);
is($track->length, 500);
is($track->name, "Test track!");

my $sql = Sql->new($c->dbh);
Sql::RunInTransaction(sub {
    $track_data->delete($track->id);
    $track = $track_data->get_by_id($track->id);
    ok(!defined $track);
}, $sql);

done_testing;
