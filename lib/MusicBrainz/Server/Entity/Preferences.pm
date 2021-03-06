package MusicBrainz::Server::Entity::Preferences;
use Moose;

has 'public_ratings' => (
    isa => 'Bool',
    default => 1,
    is => 'rw',
);

has 'datetime_format' => (
    isa => 'Str',
    default => '%Y-%m-%d %H:%M:%S %Z',
    is => 'rw',
);

has 'timezone' => (
    isa => 'Str',
    default => 'UTC',
    is => 'rw',
);

no Moose;
__PACKAGE__->meta->make_immutable;
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
