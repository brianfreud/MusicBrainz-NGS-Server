use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'MusicBrainz::Server::Edit::Recording::AddAnnotation' }

use MusicBrainz::Server::Constants qw( $EDIT_RECORDING_ADD_ANNOTATION );
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+annotation');
MusicBrainz::Server::Test->prepare_raw_test_database($c);

my $edit = $c->model('Edit')->create(
    edit_type => $EDIT_RECORDING_ADD_ANNOTATION,
    editor_id => 1,

    recording_id => 1,
    text => 'Test annotation',
    changelog => 'A changelog',
);
isa_ok($edit, 'MusicBrainz::Server::Edit::Recording::AddAnnotation');

my ($edits) = $c->model('Edit')->find({ recording => 1 }, 10, 0);
is($edits->[0]->id, $edit->id);

$c->model('Edit')->load_all($edit);
is($edit->recording->id, $edit->recording_id);
is($edit->recording_id, 1);

$c->model('Recording')->annotation->load_latest($edit->recording);
my $annotation = $edit->recording->latest_annotation;
ok(defined $annotation);
is($annotation->editor_id, 1);
is($annotation->text, 'Test annotation');
is($annotation->changelog, 'A changelog');

done_testing;
