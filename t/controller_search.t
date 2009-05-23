#!/usr/bin/perl
use strict;
use Test::More tests => 10;

BEGIN {
    use MusicBrainz::Server::Context;
    use MusicBrainz::Server::Test;
    my $c = MusicBrainz::Server::Context->new();
    MusicBrainz::Server::Test->prepare_test_database($c);
    MusicBrainz::Server::Test->prepare_test_server();
}

use Test::WWW::Mechanize::Catalyst;
my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'MusicBrainz::Server');

$mech->get_ok('/search/direct?query=Kate', 'fetch search page');
$mech->content_contains('1 result', 'has result count');
$mech->content_contains('Kate Bush', 'has correct search result');
$mech->content_contains('/artist/4b585938-f271-45e2-b19a-91c634b5e396', 'has link to artist');
