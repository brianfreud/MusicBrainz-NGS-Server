#!/usr/bin/perl
use strict;
use Test::More tests => 5;

BEGIN {
    use MusicBrainz::Server::Test;
    my $c = MusicBrainz::Server::Test->create_test_context();
    MusicBrainz::Server::Test->prepare_test_database($c);
    MusicBrainz::Server::Test->prepare_test_server();
}

use Test::WWW::Mechanize::Catalyst;
my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'MusicBrainz::Server');

$mech->get_ok('/isrc/DEE250800230');
$mech->content_contains('King of the Mountain');
$mech->content_contains('Kate Bush');

$mech->get('/isrc/DEE250812345');
is($mech->status(), 404);

$mech->get('/isrc/xxx');
is($mech->status(), 404);
