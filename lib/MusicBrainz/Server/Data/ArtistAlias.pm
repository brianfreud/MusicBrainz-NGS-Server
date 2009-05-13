package MusicBrainz::Server::Data::ArtistAlias;
use Moose;

use MusicBrainz::Server::Entity::ArtistAlias;

extends 'MusicBrainz::Server::Data::Entity';

sub _table
{
    return 'artist_alias';
}

sub _columns
{
    return 'id, name, artist, editspending, lastused, timesused';
}

sub _column_mapping
{
    return {
        id            => 'id',
        name          => 'name',
        artist_id     => 'artist',
        times_used    => 'timesused',
        last_used     => 'lastused',
        edits_pending => 'editspending',
    };
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::ArtistAlias';
}

no Moose;
__PACKAGE__->meta->make_immutable;
1;

=head1 NAME

MusicBrainz::Server::Data::ArtistAlias - database level loading support for
artist aliases.

=head1 DESCRIPTION

Provides support for loading artist aliases from the database.

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

