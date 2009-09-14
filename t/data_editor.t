#!/usr/bin/perl
use strict;
use Test::More;
use DateTime;
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;
use MusicBrainz::Server::Types qw( $STATUS_FAILEDVOTE $STATUS_APPLIED $STATUS_ERROR );
use Sql;

BEGIN { use_ok 'MusicBrainz::Server::Data::Editor'; }

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+editor');

my $editor_data = MusicBrainz::Server::Data::Editor->new(c => $c);

my $editor = $editor_data->get_by_id(1);
ok(defined $editor, 'no editor returned');
isa_ok($editor, 'MusicBrainz::Server::Entity::Editor', 'not a editor');

is($editor->id, 1, 'id');
is($editor->name, 'new_editor', 'name');
is($editor->password, 'password', 'password');
is($editor->privileges, 9, 'privileges');
is($editor->accepted_edits, 12, 'accepted edits');
is($editor->rejected_edits, 2, 'rejected edits');
is($editor->failed_edits, 9, 'failed edits');
is($editor->accepted_auto_edits, 59, 'auto edits');

is_deeply($editor->last_login_date, DateTime->new(year => 2009, month => 01, day => 01),
    'last login date');

is_deeply($editor->email_confirmation_date, DateTime->new(year => 2005, month => 10, day => 20),
    'email confirm');

is_deeply($editor->registration_date, DateTime->new(year => 1989, month => 07, day => 23),
    'registration date');

my $editor2 = $editor_data->get_by_name('new_editor');
is_deeply($editor, $editor2);

# Test crediting
Sql::RunInTransaction(sub {
        $editor_data->credit($editor->id, $STATUS_APPLIED);
        $editor_data->credit($editor->id, $STATUS_APPLIED, 1);
        $editor_data->credit($editor->id, $STATUS_FAILEDVOTE);
        $editor_data->credit($editor->id, $STATUS_ERROR);
    }, Sql->new($c->dbh));

$editor = $editor_data->get_by_id($editor->id);
is($editor->accepted_edits, 13);
is($editor->rejected_edits, 3);
is($editor->failed_edits, 10);
is($editor->accepted_auto_edits, 60);

# Test preferences
is($editor->preferences->public_ratings, 1, 'use default preference');
$editor_data->load_preferences($editor);
is($editor->preferences->public_ratings, 0, 'load preferences');
is($editor->preferences->datetime_format, '%m/%d/%Y %H:%M:%S', 'datetime_format loaded');
is($editor->preferences->timezone, 'UTC', 'timezone loaded');

my $new_editor_2 = $editor_data->insert({
    name => 'new_editor_2',
    password => 'password',
});
ok($new_editor_2->id > $editor->id);
is($new_editor_2->name, 'new_editor_2');
is($new_editor_2->password, 'password');
is($new_editor_2->accepted_edits, 0);

$editor = $editor_data->get_by_id($new_editor_2->id);
is($editor->email, undef);
is($editor->email_confirmation_date, undef);

my $now = DateTime->now;
$editor_data->update_email($new_editor_2, 'editor@example.com');

$editor = $editor_data->get_by_id($new_editor_2->id);
is($editor->email, 'editor@example.com');
ok($now <= $editor->email_confirmation_date);
is($new_editor_2->email_confirmation_date, $editor->email_confirmation_date);

$editor_data->update_password($new_editor_2, 'password2');
$editor = $editor_data->get_by_id($new_editor_2->id);
is($editor->password, 'password2');

my @editors = $editor_data->find_by_email('editor@example.com');
is(scalar(@editors), 1);
is($editors[0]->id, $new_editor_2->id);

done_testing;
