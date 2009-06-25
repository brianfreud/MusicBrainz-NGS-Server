package MusicBrainz::Server::Data::SelectAll;
use MooseX::Role::Parameterized;

parameter 'order_by' => (
    isa => 'ArrayRef',
    default => sub { ['id'] }
);

role
{
    requires '_columns', '_table', '_dbh', '_new_from_row';

    my $p = shift;
    method 'all' => sub
    {
        my $self = shift;
        my $query = "SELECT " . $self->_columns . 
                    " FROM " . $self->_table .
                    " ORDER BY " . (join ", ", @{ $p->order_by });
        my $sql = Sql->new($self->_dbh);
        $sql->Select($query);
        my @result;
        while (1) {
            my $row = $sql->NextRowHashRef or last;
            my $obj = $self->_new_from_row($row);
            push @result, $obj;
        }
        $sql->Finish;
        return @result;
    };
};

no Moose::Role;
1;
