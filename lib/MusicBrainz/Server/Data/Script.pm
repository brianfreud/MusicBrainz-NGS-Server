package MusicBrainz::Server::Data::Script;

use Moose;
use MusicBrainz::Server::Entity::Script;

use MusicBrainz::Server::Data::Utils qw( load_subobjects );

extends 'MusicBrainz::Server::Data::Entity';
with 'MusicBrainz::Server::Data::EntityCache' => { prefix => 'scr' };
with 'MusicBrainz::Server::Data::SelectAll';

sub _table
{
    return 'script';
}

sub _columns
{
    return 'id, isocode AS iso_code, isonumber AS iso_number, name, frequency';
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::Script';
}

sub load
{
    my ($self, @objs) = @_;
    load_subobjects($self, 'script', @objs);
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
