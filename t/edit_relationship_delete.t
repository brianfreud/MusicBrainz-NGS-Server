#!/usr/bin/perl
use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'MusicBrainz::Server::Edit::Relationship::Delete' }

use MusicBrainz::Server::Context;
use MusicBrainz::Server::Constants qw( $EDIT_RELATIONSHIP_DELETE );
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+edit_relationship_delete');
MusicBrainz::Server::Test->prepare_raw_test_database($c);

my $rel = $c->model('Relationship')->get_by_id('artist', 'artist', 1);
is($rel->edits_pending, 0);

my $edit = _create_edit();
isa_ok($edit, 'MusicBrainz::Server::Edit::Relationship::Delete');

my ($edits, $hits) = $c->model('Edit')->find({ artist => 1 }, 10, 0);
is($hits, 1);
is($edits->[0]->id, $edit->id);

($edits, $hits) = $c->model('Edit')->find({ artist => 2 }, 10, 0);
is($hits, 1);
is($edits->[0]->id, $edit->id);

$rel = $c->model('Relationship')->get_by_id('artist', 'artist', 1);
is($rel->edits_pending, 1);

# Test rejecting the edit
$c->model('Edit')->reject($edit);
$rel = $c->model('Relationship')->get_by_id('artist', 'artist', 1);
ok(defined $rel);
is($rel->edits_pending, 0);

# Test accepting the edit
$edit = _create_edit();
$c->model('Edit')->accept($edit);
$rel = $c->model('Relationship')->get_by_id('artist', 'artist', 1);
ok(!defined $rel);

done_testing;

sub _create_edit {
    my $rel = $c->model('Relationship')->get_by_id('artist', 'artist', 1);
    return $c->model('Edit')->create(
        edit_type => $EDIT_RELATIONSHIP_DELETE,
        editor_id => 1,
        type0 => 'artist',
        type1 => 'artist',
        relationship => $rel
    );
}

