package MusicBrainz::Server::Data::LinkAttributeType;

use Moose;
use Sql;
use MusicBrainz::Server::Entity::LinkType;
use MusicBrainz::Server::Data::Utils qw(
    load_subobjects
    hash_to_row
    generate_gid
    placeholders
);

extends 'MusicBrainz::Server::Data::Entity';

sub _table
{
    return 'link_attribute_type';
}

sub _columns
{
    return 'id, parent, childorder, gid, name, description';
}

sub _column_mapping
{
    return {
        id          => 'id',
        gid         => 'gid',
        parent_id   => 'parent',
        child_order => 'childorder',
        name        => 'name',
        description => 'description',
    };
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::LinkAttributeType';
}

sub get_tree
{
    my ($self) = @_;

    my $sql = Sql->new($self->c->dbh);
    $sql->Select('SELECT '  .$self->_columns . ' FROM ' . $self->_table . '
                  ORDER BY childorder, id');
    my %id_to_obj;
    my @objs;
    while (1) {
        my $row = $sql->NextRowHashRef or last;
        my $obj = $self->_new_from_row($row);
        $id_to_obj{$obj->id} = $obj;
        push @objs, $obj;
    }
    $sql->Finish;

    my $root = MusicBrainz::Server::Entity::LinkAttributeType->new;
    foreach my $obj (@objs) {
        my $parent = $obj->parent_id ? $id_to_obj{$obj->parent_id} : $root;
        $parent->add_child($obj);
    }

    return $root;
}

sub find_root
{
    my ($self, $id) = @_;

    my $sql = Sql->new($self->c->dbh);
    my $query = 'SELECT root FROM ' . $self->_table . ' WHERE id = ?';
    return $sql->SelectSingleValue($query, $id);
}

sub insert
{
    my ($self, $values) = @_;

    my $sql = Sql->new($self->c->dbh);
    my $row = $self->_hash_to_row($values);
    $row->{id} = $sql->SelectSingleValue("SELECT nextval('link_attribute_type_id_seq')");
    $row->{gid} = $values->{gid} || generate_gid();
    $row->{root} = $row->{parent} ? $self->find_root($row->{parent}) : $row->{id};
    $sql->InsertRow('link_attribute_type', $row);
    return $self->_entity_class->new( id => $row->{id}, gid => $row->{gid} );
}

sub _update_root
{
    my ($self, $sql, $parent, $root) = @_;
    my $ids = $sql->SelectSingleColumnArray('SELECT id FROM link_attribute_type
                                             WHERE parent = ?', $parent);
    if (@$ids) {
        $sql->Do('UPDATE link_attribute_type SET root = ?
                  WHERE id IN ('.placeholders(@$ids).')', $root, @$ids);
        foreach my $id (@$ids) {
            $self->_update_root($sql, $id, $root);
        }
    }
}

sub update
{
    my ($self, $id, $values) = @_;

    my $sql = Sql->new($self->c->dbh);
    my $row = $self->_hash_to_row($values);
    if (%$row) {
        if ($row->{parent}) {
            $row->{root} = $self->find_root($row->{parent});
            $self->_update_root($sql, $id, $row->{root});
        }
        $sql->Update('link_attribute_type', $row, { id => $id });
    }
}

sub delete
{
    my ($self, $id) = @_;

    my $sql = Sql->new($self->c->dbh);
    $sql->Do('DELETE FROM link_attribute_type WHERE id = ?', $id);
}

sub _hash_to_row
{
    my ($self, $values) = @_;

    return hash_to_row($values, {
        parent          => 'parent_id',
        childorder      => 'child_order',
        name            => 'name',
        description     => 'description',
    });
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
