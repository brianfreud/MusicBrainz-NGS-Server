package MusicBrainz::Server::Entity::LinkType;

use Moose;
use MooseX::AttributeHelpers;
use MusicBrainz::Server::Entity::Types;

extends 'MusicBrainz::Server::Entity::Entity';

has 'gid' => (
    is => 'rw',
    isa => 'Str',
);

has 'parent_id' => (
    is => 'rw',
    isa => 'Int',
);

has 'parent' => (
    is => 'rw',
    isa => 'LinkType',
);

has 'entity0_type' => (
    is => 'rw',
    isa => 'Str',
);

has 'entity1_type' => (
    is => 'rw',
    isa => 'Str',
);

has 'name' => (
    is => 'rw',
    isa => 'Str',
);

has 'link_phrase' => (
    is => 'rw',
    isa => 'Str',
);

has 'reverse_link_phrase' => (
    is => 'rw',
    isa => 'Str',
);

has 'short_link_phrase' => (
    is => 'rw',
    isa => 'Str',
);

has 'description' => (
    is => 'rw',
    isa => 'Str',
);

has 'child_order' => (
    is => 'rw',
    isa => 'Int',
);

has 'priority' => (
    is => 'rw',
    isa => 'Int',
);

has 'children' => (
    is => 'rw',
    isa => 'ArrayRef[LinkType]',
    lazy => 1,
    default => sub { [] },
    metaclass => 'Collection::Array',
    provides => {
        elements => 'all_children',
        push => 'add_child',
        clear => 'clear_children',
    }
);

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
