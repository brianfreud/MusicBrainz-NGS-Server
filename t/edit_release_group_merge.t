#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 3;

BEGIN { use_ok 'MusicBrainz::Server::Edit::ReleaseGroup::Merge' }
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Data::ReleaseGroup;
use MusicBrainz::Server::Data::Edit;
use MusicBrainz::Server::Test;
use Sql;

my $c = MusicBrainz::Server::Context->new();
MusicBrainz::Server::Test->prepare_test_database($c);

my $sql = Sql->new($c->dbh);
$sql->Begin;

my $rg_data = MusicBrainz::Server::Data::ReleaseGroup->new(c => $c);
my $edit_data = MusicBrainz::Server::Data::Edit->new(c => $c);

my $edit = MusicBrainz::Server::Edit::ReleaseGroup::Merge->create(
    2, 1,
    editor_id => 2,
    c => $c);

$edit->accept;

my $rg = $rg_data->get_by_id(2);
ok(!defined $rg);

$rg = $rg_data->get_by_id(1);
ok(defined $rg);

$sql->Commit;
