package MusicBrainz::Server::Entity::Annotation;

use Moose;
use MusicBrainz::Server::Types;
use MusicBrainz::Server::Entity::Types;
use Text::WikiFormat;

extends 'MusicBrainz::Server::Entity::Entity';
with 'MusicBrainz::Server::Entity::Editable';

has 'editor_id' => (
    is => 'rw',
    isa => 'Int'
);

has 'editor' => (
    is => 'rw',
    isa => 'Editor'
);

has 'text' => (
    is => 'rw',
    isa => 'Str'
);

has 'changelog' => (
    is => 'rw',
    isa => 'Str'
);

has 'creation_date' => (
    is => 'rw',
    isa => 'DateTime',
    coerce => 1
);

sub summary
{
    my $self = shift;
    my ($summary) = split /\n\n/, $self->text;
    return $summary;
}

sub format_summary
{
    my $self = shift;
    return Text::WikiFormat::format($self->summary);
}

sub summary_is_short
{
    my $self = shift;
    return $self->summary ne $self->text;
}

sub format_text
{
    my $self = shift;
    Text::WikiFormat::format($self->text);
}

__PACKAGE__->meta->make_immutable;
no Moose;
1;

=head1 COPYRIGHT

Copyright (C) 2009 Lukas Lalinsky

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

=cut
