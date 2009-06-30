package MusicBrainz::Server::Form::Search::Query;
use HTML::FormHandler::Moose;
extends 'MusicBrainz::Server::Form';

sub name { 'search-query' }

has_field 'query' => (
    type => 'Text',
    required => 1
);

has_field 'selected_id' => (
    type => 'Integer',
);

1;
