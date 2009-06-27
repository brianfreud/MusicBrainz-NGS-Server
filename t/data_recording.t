use strict;
use warnings;
use Test::More tests => 34;
use_ok 'MusicBrainz::Server::Data::Recording';
use MusicBrainz::Server::Data::Search;

use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c);

my $rec_data = MusicBrainz::Server::Data::Recording->new(c => $c);

my $rec = $rec_data->get_by_id(1);
is ( $rec->id, 1 );
is ( $rec->gid, "123c079d-374e-4436-9448-da92dedef3ce" );
is ( $rec->name, "Dancing Queen" );
is ( $rec->artist_credit_id, 2 );
is ( $rec->length, 123456 );
is ( $rec->edits_pending, 0 );

$rec = $rec_data->get_by_gid("123c079d-374e-4436-9448-da92dedef3ce");
is ( $rec->id, 1 );
is ( $rec->gid, "123c079d-374e-4436-9448-da92dedef3ce" );
is ( $rec->name, "Dancing Queen" );
is ( $rec->artist_credit_id, 2 );
is ( $rec->length, 123456 );
is ( $rec->edits_pending, 0 );

my ($recs, $hits) = $rec_data->find_by_artist(7, 100);
is( $hits, 16 );
is( scalar(@$recs), 16 );
is( $recs->[0]->name, "A Coral Room" );
is( $recs->[1]->name, "Aerial" );
is( $recs->[14]->name, "The Painter's Link" );
is( $recs->[15]->name, "π" );

my $annotation = $rec_data->annotation->get_latest(1);
is ( $annotation->text, "Test annotation 3." );

$rec = $rec_data->get_by_gid('0986e67c-6b7a-40b7-b4ba-c9d7583d6426');
is ( $rec->id, 1 );

my $search = MusicBrainz::Server::Data::Search->new(c => $c);
my $results;
($results, $hits) = $search->search("recording", "coral", 10);
is( $hits, 1 );
is( scalar(@$results), 1 );
is( $results->[0]->position, 1 );
is( $results->[0]->entity->name, "A Coral Room" );

my $sql = Sql->new($c->mb->dbh);
$sql->Begin;
$rec = $rec_data->insert({
        name => 'Traits',
        artist_credit => 3,
        comment => 'Drum & bass track',
    });
isa_ok($rec, 'MusicBrainz::Server::Entity::Recording');
ok($rec->id > 17);

$rec = $rec_data->get_by_id($rec->id);
is($rec->name, 'Traits');
is($rec->artist_credit_id, 3);
is($rec->comment, 'Drum & bass track');
ok(defined $rec->gid);

$rec_data->update($rec, {
        name => 'Traits (remix)',
        comment => 'New remix',
    });

$rec = $rec_data->get_by_id($rec->id);
is($rec->name, 'Traits (remix)');
is($rec->comment, 'New remix');

$rec_data->delete($rec);
$rec = $rec_data->get_by_id($rec->id);
ok(!defined $rec);
$sql->Commit;
