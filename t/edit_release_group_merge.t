#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 10;

BEGIN { use_ok 'MusicBrainz::Server::Edit::ReleaseGroup::Merge' }
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Constants qw( $EDIT_RELEASEGROUP_MERGE );
use MusicBrainz::Server::Data::ReleaseGroup;
use MusicBrainz::Server::Data::Edit;
use MusicBrainz::Server::Test;
use Sql;

my $c = MusicBrainz::Server::Context->new();
MusicBrainz::Server::Test->prepare_test_database($c);

my $sql = Sql->new($c->dbh);
my $sql_raw = Sql->new($c->raw_dbh);
$sql->Begin;
$sql_raw->Begin;

my $rg_data = MusicBrainz::Server::Data::ReleaseGroup->new(c => $c);
my $edit_data = MusicBrainz::Server::Data::Edit->new(c => $c);

my $edit = $edit_data->create(
    edit_type => $EDIT_RELEASEGROUP_MERGE,
    old_release_group_id => 2,
    new_release_group_id => 1,
    editor_id => 2,
);
isa_ok($edit, 'MusicBrainz::Server::Edit::ReleaseGroup::Merge');
is($edit->entity_model, 'ReleaseGroup');
is($edit->entity_id, 2);
is_deeply($edit->entities, { release_group => [ 2, 1 ] });

my $rg = $rg_data->get_by_id(2);
ok(defined $rg);
is($rg->edits_pending, 1);

$edit_data->accept($edit);

$rg = $rg_data->get_by_id(2);
ok(!defined $rg);

$rg = $rg_data->get_by_id(1);
ok(defined $rg);
is($rg->edits_pending, 0);

$sql->Commit;
$sql_raw->Commit;
