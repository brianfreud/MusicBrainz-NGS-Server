package MusicBrainz::Server::Data::Rating;

use Moose;
use Sql;
use MusicBrainz::Server::Data::Utils qw( placeholders query_to_list );
use MusicBrainz::Server::Entity::Rating;

extends 'MusicBrainz::Server::Data::Entity';

has 'type' => (
    isa      => 'Str',
    is       => 'ro',
    required => 1
);

sub find_by_entity_id
{
    my ($self, $id) = @_;

    my $type = $self->type;
    my $query = "
        SELECT editor, rating FROM ${type}_rating_raw
        WHERE $type = ? ORDER BY rating DESC, editor";

    return query_to_list($self->c->raw_dbh, sub {
        my $row = $_[0];
        return MusicBrainz::Server::Entity::Rating->new(
            editor_id => $row->{editor},
            rating => $row->{rating},
        );
    }, $query, $id);
}

sub load_user_ratings
{
    my ($self, $user_id, @objs) = @_;

    my %id_to_obj = map { $_->id => $_ } @objs;
    my @ids = keys %id_to_obj;
    return unless @ids;

    my $type = $self->type;
    my $query = "
        SELECT $type AS id, rating FROM ${type}_rating_raw
        WHERE editor = ? AND $type IN (".placeholders(@ids).")";

    my $sql = Sql->new($self->c->raw_dbh);
    $sql->Select($query, $user_id, @ids);
    while (1) {
        my $row = $sql->NextRowHashRef or last;
        my $obj = $id_to_obj{$row->{id}};
        $obj->user_rating($row->{rating});
    }
    $sql->Finish;
}

sub _update_aggregate_rating
{
    my ($self, $entity_id) = @_;

    my $sql = Sql->new($self->c->dbh);
    my $raw_sql = Sql->new($self->c->raw_dbh);

    my $type = $self->type;
    my $table = $type . '_meta';
    my $table_raw = $type . '_rating_raw';

    # Update the aggregate rating
    my $row = $raw_sql->SelectSingleRowArray("
        SELECT count(rating), sum(rating)
        FROM $table_raw WHERE $type = ?
        GROUP BY $type", $entity_id);

    my ($rating_count, $rating_sum) = defined $row ? @$row : (undef, undef);

    my $rating_avg = ($rating_count ? int($rating_sum / $rating_count + 0.5) : undef);
    $sql->Do("UPDATE $table SET ratingcount = ?, rating = ?
              WHERE id = ?", $rating_count, $rating_avg, $entity_id);

    return ($rating_count, $rating_sum);
}

sub merge
{
    my ($self, $new_id, @old_ids) = @_;

    my $raw_sql = Sql->new($self->c->raw_dbh);

    my $type = $self->type;
    my $table = $type . '_meta';
    my $table_raw = $type . '_rating_raw';

    # Remove duplicate joins (ie, rows with entities from @old_ids and
    # tagged by editors that already tagged $new_id)
    $raw_sql->Do("DELETE FROM $table_raw
                  WHERE $type IN (".placeholders(@old_ids).") AND
                      editor IN (SELECT editor FROM $table_raw WHERE $type = ?)",
                  @old_ids, $new_id);

    # Move all remaining joins to the new entity
    $raw_sql->Do("UPDATE $table_raw SET $type = ?
                  WHERE $type IN (".placeholders(@old_ids).")",
                  $new_id, @old_ids);

    # Update the aggregate rating
    $self->_update_aggregate_rating($new_id);

    return 1;
}

sub delete
{
    my ($self, @entity_ids) = @_;
    my $raw_sql = Sql->new($self->c->raw_dbh);
    $raw_sql->Do("
        DELETE FROM " . $self->type . "_rating_raw
        WHERE " . $self->type . " IN (" . placeholders(@entity_ids) . ")",
        @entity_ids);
    return 1;
}

sub update
{
    my ($self, $user_id, $entity_id, $rating) = @_;

    my ($rating_count, $rating_sum, $rating_avg);

    my $sql = Sql->new($self->c->dbh);
    my $raw_sql = Sql->new($self->c->raw_dbh);
    Sql::RunInTransaction(sub {

        my $type = $self->type;
        my $table = $type . '_meta';
        my $table_raw = $type . '_rating_raw';

        # Check if user has already rated this entity
        my $whetherrated = $raw_sql->SelectSingleValue("
            SELECT rating FROM $table_raw
            WHERE $type = ? AND editor = ?", $entity_id, $user_id);
        if (defined $whetherrated) {
            # Already rated - so update
            if ($rating) {
                $raw_sql->Do("UPDATE $table_raw SET rating = ?
                              WHERE $type = ? AND editor = ?",
                              $rating, $entity_id, $user_id);
            }
            else {
                $raw_sql->Do("DELETE FROM $table_raw
                              WHERE $type = ? AND editor = ?",
                              $entity_id, $user_id);
            }
        }
        elsif ($rating) {
            # Not rated - so insert raw rating value, unless rating = 0
            $raw_sql->Do("INSERT INTO $table_raw (rating, $type, editor)
                          VALUES (?, ?, ?)", $rating, $entity_id, $user_id);
        }

        # Update the aggregate rating
        ($rating_count, $rating_sum) = $self->_update_aggregate_rating($entity_id);

    }, $sql, $raw_sql);

    return ($rating_avg, $rating_count);
}

no Moose;
__PACKAGE__->meta->make_immutable;
1;

=head1 NAME

MusicBrainz::Server::Data::Rating

=head1 METHODS

=head2 delete(@entity_ids)

Delete ratings from the RAWDATA database for entities from @entity_ids.

=head2 update($user_id, $entity_id, $rating)

Update rating for entity $entity_id by editor $user_id to $rating.

Note: this function starts it's own DB transaction.

=head1 COPYRIGHT

Copyright (C) 2009 Lukas Lalinsky
Copyright (C) 2008 Aurelien Mino
Copyright (C) 2007 Sharon Myrtle Paradesi

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

