#!/usr/bin/perl
use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'MusicBrainz::Server::Edit::ReleaseGroup::Delete'; }

use MusicBrainz::Server::Context;
use MusicBrainz::Server::Constants qw( $EDIT_RELEASEGROUP_DELETE );
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+edit_rg_delete');
MusicBrainz::Server::Test->prepare_raw_test_database($c);

my $edit = create_edit();
isa_ok($edit, 'MusicBrainz::Server::Edit::ReleaseGroup::Delete');

my ($edits) = $c->model('Edit')->find({ release_group => 1 }, 0, 10);
is($edits->[0]->id, $edit->id);

$edit = $c->model('Edit')->get_by_id($edit->id);
$c->model('Edit')->load_all($edit);
is($edit->release_group_id, 1);
is($edit->release_group->id, 1);
is($edit->release_group->edits_pending, 1);

$c->model('Edit')->reject($edit);
my $rg = $c->model('ReleaseGroup')->get_by_id(1);
ok(defined $rg);
is($rg->edits_pending, 0);

$edit = create_edit();
$c->model('Edit')->accept($edit);
$rg = $c->model('ReleaseGroup')->get_by_id(1);
ok(!defined $rg);

done_testing;

sub create_edit {
    return $c->model('Edit')->create(
        edit_type => $EDIT_RELEASEGROUP_DELETE,
        editor_id => 1,
        release_group_id => 1,
    );
}
