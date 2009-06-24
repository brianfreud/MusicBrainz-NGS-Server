package MusicBrainz::Server::Form::FieldRenderer;
use Moose::Role;

use HTML::Tiny;

requires 'render';

has 'h' => (
    is => 'ro',
    default => sub { HTML::Tiny->new }
);

no Moose::Role;
1;
