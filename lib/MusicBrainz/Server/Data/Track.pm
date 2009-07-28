package MusicBrainz::Server::Data::Track;

use Moose;
use MusicBrainz::Server::Entity::Track;
use MusicBrainz::Server::Entity::Tracklist;
use MusicBrainz::Server::Data::Medium;
use MusicBrainz::Server::Data::Release;
use MusicBrainz::Server::Data::Utils qw(
    query_to_list
    query_to_list_limited
    placeholders
);

extends 'MusicBrainz::Server::Data::CoreEntity';
with 'MusicBrainz::Server::Data::Role::Name' => { name_table => 'track_name' };

sub _table
{
    return 'track JOIN track_name name ON track.name=name.id';
}

sub _columns
{
    return 'track.id, name.name, recording, tracklist, position, length,
            artist_credit, editpending';
}

sub _column_mapping
{
    return {
        id               => 'id',
        name             => 'name',
        recording_id     => 'recording',
        tracklist_id     => 'tracklist',
        position         => 'position',
        length           => 'length',
        artist_credit_id => 'artist_credit',
        edits_pending    => 'editpending',
    };
}

sub _id_column
{
    return 'track.id';
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::Track';
}

sub load
{
    my ($self, @tracklists) = @_;
    my %id_to_tracklist = map { $_->id => $_ } @tracklists;
    my @ids = keys %id_to_tracklist;
    return unless @ids; # nothing to do
    my $query = "SELECT " . $self->_columns . "
                 FROM " . $self->_table . "
                 WHERE tracklist IN (" . placeholders(@ids) . ")
                 ORDER BY tracklist, position";
    my @tracks = query_to_list($self->c->dbh, sub { $self->_new_from_row(@_) },
                               $query, @ids);
    foreach my $track (@tracks) {
        $id_to_tracklist{$track->tracklist_id}->add_track($track);
    }
}

sub find_by_recording
{
    my ($self, $recording_id, $limit, $offset) = @_;
    my $query = "
        SELECT
            track.id, track_name.name, track.tracklist, track.position,
                track.length, track.artist_credit, track.editpending,
            medium.id AS m_id, medium.format AS m_format,
                medium.position AS m_position, medium.name AS m_name,
                medium.tracklist AS m_tracklist,
                tracklist.trackcount AS m_trackcount,
            release.id AS r_id, release.gid AS r_gid, release_name.name AS r_name,
                release.artist_credit AS r_artist_credit,
                release.date_year AS r_date_year,
                release.date_month AS r_date_month,
                release.date_day AS r_date_day,
                release.country AS r_country, release.status AS r_status,
                release.packaging AS r_packaging
        FROM
            track
            JOIN tracklist ON tracklist.id = track.tracklist
            JOIN medium ON medium.tracklist = tracklist.id
            JOIN release ON release.id = medium.release
            JOIN release_name ON release.name = release_name.id
            JOIN track_name ON track.name = track_name.id
        WHERE track.recording = ?
        ORDER BY date_year, date_month, date_day, release_name.name
        OFFSET ?";
    return query_to_list_limited(
        $self->c->dbh, $offset, $limit, sub {
            my $row = shift;
            my $track = $self->_new_from_row($row);
            my $medium = MusicBrainz::Server::Data::Medium->_new_from_row($row, 'm_');
            my $tracklist = $medium->tracklist;
            my $release = MusicBrainz::Server::Data::Release->_new_from_row($row, 'r_');
            $medium->release($release);
            $tracklist->medium($medium);
            $track->tracklist($tracklist);
            return $track;
        },
        $query, $recording_id, $offset || 0);
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
