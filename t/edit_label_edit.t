#!/usr/bin/perl
use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'MusicBrainz::Server::Edit::Label::Edit' }

use MusicBrainz::Server::Context;
use MusicBrainz::Server::Constants qw( $EDIT_LABEL_EDIT );
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+edit_label_delete');
MusicBrainz::Server::Test->prepare_raw_test_database($c);

my $label = $c->model('Label')->get_by_id(1);
my $edit = create_full_edit($label);

isa_ok($edit, 'MusicBrainz::Server::Edit::Label::Edit');

$edit = $c->model('Edit')->get_by_id($edit->id);
$c->model('Edit')->load_all($edit);
is($edit->label_id, $label->id);
is($edit->label->id, $label->id);
is_unchanged($edit->label);
is($edit->label->edits_pending, 1);

my ($edits, $hits) = $c->model('Edit')->find({ label => $edit->label_id }, 0, 10);
is($edits->[0]->id, $edit->id);

$c->model('Edit')->reject($edit);
$label = $c->model('Label')->get_by_id($edit->label_id);
is_unchanged($label);
is($label->edits_pending, 0);

$edit = create_full_edit($label);
$c->model('Edit')->accept($edit);

$label = $c->model('Label')->get_by_id($edit->label_id);
is($label->name, 'Edit Name');
is($label->sort_name, 'Edit Sort');
is($label->type_id, 1);
is($label->comment, "Edit comment");
is($label->label_code, 12345);
is($label->begin_date->year, 1995);
is($label->begin_date->month, 1);
is($label->begin_date->day, 12);
is($label->end_date->year, 2005);
is($label->end_date->month, 5);
is($label->end_date->day, 30);
is($label->edits_pending, 0);

done_testing;

sub create_full_edit {
    my $label = shift;
    return $c->model('Edit')->create(
        edit_type => $EDIT_LABEL_EDIT,
        editor_id => 2,

        label => $label,
        name => 'Edit Name',
        sort_name => 'Edit Sort',
        comment => 'Edit comment',
        country_id => 1,
        type_id => 1,
        label_code => 12345,
        begin_date => { year => 1995, month => 1, day => 12 },
        end_date => { year => 2005, month => 5, day => 30 }
    );
}

sub is_unchanged {
    my $label = shift;
    is($label->name, 'Label Name');
    is($label->sort_name, 'Label Name');
    is($label->$_, undef) for qw( comment country_id label_code );
    ok($label->begin_date->is_empty);
    ok($label->end_date->is_empty);
}
