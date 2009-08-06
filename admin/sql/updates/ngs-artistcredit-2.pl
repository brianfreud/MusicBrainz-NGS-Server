#!/usr/bin/perl -w

use strict;
use FindBin;
use lib "$FindBin::Bin/../../../lib";

use DBDefs;
use MusicBrainz;
use MusicBrainz::Server::Data::Utils qw( placeholders );
use Sql;

my $mb = MusicBrainz->new;
$mb->Login(db => "READWRITE");
my $sql = Sql->new($mb->dbh);

my $raw_mb = MusicBrainz->new;
$raw_mb->Login(db => "RAWDATA");
my $raw_sql = Sql->new($raw_mb->dbh);

$sql->Begin;
$raw_sql->Begin;
eval {

my $artists_to_delete = $sql->SelectSingleColumnArray(
    "SELECT old_ac FROM tmp_artist_credit_repl");

$raw_sql->Do("DELETE FROM artist_tag_raw
              WHERE artist IN (".placeholders(@$artists_to_delete).")",
              @$artists_to_delete);

$raw_sql->Do("DELETE FROM artist_rating_raw
              WHERE artist IN (".placeholders(@$artists_to_delete).")",
              @$artists_to_delete);

$sql->Do("
    DELETE FROM l_artist_artist WHERE entity1 IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DELETE FROM artist_credit_name WHERE artist_credit IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DELETE FROM artist_credit WHERE id IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DELETE FROM artist_meta WHERE id IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DELETE FROM artist_tag WHERE artist IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DELETE FROM artist_annotation WHERE artist IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DELETE FROM artist_gid_redirect WHERE newid IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DELETE FROM artist_alias WHERE artist IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DELETE FROM artist WHERE id IN (SELECT old_ac FROM tmp_artist_credit_repl);
    DROP TABLE tmp_artist_credit_repl;
    ");

    $sql->Commit;
    $raw_sql->Commit;
};
if ($@) {
    printf STDERR "ERROR: %s\n", $@;
    $sql->Rollback;
    $raw_sql->Rollback;
}
