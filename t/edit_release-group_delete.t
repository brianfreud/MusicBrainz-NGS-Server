#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 4;

BEGIN {
    use_ok 'MusicBrainz::Server::Data::Edit';
    use_ok 'MusicBrainz::Server::Edit::ReleaseGroup::Delete';
}

use MusicBrainz::Server::Data::ReleaseGroup;
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;
use Sql;

my $c = MusicBrainz::Server::Context->new();
MusicBrainz::Server::Test->prepare_test_database($c);

my $edit_data = MusicBrainz::Server::Data::Edit->new(c => $c);
my $rg_data = MusicBrainz::Server::Data::ReleaseGroup->new(c => $c);

my $sql_raw = Sql->new($c->raw_dbh);
my $sql = Sql->new($c->dbh);
$sql->Begin;
$sql_raw->Begin;

my $edit = MusicBrainz::Server::Edit::ReleaseGroup::Delete->create(
    3,
    c => $c,
    editor_id => 1
);

$edit_data->insert($edit);

my $rg = $rg_data->get_by_id(3);
ok(defined $rg);

$edit->accept;
$rg = $rg_data->get_by_id(3);
ok(!defined $rg);

$sql->Commit;
$sql_raw->Commit;

