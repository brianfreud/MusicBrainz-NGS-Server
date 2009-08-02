#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 25;
use_ok 'MusicBrainz::Server::Data::Rating';

use Sql;
use MusicBrainz::Server::Test;
use MusicBrainz::Server::Data::Artist;
use MusicBrainz::Server::Entity::Artist;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, "
    SET client_min_messages TO 'warning';

    TRUNCATE artist CASCADE;
    TRUNCATE artist_meta CASCADE;
    TRUNCATE artist_name CASCADE;

    INSERT INTO artist_name (id, name) VALUES (1, 'Test');
    INSERT INTO artist (id, gid, name, sortname) VALUES
        (1, 'c09150d1-1e1b-46ad-9873-cc76d0c44499', 1, 1),
        (2, 'd09150d1-1e1b-46ad-9873-cc76d0c44499', 1, 1);

    UPDATE artist_meta SET rating=33, ratingcount=3 WHERE id=1;
    UPDATE artist_meta SET rating=50, ratingcount=1 WHERE id=2;
");
MusicBrainz::Server::Test->prepare_raw_test_database($c, "
    TRUNCATE artist_rating_raw CASCADE;
    INSERT INTO artist_rating_raw (artist, editor, rating)
        VALUES (1, 1, 50), (2, 2, 50), (1, 3, 40), (1, 4, 10);
");

my $rating_data = MusicBrainz::Server::Data::Rating->new(
    c => $c, type => 'artist');
my @ratings = $rating_data->find_by_entity_id(1);
is( scalar(@ratings), 3 );
is( $ratings[0]->editor_id, 1 );
is( $ratings[0]->rating, 50 );
is( $ratings[1]->editor_id, 3 );
is( $ratings[1]->rating, 40 );
is( $ratings[2]->editor_id, 4 );
is( $ratings[2]->rating, 10 );

# Check that it doesn't fail on an empty list
$rating_data->load_user_ratings(1);

my $artist = MusicBrainz::Server::Entity::Artist->new( id => 1 );
is($artist->user_rating, undef);
$rating_data->load_user_ratings(1, $artist);
is($artist->user_rating, 50);
$rating_data->load_user_ratings(3, $artist);
is($artist->user_rating, 40);

my $artist_data = MusicBrainz::Server::Data::Artist->new(c => $c);

# Update rating on artist with only one rating
$rating_data->update(2, 2, 40);
$artist = MusicBrainz::Server::Entity::Artist->new( id => 2 );
$rating_data->load_user_ratings(2, $artist);
is($artist->user_rating, 40);
$artist_data->load_meta($artist);
is($artist->rating, 40);

# Delete rating on artist with only one rating
$rating_data->update(2, 2, 0);
$artist = MusicBrainz::Server::Entity::Artist->new( id => 2 );
$rating_data->load_user_ratings(2, $artist);
is($artist->user_rating, undef);
$artist_data->load_meta($artist);
is($artist->rating, undef);

# Add rating
$rating_data->update(2, 1, 70);
$artist = MusicBrainz::Server::Entity::Artist->new( id => 1 );
$rating_data->load_user_ratings(2, $artist);
is($artist->user_rating, 70);
$artist_data->load_meta($artist);
is($artist->rating, 43);

# Delete rating on artist with multiple ratings
$rating_data->update(2, 1, 0);
$artist = MusicBrainz::Server::Entity::Artist->new( id => 1 );
$rating_data->load_user_ratings(2, $artist);
is($artist->user_rating, undef);
$artist_data->load_meta($artist);
is($artist->rating, 33);

my $sql = Sql->new($c->dbh);
my $raw_sql = Sql->new($c->raw_dbh);

$sql->Begin;
$raw_sql->Begin;
$rating_data->delete(1);
$sql->Commit;
$raw_sql->Commit;

@ratings = $rating_data->find_by_entity_id(1);
is( scalar(@ratings), 0 );

MusicBrainz::Server::Test->prepare_raw_test_database($c, "
    TRUNCATE artist_rating_raw CASCADE;
    INSERT INTO artist_rating_raw (artist, editor, rating)
        VALUES (1, 1, 50), (2, 1, 60), (2, 2, 70), (1, 3, 40), (1, 4, 10);
");

$sql->Begin;
$raw_sql->Begin;
$rating_data->_update_aggregate_rating(1);
$rating_data->_update_aggregate_rating(2);
$sql->Commit;
$raw_sql->Commit;

$artist = MusicBrainz::Server::Entity::Artist->new( id => 1 );
$artist_data->load_meta($artist);
is($artist->rating, 33);

$artist = MusicBrainz::Server::Entity::Artist->new( id => 2 );
$artist_data->load_meta($artist);
is($artist->rating, 65);

$sql->Begin;
$raw_sql->Begin;
$rating_data->merge(1, 2);
$sql->Commit;
$raw_sql->Commit;

$artist = MusicBrainz::Server::Entity::Artist->new( id => 1 );
$artist_data->load_meta($artist);
is($artist->rating, 43);

$rating_data->load_user_ratings(1, $artist);
is($artist->user_rating, 50);

$rating_data->load_user_ratings(2, $artist);
is($artist->user_rating, 70);
