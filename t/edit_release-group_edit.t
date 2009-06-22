#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 5;

BEGIN { use_ok 'MusicBrainz::Server::Edit::ReleaseGroup::Edit' }
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Data::ArtistCredit;
use MusicBrainz::Server::Data::ReleaseGroup;
use MusicBrainz::Server::Data::Edit;
use MusicBrainz::Server::Test;
use Sql;

my $c = MusicBrainz::Server::Context->new();
MusicBrainz::Server::Test->prepare_test_database($c);

my $sql = Sql->new($c->dbh);
$sql->Begin;

my $ac_data = MusicBrainz::Server::Data::ArtistCredit->new(c => $c);
my $rg_data = MusicBrainz::Server::Data::ReleaseGroup->new(c => $c);
my $rg = $rg_data->get_by_id(3);

my $edit = MusicBrainz::Server::Edit::ReleaseGroup::Edit->create(
    $rg,
    {
        artist_credit => [
            { name => 'Break', artist => 3 },
            ' & ',
            { name => 'Silent Witness', artist => 4 },
        ],
        name => 'We Know',
        comment => 'EP'
    },
    editor_id => 2,
    c => $c,
);
is_deeply($edit->data, {
        release_group => $rg->id,
        new => {
            name => 'We Know',
            artist_credit => [
                { name => 'Break', artist => 3 },
                ' & ',
                { name => 'Silent Witness', artist => 4 },
            ],
            comment => 'EP',
        },
        old => {
            name => $rg->name,
            comment => $rg->comment,
            artist_credit => [
                { name => 'Test Artist', artist => 3 }
            ],
        },
    });

$edit->accept;

$rg = $rg_data->get_by_id(3);
$ac_data->load($rg);
is($rg->name, 'We Know');
is($rg->comment, 'EP');
is($rg->artist_credit->name, 'Break & Silent Witness');

$sql->Commit;
