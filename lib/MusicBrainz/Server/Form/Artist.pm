package MusicBrainz::Server::Form::Artist;
use HTML::FormHandler::Moose;

extends 'MusicBrainz::Server::Form';
with 'MusicBrainz::Server::Form::Edit';

has '+name' => ( default => 'create-artist-' );

has_field 'name' => (
    type => 'Text',
    required => 1,
);

has_field 'sort_name' => (
    type => 'Text',
    required => 1,
);

has_field 'gender' => (
    type => 'Select',
    accessor => 'gender_id',
);

has_field 'type' => (
    type => 'Select',
    accessor => 'type_id',
);

has_field 'country' => (
    type => 'Select',
    accessor => 'country_id',
);

has_field 'begin_date' => (
    type => '+MusicBrainz::Server::Form::Field::PartialDate',
);

has_field 'end_date' => (
    type => '+MusicBrainz::Server::Form::Field::PartialDate',
);

has_field 'comment' => (
    type => 'Text',
);

has_field 'not_dupe' => (
    type => 'Boolean',
);

sub options_gender_id   { shift->_select_all('Gender') }
sub options_type_id     { shift->_select_all('ArtistType') }
sub options_country_id  { shift->_select_all('Country') }

1;
