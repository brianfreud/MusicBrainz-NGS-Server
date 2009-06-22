#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 4;

BEGIN {
    use_ok 'MusicBrainz::Server::Edit::Artist::Merge';
    use_ok 'MusicBrainz::Server::Data::Edit';
}

use MusicBrainz::Server::Data::Artist;
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;
use Sql;

my $c = MusicBrainz::Server::Context->new();
MusicBrainz::Server::Test->prepare_test_database($c);
my $artist_data = MusicBrainz::Server::Data::Artist->new(c => $c);
my $edit_data = MusicBrainz::Server::Data::Edit->new(c => $c);
my $sql = Sql->new($c->dbh);
my $sql_raw = Sql->new($c->raw_dbh);
$sql->Begin;
$sql_raw->Begin;

my $edit = MusicBrainz::Server::Edit::Artist::Merge->create(
    4, 3,
    c => $c,
    editor_id => 1
);

$edit_data->insert($edit);
$edit->accept;

my $artist = $artist_data->get_by_id(4);
ok(!defined $artist);

$artist = $artist_data->get_by_id(3);
ok(defined $artist);

$sql->Commit;
$sql_raw->Commit;
