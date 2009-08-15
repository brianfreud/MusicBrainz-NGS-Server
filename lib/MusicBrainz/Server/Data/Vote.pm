package MusicBrainz::Server::Data::Vote;
use Moose;

use Moose::Util::TypeConstraints qw( find_type_constraint );
use MusicBrainz::Server::Data::Utils qw( placeholders );
use MusicBrainz::Server::Types;

extends 'MusicBrainz::Server::Data::Entity';

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

__PACKAGE__->meta->make_immutable;
no Moose;

1;
