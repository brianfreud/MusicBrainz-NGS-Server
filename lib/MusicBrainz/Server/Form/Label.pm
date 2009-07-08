package MusicBrainz::Server::Form::Label;
use HTML::FormHandler::Moose;
extends 'MusicBrainz::Server::Form';

with 'MusicBrainz::Server::Form::Edit';

has_field 'name' => (
    type => 'Text',
    required => 1,
);

has_field 'sort_name' => (
    type => 'Text',
    required => 1,
);

has_field 'type' => (
    type => 'Select',
    accessor => 'type_id',
);

has_field 'label_code' => (
    type => 'Integer',
    size => 5,
);

has_field 'begin_date' => (
    type => '+MusicBrainz::Server::Form::Field::PartialDate',
);

has_field 'end_date' => (
    type => '+MusicBrainz::Server::Form::Field::PartialDate',
);

has_field 'country' => (
    type => 'Select',
    accessor => 'country_id',
);

has_field 'comment' => (
    type => 'Text',
);

sub options_type_id    { shift->_select_all('LabelType') }
sub options_country_id { shift->_select_all('Country') }

1;
