use strict;
use warnings;
use Test::More tests => 13;
use_ok 'MusicBrainz::Server::Data::Gender';

use MusicBrainz::Server::Entity::Gender;
use MusicBrainz::Server::Context;
use MusicBrainz::Server::Test;

my $c = MusicBrainz::Server::Context->new();
MusicBrainz::Server::Test->prepare_test_database($c);

my $gender_data = MusicBrainz::Server::Data::Gender->new(c => $c);

my $gender = $gender_data->get_by_id(1);
is ( $gender->id, 1 );
is ( $gender->name, "Male" );

$gender = $gender_data->get_by_id(2);
is ( $gender->id, 2 );
is ( $gender->name, "Female" );

my $genders = $gender_data->get_by_ids(1, 2);
is ( $genders->{1}->id, 1 );
is ( $genders->{1}->name, "Male" );

is ( $genders->{2}->id, 2 );
is ( $genders->{2}->name, "Female" );

my $new_gender = MusicBrainz::Server::Entity::Gender->new( name => 'Unknown' );
$gender_data->create($new_gender);
ok(defined $new_gender->id, 'id should be defined');
ok($new_gender->id > 2, 'should be >2 from sequence');

my $created = $gender_data->get_by_id($new_gender->id);
ok(defined $created);
is_deeply($created, $new_gender, 'getting gender should be same as created gender');
