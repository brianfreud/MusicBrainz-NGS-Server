package MusicBrainz::Server::Data::Vote;
use Moose;

use Moose::Util::TypeConstraints qw( find_type_constraint );
use MusicBrainz::Server::Data::Utils qw( placeholders query_to_list );
use MusicBrainz::Server::Types;

extends 'MusicBrainz::Server::Data::Entity';

sub _columns
{
    return 'id, editor, edit, votetime, vote, superseded';
}

sub _table
{
    return 'vote';
}

sub _entity_class
{
    return 'MusicBrainz::Server::Entity::Vote';
}

sub _column_mapping
{
    return {
        editor_id => 'editor',
        edit_id => 'edit',
        vote => 'vote',
        vote_time => 'votetime',
        superseded => 'superseded',
    };
}

sub enter_votes
{
    my ($self, $editor_id, @votes) = @_;
    return unless @votes;

    # Filter any invalid votes
    my $vote_tc = find_type_constraint('Vote');
    @votes = grep { $vote_tc->check($_->{vote}) } @votes;

    my $sql = Sql->new($self->c->raw_dbh);
    my $query;
    Sql::RunInTransaction(sub {
        $query = 'UPDATE vote SET superseded = TRUE' .
                 ' WHERE editor = ? AND edit IN (' . placeholders(@votes) . ')';
        $sql->Do($query, $editor_id, map { $_->{edit_id} } @votes);

        $query = 'INSERT INTO vote (editor, edit, vote) VALUES ';
        $query .= join ", ", (('(?, ?, ?)') x @votes);
        $sql->Do($query, map { $editor_id, $_->{edit_id}, $_->{vote} } @votes);
    }, $sql);
}

sub load_for_edits
{
    my ($self, @edits) = @_;
    my %id_to_edit = map { $_->id => $_ } @edits;
    my @ids = keys %id_to_edit;
    return unless @ids; # nothing to do
    my $query = "SELECT " . $self->_columns . "
                 FROM " . $self->_table . "
                 WHERE edit IN (" . placeholders(@ids) . ")
                 ORDER BY votetime";
    my @mediums = query_to_list($self->c->raw_dbh, sub {
            my $vote = $self->_new_from_row(@_);
            my $edit = $id_to_edit{$vote->edit_id};
            $edit->add_vote($vote);
            $vote->edit($edit);

            return $vote
        }, $query, @ids);
}

__PACKAGE__->meta->make_immutable;
no Moose;

1;
