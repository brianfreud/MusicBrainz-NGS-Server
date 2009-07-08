#!/usr/bin/perl
use strict;
use Test::More tests => 24;

BEGIN {
    use MusicBrainz::Server::Context;
    use MusicBrainz::Server::Test;
}

my $c = MusicBrainz::Server::Test->create_test_context();
MusicBrainz::Server::Test->prepare_test_database($c);
MusicBrainz::Server::Test->prepare_test_server();

use Test::WWW::Mechanize::Catalyst;
my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'MusicBrainz::Server');

$mech->get_ok("/label/46f0f4cd-8aab-4b33-b698-f459faf64190", 'fetch label index');
$mech->title_like(qr/Warp Records/, 'title has label name');
$mech->content_like(qr/Warp Records/, 'content has label name');
$mech->content_like(qr/Sheffield based electronica label/, 'disambiguation comments');
$mech->content_like(qr/1989-02-03/, 'has start date');
$mech->content_like(qr/2008-05-19/, 'has end date');
$mech->content_like(qr/United Kingdom/, 'has country');
$mech->content_like(qr/Production/, 'has label type');
$mech->content_like(qr/Test annotation 2/, 'has annotation');

# Check releases
$mech->content_like(qr/Arrival/, 'has release title');
$mech->content_like(qr/ABC-123/, 'has catalog of first release');
$mech->content_like(qr/ABC-123-X/, 'has catalog of second release');
$mech->content_like(qr/2009-05-08/, 'has release date');
$mech->content_like(qr{GB}, 'has country in release list');
$mech->content_like(qr{/release/f34c079d-374e-4436-9448-da92dedef3ce}, 'links to correct release');

# Test aliases
$mech->get_ok('/label/46f0f4cd-8aab-4b33-b698-f459faf64190/aliases', 'get label aliases');
$mech->content_contains('Test Label Alias', 'has the label alias');

# Test ratings
$mech->get_ok('/label/46f0f4cd-8aab-4b33-b698-f459faf64190/ratings', 'get label ratings');

# Test creating new artists via the create artist form
$mech->get_ok('/user/login');
$mech->submit_form( with_fields => { username => 'new_editor', password => 'password' } );

$mech->get_ok('/label/create');
my $response = $mech->submit_form(
    with_fields => {
        name => 'controller label',
        sort_name => 'label, controller',
        type_id => 2,
        label_code => 12345,
        country_id => 1,
        'begin_date.year' => 1990,
        'begin_date.month' => 01,
        'begin_date.day' => 02,
        'end_date.year' => 2003,
        'end_date.month' => 4,
        'end_date.day' => 15,
        comment => 'label created in controller_label.t',
    }
);
ok($mech->success);
ok($mech->uri =~ qr{/label/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})}, 'should redirect to label page via gid');

my $edit = MusicBrainz::Server::Test->get_latest_edit($c);
isa_ok($edit, 'MusicBrainz::Server::Edit::Label::Create');
is_deeply($edit->data, {
        name => 'controller label',
        sort_name => 'label, controller',
        type_id => 2,
        country_id => 1,
        label_code => 12345,
        comment => 'label created in controller_label.t',
        begin_date => {
            year => 1990,
            month => 01,
            day => 02
        },
        end_date => {
            year => 2003,
            month => 4,
            day => 15
        },
    });
