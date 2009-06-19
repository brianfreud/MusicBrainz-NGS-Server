#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 5;

BEGIN {
    use_ok 'MusicBrainz::Server::Data::Edit';
    use_ok 'MusicBrainz::Server::Edit::Artist::Delete';
}

use MusicBrainz::Server::Data::Artist;
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;
use Sql;

my $c = MusicBrainz::Server::Context->new();
MusicBrainz::Server::Test->prepare_test_database($c);

my $edit_data = MusicBrainz::Server::Data::Edit->new(c => $c);
my $artist_data = MusicBrainz::Server::Data::Artist->new(c => $c);

my $sql_raw = Sql->new($c->raw_dbh);
my $sql = Sql->new($c->dbh);
$sql->Begin;
$sql_raw->Begin;

my $edit = MusicBrainz::Server::Edit::Artist::Delete->create(
    3,
    c => $c,
    editor_id => 1
);

$edit_data->insert($edit);

my $artist = $artist_data->get_by_id(3);
ok(defined $artist);

$edit->accept;
$artist = $artist_data->get_by_id(3);
ok(!defined $artist);

$sql->Commit;
$sql_raw->Commit;
