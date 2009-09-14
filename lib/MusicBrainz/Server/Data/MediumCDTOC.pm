package MusicBrainz::Server::Data::MediumCDTOC;

use Moose;
use MusicBrainz::Server::Data::Utils qw(
    placeholders
    query_to_list
);

extends 'MusicBrainz::Server::Data::Entity';

sub _table
{
    return 'medium_cdtoc';
}

sub _columns
{
    return 'id, medium, cdtoc, editpending';
}

sub _column_mapping
{
    return {
        id => 'id',
        medium_id => 'medium',
        cdtoc_id => 'cdtoc',
        edits_pending => 'editpending',
    };
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::MediumCDTOC';
}

sub find_by_medium
{
    my ($self, @medium_ids) = @_;

    my $query = "
        SELECT " . $self->_columns . " FROM " . $self->_table . "
        WHERE medium IN (" . placeholders(@medium_ids) . ")
        ORDER BY id";
    return query_to_list(
        $self->c->dbh, sub { $self->_new_from_row(@_) },
        $query, @medium_ids);
}

sub load_for_mediums
{
    my ($self, @mediums) = @_;

    my %id_to_medium = map { $_->id => $_ } @mediums;
    my @list = $self->find_by_medium(keys %id_to_medium);
    foreach my $o (@list) {
        $id_to_medium{$o->medium_id}->add_cdtoc($o);
    }
    return @list;
}

sub find_by_cdtoc
{
    my ($self, $cdtoc_id) = @_;
    return sort { $a->id <=> $b->id }
        values %{ $self->_get_by_keys("cdtoc", $cdtoc_id) };
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
