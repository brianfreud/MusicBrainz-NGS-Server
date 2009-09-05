package MusicBrainz::Server::Data::Medium;

use Moose;
use MusicBrainz::Server::Data::Release;
use MusicBrainz::Server::Entity::Medium;
use MusicBrainz::Server::Entity::Tracklist;
use MusicBrainz::Server::Data::Utils qw(
    load_subobjects
    placeholders
    query_to_list
    query_to_list_limited
);

extends 'MusicBrainz::Server::Data::Entity';
with 'MusicBrainz::Server::Data::Editable' => { table => 'medium' };

sub _table
{
    return 'medium JOIN tracklist ON medium.tracklist=tracklist.id';
}

sub _columns
{
    return 'medium.id, tracklist, release, position, format, name,
            editpending, trackcount';
}

sub _id_column
{
    return 'medium.id';
}

sub _column_mapping
{
    return {
        id            => 'id',
        tracklist_id  => 'tracklist',
        tracklist     => sub {
            my ($row, $prefix) = @_;
            my $id = $row->{$prefix . 'tracklist'};
            my $track_count = $row->{$prefix . 'trackcount'};
            return unless $id && $track_count;
            return MusicBrainz::Server::Entity::Tracklist->new(
                id          => $id,
                track_count => $track_count,
            );
        },
        release_id    => 'release',
        position      => 'position',
        name          => 'name',
        format_id     => 'format',
        edits_pending => 'editpending',
    };
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::Medium';
}

sub load
{
    my ($self, @objs) = @_;
    return load_subobjects($self, 'medium', @objs);
}

sub load_for_releases
{
    my ($self, @releases) = @_;
    my %id_to_release = map { $_->id => $_ } @releases;
    my @ids = keys %id_to_release;
    return unless @ids; # nothing to do
    my $query = "SELECT " . $self->_columns . "
                 FROM " . $self->_table . "
                 WHERE release IN (" . placeholders(@ids) . ")
                 ORDER BY release, position";
    my @mediums = query_to_list($self->c->dbh, sub { $self->_new_from_row(@_) },
                                $query, @ids);
    foreach my $medium (@mediums) {
        $id_to_release{$medium->release_id}->add_medium($medium);
    }
}

sub find_by_tracklist
{
    my ($self, $tracklist_id, $limit, $offset) = @_;
    my $query = "
        SELECT
            medium.id AS m_id, medium.format AS m_format,
                medium.position AS m_position, medium.name AS m_name,
                medium.tracklist AS m_tracklist,
            release.id AS r_id, release.gid AS r_gid, release_name.name AS r_name,
                release.artist_credit AS r_artist_credit,
                release.date_year AS r_date_year,
                release.date_month AS r_date_month,
                release.date_day AS r_date_day,
                release.country AS r_country, release.status AS r_status,
                release.packaging AS r_packaging
        FROM
            medium
            JOIN release ON release.id = medium.release
            JOIN release_name ON release.name = release_name.id
        WHERE medium.tracklist = ?
        ORDER BY date_year, date_month, date_day, release_name.name
        OFFSET ?";
    return query_to_list_limited(
        $self->c->dbh, $offset, $limit, sub {
            my $row = shift;
            my $medium = $self->_new_from_row($row, 'm_');
            my $release = MusicBrainz::Server::Data::Release->_new_from_row($row, 'r_');
            $medium->release($release);
            return $medium;
        },
        $query, $tracklist_id, $offset || 0);
}

sub update
{
    my ($self, $medium_id, $medium_hash) = @_;
    my $sql = Sql->new($self->c->dbh);
    my $row = $self->_create_row($medium_hash);
    $sql->Update('medium', $row, { id => $medium_id });
}

sub insert
{
    my ($self, @medium_hashes) = @_;
    my $sql = Sql->new($self->c->dbh);
    my $class = $self->_entity_class;
    my @created;
    for my $medium_hash (@medium_hashes) {
        my $row = $self->_create_row($medium_hash);

        push @created, $class->new(
            id => $sql->InsertRow('medium', $row, 'id')
        );
    }
    return @medium_hashes > 1 ? @created : $created[0];
}

sub delete
{
    my ($self, @ids) = @_;
    my $sql = Sql->new($self->c->dbh);
    $sql->Do('DELETE FROM medium WHERE id IN (' . placeholders(@ids) . ')', @ids);
}

sub _create_row
{
    my ($self, $medium_hash) = @_;
    my %row;
    my $mapping = $self->_column_mapping;
    for my $col (qw( name format_id position tracklist_id release_id ))
    {
        next unless exists $medium_hash->{$col};
        my $mapped = $mapping->{$col} || $col;
        $row{$mapped} = $medium_hash->{$col};
    }
    return \%row;
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
