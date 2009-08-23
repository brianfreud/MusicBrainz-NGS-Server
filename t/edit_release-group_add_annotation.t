use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'MusicBrainz::Server::Edit::ReleaseGroup::AddAnnotation' }

use MusicBrainz::Server::Constants qw( $EDIT_RELEASEGROUP_ADD_ANNOTATION );
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+annotation');
MusicBrainz::Server::Test->prepare_raw_test_database($c);

my $edit = $c->model('Edit')->create(
    edit_type => $EDIT_RELEASEGROUP_ADD_ANNOTATION,
    editor_id => 1,

    release_group_id => 1,
    text => 'Test annotation',
    changelog => 'A changelog',
);
isa_ok($edit, 'MusicBrainz::Server::Edit::ReleaseGroup::AddAnnotation');

my ($edits) = $c->model('Edit')->find({ release_group => 1 }, 0, 10);
is($edits->[0]->id, $edit->id);

$c->model('Edit')->load_all($edit);
is($edit->release_group->id, $edit->release_group_id);
is($edit->release_group_id, 1);

$c->model('ReleaseGroup')->annotation->load_latest($edit->release_group);
my $annotation = $edit->release_group->latest_annotation;
ok(defined $annotation);
is($annotation->editor_id, 1);
is($annotation->text, 'Test annotation');
is($annotation->changelog, 'A changelog');

done_testing;
