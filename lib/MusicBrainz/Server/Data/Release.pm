package MusicBrainz::Server::Data::Release;

use Moose;
use MusicBrainz::Server::Entity::Release;
use MusicBrainz::Server::Data::Utils qw(
    generate_gid
    partial_date_from_row
    placeholders
    query_to_list_limited
);

extends 'MusicBrainz::Server::Data::CoreEntity';
with 'MusicBrainz::Server::Data::AnnotationRole';
with 'MusicBrainz::Server::Data::Role::Name' => { name_table => 'release_name' };

sub _annotation_type
{
    return 'release';
}

sub _table
{
    return 'release JOIN release_name name ON release.name=name.id';
}

sub _columns
{
    return 'release.id, gid, name.name, release.artist_credit, release_group,
            status, packaging, date_year, date_month, date_day, country,
            comment, editpending, barcode';
}

sub _id_column
{
    return 'release.id';
}

sub _gid_redirect_table
{
    return 'release_gid_redirect';
}

sub _column_mapping
{
    return {
        id => 'id',
        gid => 'gid',
        name => 'name',
        artist_credit_id => 'artist_credit',
        release_group_id => 'release_group',
        status_id => 'status',
        packaging_id => 'packaging',
        country_id => 'country',
        date => sub { partial_date_from_row(shift, shift() . 'date_') },
        edits_pending => 'editpending',
        comment => 'comment',
        barcode => 'barcode',
    };
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::Release';
}

sub find_by_artist
{
    my ($self, $artist_id, $limit, $offset) = @_;
    my $query = "SELECT " . $self->_columns . "
                 FROM " . $self->_table . "
                     JOIN artist_credit_name acn
                         ON acn.artist_credit = release.artist_credit
                 WHERE acn.artist = ?
                 ORDER BY date_year, date_month, date_day, name.name
                 OFFSET ?";
    return query_to_list_limited(
        $self->c, $offset, $limit, sub { $self->_new_from_row(@_) },
        $query, $artist_id, $offset || 0);
}

sub find_by_release_group
{
    my ($self, $release_group_id, $limit, $offset) = @_;
    my $query = "SELECT " . $self->_columns . "
                 FROM " . $self->_table . "
                 WHERE release_group = ?
                 ORDER BY date_year, date_month, date_day, name.name
                 OFFSET ?";
    return query_to_list_limited(
        $self->c, $offset, $limit, sub { $self->_new_from_row(@_) },
        $query, $release_group_id, $offset || 0);
}

sub insert
{
    my ($self, @releases) = @_;
    my $sql = Sql->new($self->c->mb->dbh);
    $sql->Begin;
    my @created;
    my %names = $self->find_or_insert_names(map { $_->{name} } @releases);
    for my $release (@releases)
    {
        my $row = $self->_hash_to_row($release, \%names);
        $row->{gid} = $release->{gid} || generate_gid();
        push @created, $sql->InsertRow('release', $row, 'id');
    }
    $sql->Commit;
    return wantarray ? @created : $created[0];
}

sub update
{
    my ($self, $release, $update) = @_;
    my $sql = Sql->new($self->c->mb->dbh);
    $sql->Begin;
    my %names = $self->find_or_insert_names($update->{name});
    my $row = $self->_hash_to_row($update, \%names);
    my @columns = keys %$row;
    my $query = 'UPDATE release SET ' .
                join(', ', map { "$_ = ?" } @columns) .
                ' WHERE id = ?';
    $sql->Do($query, (map { $row->{$_} } @columns), $release->id);
    $sql->Commit;
}

sub delete
{
    my ($self, @releases) = @_;
    my $sql = Sql->new($self->c->mb->dbh);
    $sql->Begin;
    $sql->Do('DELETE FROM release WHERE id IN (' . placeholders(@releases) . ')',
        map { $_->id } @releases);
    $sql->Commit;
    return;
}

sub _hash_to_row
{
    my ($self, $release, $names) = @_;
    my $row = {
        artist_credit => $release->{artist_credit},
        release_group => $release->{release_group},
        status => $release->{status},
        packaging => $release->{packaging},
        date_year => $release->{date}->{year},
        date_month => $release->{date}->{month},
        date_day => $release->{date}->{day},
        barcode => $release->{barcode},
        comment => $release->{comment},
        country => $release->{country},
    };

    if ($release->{name})
    {
        $row->{name} = $names->{$release->{name}};
    }

    return { map { $_ => $row->{$_} } grep { defined $row->{$_} } keys %$row };
}

__PACKAGE__->meta->make_immutable;
no Moose;
1;

=head1 NAME

MusicBrainz::Server::Data::Release

=head1 METHODS

=head2 find_by_artist ($artist_id, $limit, [$offset])

Finds releases by the specified artist, and returns an array containing
a reference to the array of releases and the total number of found releases.
The $limit parameter is used to limit the number of returned releass.

=head2 find_by_release_group ($release_group_id, $limit, [$offset])

Finds releases by the specified release group, and returns an array containing
a reference to the array of releases and the total number of found releases.
The $limit parameter is used to limit the number of returned releass.

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
