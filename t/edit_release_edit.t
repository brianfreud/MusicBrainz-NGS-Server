use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'MusicBrainz::Server::Edit::Release::Edit' };

use MusicBrainz::Server::Context;
use MusicBrainz::Server::Constants qw( $EDIT_RELEASE_EDIT );
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c, '+edit_release');
MusicBrainz::Server::Test->prepare_raw_test_database($c);

# Starting point for releases
my $release = $c->model('Release')->get_by_id(1);
$c->model('ArtistCredit')->load($release);

is_unchanged($release);
is($release->edits_pending, 0);

# Test editing all possible fields
my $edit = create_edit($release);
isa_ok($edit, 'MusicBrainz::Server::Edit::Release::Edit');

my ($edits) = $c->model('Edit')->find({ release => $release->id }, 0, 10);
is($edits->[0]->id, $edit->id);

$edit = $c->model('Edit')->get_by_id($edit->id);
$c->model('Edit')->load_all($edit);
is($edit->release_id, $release->id);
is($edit->release->id, $release->id);
is($edit->release->edits_pending, 1);
is_unchanged($edit->release);

$c->model('Edit')->reject($edit);
$release = $c->model('Release')->get_by_id(1);
is_unchanged($release);
is($release->edits_pending, 0);

# Accept the edit
$edit = create_edit($release);
$c->model('Edit')->accept($edit);

$release = $c->model('Release')->get_by_id(1);
$c->model('ArtistCredit')->load($release);
is($release->name, 'Edited name');
is($release->packaging_id, 1);
is($release->script_id, 1);
is($release->release_group_id, 2);
is($release->barcode, 'BARCODE');
is($release->country_id, 1);
is($release->date->year, 1985);
is($release->date->month, 4);
is($release->date->day, 13);
is($release->language_id, 1);
is($release->comment, 'Edited comment');
is($release->artist_credit->name, 'New Artist');

done_testing;

sub is_unchanged {
    my ($release) = @_;
    is($release->packaging_id, undef);
    is($release->script_id, undef);
    is($release->barcode, undef);
    is($release->country_id, undef);
    ok($release->date->is_empty);
    is($release->language_id, undef);
    is($release->comment, undef);
    is($release->release_group_id, 1);
    is($release->name, 'Release');
    is($release->artist_credit_id, 1);
}

sub create_edit {
    my $release = shift;
    return $c->model('Edit')->create(
        edit_type => $EDIT_RELEASE_EDIT,
        editor_id => 1,
        release => $release,
        name => 'Edited name',
        comment => 'Edited comment',
        status_id => 1,
        packaging_id => 1,
        release_group_id => 2,
        barcode => 'BARCODE',
        country_id => 1,
        date => {
            year => 1985, month => 4, day => 13
        },
        artist_credit => [
            { artist => 2, name => 'New Artist' }
        ],
        language_id => 1,
        script_id => 1,
    );
}
