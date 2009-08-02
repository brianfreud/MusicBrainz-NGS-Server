package MusicBrainz::Server::Data::Collection;

use Moose;
use Sql;
use MusicBrainz::Server::Data::Utils qw( placeholders );

has 'c' => (
    is => 'rw',
    isa => 'Object'
);

sub create_collection
{
    my ($self, $user) = @_;

    my $sql = Sql->new($self->c->dbh);
    return $sql->SelectSingleValue("INSERT INTO editor_collection (editor)
                                    VALUES (?) RETURNING id", $user->id);
}

sub find_collection
{
    my ($self, $user) = @_;

    my $sql = Sql->new($self->c->dbh);
    return $sql->SelectSingleValue("SELECT id FROM editor_collection
                                    WHERE editor = ?", $user->id);
}

sub add_release_to_collection
{
    my ($self, $collection_id, $release_id) = @_;

    my $sql = Sql->new($self->c->dbh);
    $sql->AutoCommit(1);
    $sql->Do("INSERT INTO editor_collection_release (collection, release)
              VALUES (?, ?)", $collection_id, $release_id);
}

sub remove_release_from_collection
{
    my ($self, $collection_id, $release_id) = @_;

    my $sql = Sql->new($self->c->dbh);
    $sql->AutoCommit(1);
    $sql->Do("DELETE FROM editor_collection_release
              WHERE collection = ? AND release = ?",
              $collection_id, $release_id);
}

sub check_release
{
    my ($self, $collection_id, $release_id) = @_;

    my $sql = Sql->new($self->c->dbh);
    return $sql->SelectSingleValue("
        SELECT 1 FROM editor_collection_release
        WHERE collection = ? AND release = ?",
        $collection_id, $release_id) ? 1 : 0;
}

sub merge_releases
{
    my ($self, $new_id, @old_ids) = @_;

    my $sql = Sql->new($self->c->dbh);

    # Remove duplicate joins (ie, rows with release from @old_ids and pointing to
    # a collection that already contain $new_id)
    $sql->Do("DELETE FROM editor_collection_release
              WHERE release IN (".placeholders(@old_ids).") AND
                  collection IN (SELECT collection FROM editor_collection_release WHERE release = ?)",
              @old_ids, $new_id);

    # Move all remaining joins to the new release
    $sql->Do("UPDATE editor_collection_release SET release = ?
              WHERE release IN (".placeholders(@old_ids).")",
              $new_id, @old_ids);
}

sub delete_releases
{
    my ($self, @ids) = @_;

    my $sql = Sql->new($self->c->dbh);
    $sql->Do("DELETE FROM editor_collection_release
              WHERE release IN (".placeholders(@ids).")", @ids);
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
