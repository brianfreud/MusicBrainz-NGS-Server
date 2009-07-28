package MusicBrainz::Server::Data::AliasRole;
use MooseX::Role::Parameterized;

use MusicBrainz::Server::Data::Alias;

parameter 'type' => (
    isa => 'Str',
    required => 1,
);

parameter 'table' => (
    isa => 'Str',
    default => sub { shift->type . "_alias" },
    lazy => 1
);

parameter 'name_table' => (
    isa => 'Str',
    default => sub { shift->type . "_name" },
    lazy => 1
);

role
{
    my $params = shift;

    requires 'c', '_entity_class';

    has 'alias' => (
        is => 'ro',
        builder => '_build_alias',
        lazy => 1
    );

    method '_build_alias' => sub
    {
        my $self = shift;
        return MusicBrainz::Server::Data::Alias->new(
            c      => $self->c,
            name_table => $params->name_table,
            type => $params->type,
            table => $params->table,
            entity => $self->_entity_class . 'Alias'
        );
    }
};


no Moose::Role;
1;

=head1 COPYRIGHT

Copyright (C) 2009 Oliver Charles

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

