#!/usr/bin/perl
use strict;
use Test::More tests => 41;

BEGIN {
    use MusicBrainz::Server::Context;
    use MusicBrainz::Server::Test;
    my $c = MusicBrainz::Server::Test->create_test_context();
    MusicBrainz::Server::Test->prepare_test_database($c);
    MusicBrainz::Server::Test->prepare_test_server();
}

use Test::WWW::Mechanize::Catalyst;
my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'MusicBrainz::Server');

$mech->get_ok('/search?query=Kate&type=artist&direct=on', 'perform artist search');
$mech->content_contains('3 results', 'has result count');
$mech->content_contains('Kate Bush', 'has correct search result');
$mech->content_contains('Bush, Kate', 'has artist sortname');
$mech->content_contains('/artist/4b585938-f271-45e2-b19a-91c634b5e396', 'has link to artist');

$mech->get_ok('/search?query=Warp&type=label&direct=on', 'perform label search');
$mech->content_contains('1 result', 'has result count');
$mech->content_contains('Warp Records', 'has correct search result');
$mech->content_contains('Sheffield based electronica label', 'has label comment');
$mech->content_contains('/label/46f0f4cd-8aab-4b33-b698-f459faf64190', 'has link to label');

$mech->get_ok('/search?query=Dancing+Queen&type=work&direct=on', 'perform works search');
$mech->content_contains('1 result', 'has result count');
$mech->content_contains('Dancing Queen', 'has correct search result');
$mech->content_contains('/work/745c079d-374e-4436-9448-da92dedef3ce', 'has link to work');
$mech->content_contains('/artist/a45c079d-374e-4436-9448-da92dedef3cf', 'has link to artist');
$mech->content_contains('ABBA', 'has artist');

$mech->get_ok('/search?query=Sunset&type=recording&direct=on', 'perform recording search');
$mech->content_contains('1 result', 'has result count');
$mech->content_contains('Sunset', 'has correct search result');
$mech->content_contains('/recording/33137503-0ebf-4b6b-a7ce-cc71df5865df', 'has link to recording');
$mech->content_contains('/artist/4b585938-f271-45e2-b19a-91c634b5e396', 'has link to artist');

$mech->get_ok('/search?query=Aerial&type=release&direct=on', 'perform release search');
$mech->content_contains('2 results', 'has result count');
$mech->content_contains('Aerial', 'has correct search result');
$mech->content_contains('/release/f205627f-b70a-409d-adbe-66289b614e80', 'has link to release');
$mech->content_contains('/release/9b3d9383-3d2a-417f-bfbb-56f7c15f075b', 'has link to release');
$mech->content_contains('/artist/4b585938-f271-45e2-b19a-91c634b5e396', 'has link to artist');

$mech->get_ok('/search?query=Arrival&type=release_group&direct=on', 'perform release group search');
$mech->content_contains('1 result', 'has result count');
$mech->content_contains('Arrival', 'has correct search result');
$mech->content_contains('/release-group/234c079d-374e-4436-9448-da92dedef3ce', 'has link to release group');
$mech->content_contains('/artist/a45c079d-374e-4436-9448-da92dedef3cf', 'has link to artist');
$mech->content_contains('ABBA', 'has artist');

$mech->get_ok('/search?query=random_editor&type=editor', 'perform editor search');
$mech->content_contains('There is no editor with this name');
$mech->get_ok('/search?query=new_editor&type=editor', 'perform editor search');
is($mech->uri->path, '/user/profile/new_editor');

$mech->get_ok('/search?query=musical&type=tag&direct=on', 'perform tag search');
$mech->content_contains('1 result', 'has result count');
$mech->content_contains('musical', 'has correct search result');
$mech->content_contains('/tag/musical', 'has link to the tag');
