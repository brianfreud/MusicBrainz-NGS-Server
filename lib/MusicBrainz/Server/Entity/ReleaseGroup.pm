package MusicBrainz::Server::Entity::ReleaseGroup;

use Moose;
use MusicBrainz::Server::Entity::PartialDate;
use MusicBrainz::Server::Entity::Types;

extends 'MusicBrainz::Server::Entity::CoreEntity';
with 'MusicBrainz::Server::Entity::Taggable';
with 'MusicBrainz::Server::Entity::Linkable';
with 'MusicBrainz::Server::Entity::AnnotationRole';
with 'MusicBrainz::Server::Entity::LastUpdateRole';
with 'MusicBrainz::Server::Entity::RatingRole';

has 'type_id' => (
    is => 'rw',
    isa => 'Int'
);

has 'type' => (
    is => 'rw',
    isa => 'ReleaseGroupType'
);

sub type_name
{
    my ($self) = @_;
    return $self->type ? $self->type->name : undef;
}

has 'artist_credit_id' => (
    is => 'rw',
    isa => 'Int'
);

has 'artist_credit' => (
    is => 'rw',
    isa => 'ArtistCredit',
    predicate => 'artist_credit_loaded',
);

has 'first_release_date' => (
    is => 'rw',
    isa => 'PartialDate',
);

has 'release_count' => (
    is => 'rw',
    isa => 'Int'
);

has 'comment' => (
    is => 'rw',
    isa => 'Str'
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
