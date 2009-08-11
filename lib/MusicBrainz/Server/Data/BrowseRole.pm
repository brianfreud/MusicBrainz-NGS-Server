package MusicBrainz::Server::Data::BrowseRole;
use Moose::Role;

use MusicBrainz::Server::Data::Utils qw( query_to_list_limited );

requires '_columns', '_table';

sub find_by_name_prefix
{
    my ($self, $prefix, $limit, $offset) = @_;

    my $query = "SELECT " . $self->_columns . " FROM " . $self->_table . "
                 WHERE page_index(name.name) BETWEEN page_index(?) AND
                                                     page_index_max(?)
                 ORDER BY name.name OFFSET ?";
    return query_to_list_limited(
        $self->c->dbh, $offset, $limit, sub { $self->_new_from_row(@_) },
        $query, $prefix, $prefix, $offset || 0);
}

no Moose::Role;
1;

=head1 COPYRIGHT

Copyright (C) 2009 LukasLalinsky

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

