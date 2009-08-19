#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 80;
use Test::Moose;
use_ok 'MusicBrainz::Server::Data::Artist';
use MusicBrainz::Server::Data::Search;

use DateTime;
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;
use Sql;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+data_artist');

my $sql = Sql->new($c->dbh);
my $raw_sql = Sql->new($c->raw_dbh);
$sql->Begin;
$raw_sql->Begin;

my $artist_data = MusicBrainz::Server::Data::Artist->new(c => $c);
does_ok($artist_data, 'MusicBrainz::Server::Data::Editable');


# ----
# Test fetching artists:

# An artist with all attributes populated
my $artist = $artist_data->get_by_id(1);
is ( $artist->id, 1 );
is ( $artist->gid, "745c079d-374e-4436-9448-da92dedef3ce" );
is ( $artist->name, "Test Artist" );
is ( $artist->sort_name, "Artist, Test" );
is ( $artist->begin_date->year, 2008 );
is ( $artist->begin_date->month, 1 );
is ( $artist->begin_date->day, 2 );
is ( $artist->end_date->year, 2009 );
is ( $artist->end_date->month, 3 );
is ( $artist->end_date->day, 4 );
is ( $artist->edits_pending, 0 );
is ( $artist->comment, 'Yet Another Test Artist' );

# Test loading metadata
$artist_data->load_meta($artist);
is ( $artist->rating, 70 );
is ( $artist->rating_count, 4 );
is_deeply ( $artist->last_update_date,
     DateTime->new(year => 2009, month => 7, day => 9,
                   hour => 20, minute => 40, second => 30) );

# An artist with the minimal set of required attributes
$artist = $artist_data->get_by_id(2);
is ( $artist->id, 2 );
is ( $artist->gid, "945c079d-374e-4436-9448-da92dedef3cf" );
is ( $artist->name, "Minimal Artist" );
is ( $artist->sort_name, "Minimal Artist" );
is ( $artist->begin_date->year, undef );
is ( $artist->begin_date->month, undef );
is ( $artist->begin_date->day, undef );
is ( $artist->end_date->year, undef );
is ( $artist->end_date->month, undef );
is ( $artist->end_date->day, undef );
is ( $artist->edits_pending, 0 );
is ( $artist->comment, undef );

# ---
# Test annotations

# Fetching annotations
my $annotation = $artist_data->annotation->get_latest(1);
like ( $annotation->text, qr/Test annotation 1/ );

# Merging annotations
$artist_data->annotation->merge(2, 1);
$annotation = $artist_data->annotation->get_latest(1);
ok(!defined $annotation);

$annotation = $artist_data->annotation->get_latest(2);
like ( $annotation->text, qr/Test annotation 1/ );

TODO: {
    local $TODO = 'Merging annotations should concatenate or combine them';
    like($annotation->text, qr/Test annotation 1.*Test annotation 7/s);
}

# Deleting annotations
$artist_data->annotation->delete(2);
$annotation = $artist_data->annotation->get_latest(2);
ok(!defined $annotation);

$sql->Commit;
$raw_sql->Commit;

# ---
# Searching for artists
my $search = MusicBrainz::Server::Data::Search->new(c => $c);
my ($results, $hits) = $search->search("artist", "test", 10);
is( $hits, 1 );
is( scalar(@$results), 1 );
is( $results->[0]->position, 1 );
is( $results->[0]->entity->name, "Test Artist" );
is( $results->[0]->entity->sort_name, "Artist, Test" );

$sql->Begin;
$raw_sql->Begin;

# ---
# Find/insert artist names
my %names = $artist_data->find_or_insert_names('Test Artist', 'Minimal Artist',
                                               'Massive Attack');
is(keys %names, 3);
is($names{'Test Artist'}, 1);
is($names{'Minimal Artist'}, 3);
ok($names{'Massive Attack'} > 3);

# ---
# Creating new artists
$artist = $artist_data->insert({
        name => 'New Artist',
        sort_name => 'Artist, New',
        comment => 'Artist comment',
        country_id => 1,
        type_id => 1,
        gender_id => 1,
        begin_date => { year => 2000, month => 1, day => 2 },
        end_date => { year => 1999, month => 3, day => 4 },
    });
isa_ok($artist, 'MusicBrainz::Server::Entity::Artist');
ok($artist->id > 2);

$artist = $artist_data->get_by_id($artist->id);
is($artist->name, 'New Artist');
is($artist->sort_name, 'Artist, New');
is($artist->begin_date->year, 2000);
is($artist->begin_date->month, 1);
is($artist->begin_date->day, 2);
is($artist->end_date->year, 1999);
is($artist->end_date->month, 3);
is($artist->end_date->day, 4);
is($artist->type_id, 1);
is($artist->gender_id, 1);
is($artist->country_id, 1);
is($artist->comment, 'Artist comment');
ok(defined $artist->gid);

# ---
# Updating artists
$artist_data->update($artist->id, {
        name => 'Updated Artist',
        sort_name => 'Artist, Updated',
        begin_date => { year => 1995, month => 4, day => 22 },
        end_date => { year => 1990, month => 6, day => 17 },
        type_id => 2,
        gender_id => 2,
        country_id => 2,
        comment => 'Updated comment',
    });

$artist = $artist_data->get_by_id($artist->id);
is($artist->name, 'Updated Artist');
is($artist->sort_name, 'Artist, Updated');
is($artist->begin_date->year, 1995);
is($artist->begin_date->month, 4);
is($artist->begin_date->day, 22);
is($artist->end_date->year, 1990);
is($artist->end_date->month, 6);
is($artist->end_date->day, 17);
is($artist->type_id, 2);
is($artist->gender_id, 2);
is($artist->country_id, 2);
is($artist->comment, 'Updated comment');

$artist_data->update($artist->id, {
        type_id => undef,
    });
$artist = $artist_data->get_by_id($artist->id);
is($artist->type_id, undef);

$artist_data->delete($artist->id);
$artist = $artist_data->get_by_id($artist->id);
ok(!defined $artist);

# ---
# Gid redirections
$artist = $artist_data->get_by_gid('a4ef1d08-962e-4dd6-ae14-e42a6a97fc11');
is ( $artist->id, 1 );

$artist_data->remove_gid_redirects(1);
$artist = $artist_data->get_by_gid('a4ef1d08-962e-4dd6-ae14-e42a6a97fc11');
ok(!defined $artist);

$artist_data->add_gid_redirects(
    '20bb5c20-5dbf-11de-8a39-0800200c9a66' => 1,
    '2adff2b0-5dbf-11de-8a39-0800200c9a66' => 2,
);

$artist = $artist_data->get_by_gid('20bb5c20-5dbf-11de-8a39-0800200c9a66');
is($artist->id, 1);

$artist = $artist_data->get_by_gid('2adff2b0-5dbf-11de-8a39-0800200c9a66');
is($artist->id, 2);

$artist_data->update_gid_redirects(1, 2);

$artist = $artist_data->get_by_gid('2adff2b0-5dbf-11de-8a39-0800200c9a66');
is($artist->id, 1);

$artist_data->merge(1, 2);
$artist = $artist_data->get_by_id(2);
ok(!defined $artist);

$artist = $artist_data->get_by_id(1);
ok(defined $artist);
is($artist->name, 'Test Artist');

$sql->Commit;
$raw_sql->Commit;
