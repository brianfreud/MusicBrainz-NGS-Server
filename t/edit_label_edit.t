#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 4;

BEGIN { use_ok 'MusicBrainz::Server::Edit::Label::Edit' }
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Data::Label;
use MusicBrainz::Server::Data::Edit;
use MusicBrainz::Server::Test;
use Sql;

my $c = MusicBrainz::Server::Context->new();
MusicBrainz::Server::Test->prepare_test_database($c);

my $sql = Sql->new($c->dbh);
$sql->Begin;

my $label_data = MusicBrainz::Server::Data::Label->new(c => $c);
my $edit_data = MusicBrainz::Server::Data::Edit->new(c => $c);

my $label = $label_data->get_by_id(2);
my $edit = MusicBrainz::Server::Edit::Label::Edit->create(
    $label,
    {
        name => 'Warped Records',
        comment => 'Weird electronica record label',
        country => 1,
    },
    editor_id => 2,
    c => $c);

$edit->accept;
my $label2 = $label_data->get_by_id(2);
is($label2->name, 'Warped Records');
is($label2->comment, 'Weird electronica record label');
is($label2->country_id, 1);

$sql->Commit;
