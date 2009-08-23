#!/usr/bin/perl
use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'MusicBrainz::Server::Edit::Artist::Edit' }
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Constants qw( $EDIT_ARTIST_EDIT );
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+edit_artist_edit');
MusicBrainz::Server::Test->prepare_raw_test_database($c);

# Test creating the edit
my $artist = $c->model('Artist')->get_by_id(1);
my $edit = _create_full_edit($artist);
isa_ok($edit, 'MusicBrainz::Server::Edit::Artist::Edit');

my ($edits, $hits) = $c->model('Edit')->find({ artist => $artist->id }, 10, 0);
is($hits, 1);
is($edits->[0]->id, $edit->id);

$artist = $c->model('Artist')->get_by_id(1);
is_unchanged($artist);
is($artist->edits_pending, 1);

# Test rejecting the edit
$c->model('Edit')->reject($edit);

$artist = $c->model('Artist')->get_by_id(1);
is_unchanged($artist);
is($artist->edits_pending, 0);

# Test accepting the edit
$artist = $c->model('Artist')->get_by_id(1);
$edit = _create_full_edit($artist);

$c->model('Edit')->accept($edit);

$artist = $c->model('Artist')->get_by_id(1);
is($artist->name, 'New Name');
is($artist->sort_name, 'New Sort');
is($artist->comment, 'New comment');
is($artist->type_id, 1);
is($artist->country_id, 1);
is($artist->gender_id, 1);
is($artist->begin_date->year, 1990);
is($artist->begin_date->month, 5);
is($artist->begin_date->day, 10);
is($artist->end_date->year, 2000);
is($artist->end_date->month, 3);
is($artist->end_date->day, 20);

# Make sure we can use NULL values where possible
TODO: {
    local $TODO = 'Allow setting columns to NULL';

    $edit = $c->model('Edit')->create(
        edit_type => $EDIT_ARTIST_EDIT,
        editor_id => 2,
        artist => $artist,

        comment => undef,
        type_id => undef,
        gender_id => undef,
        country_id => undef,
        begin_date => { year => undef, month => undef, day => undef },
        end_date => { year => undef, month => undef, day => undef },
    );

    $c->model('Edit')->accept($edit);
    $artist = $c->model('Artist')->get_by_id(1);
    is($artist->country_id, undef);
    is($artist->gender_id, undef);
    is($artist->type_id, undef);
    ok($artist->begin_date->is_empty);
    ok($artist->end_date->is_empty);
}

# Test loading entities for the edit
$edit = $c->model('Edit')->get_by_id($edit->id);
$c->model('Edit')->load_all($edit);
ok(defined $edit->artist);
is($edit->artist->id, $edit->artist_id);

done_testing;

sub _create_full_edit {
    my $artist = shift;
    return $c->model('Edit')->create(
        edit_type => $EDIT_ARTIST_EDIT,
        editor_id => 2,
        artist => $artist,

        name => 'New Name',
        sort_name => 'New Sort',
        comment => 'New comment',
        begin_date => { year => 1990, month => 5, day => 10 },
        end_date => { year => 2000, month => 3, day => 20 },
        type_id => 1,
        gender_id => 1,
        country_id => 1,
    );
}

sub is_unchanged {
    my $artist = shift;
    is($artist->name, 'Artist Name');
    is($artist->sort_name, 'Artist Name');
    is($artist->$_, undef) for qw( type_id country_id gender_id comment );
    ok($artist->begin_date->is_empty);
    ok($artist->end_date->is_empty);
}
