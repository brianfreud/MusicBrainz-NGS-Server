#!/usr/bin/perl
use strict;
use Test::More tests => 19;
use DateTime;
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;

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
is($editor->privileges, 1, 'privileges');
is($editor->accepted_edits, 12, 'accepted edits');
is($editor->rejected_edits, 2, 'rejected edits');
is($editor->failed_edits, 9, 'failed edits');
is($editor->auto_edits, 59, 'auto edits');

is_deeply($editor->last_login_date, DateTime->new(year => 2009, month => 01, day => 01),
    'last login date');

is_deeply($editor->email_confirmation_date, DateTime->new(year => 2005, month => 10, day => 20),
    'email confirm');

is_deeply($editor->registration_date, DateTime->new(year => 1989, month => 07, day => 23),
    'registration date');

my $editor2 = $editor_data->get_by_name('new_editor');
is_deeply($editor, $editor2);

# Test preferences
is($editor->preferences->public_ratings, 1, 'use default preference');
$editor_data->load_preferences($editor);
is($editor->preferences->public_ratings, 0, 'load preferences');
is($editor->preferences->datetime_format, '%m/%d/%Y %H:%M:%S', 'datetime_format loaded');
is($editor->preferences->timezone, 'CEST', 'timezone loaded');
