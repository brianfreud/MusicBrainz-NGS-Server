package MusicBrainz::Server::Data::Role::Name;
use MooseX::Role::Parameterized;

use MusicBrainz::Server::Data::Utils qw( placeholders );

parameter 'name_table' => (
    isa => 'Str',
    required => 1,
);

role
{
    my $params = shift;
    my $table = $params->name_table;

    requires 'c';

    method 'find_or_insert_names' => sub
    {
        my ($self, @names) = @_;
        my $sql = Sql->new($self->c->mb->dbh);
        $sql->Begin;
        my $query = "SELECT id, name FROM $table" .
                    ' WHERE name IN (' . placeholders(@names) . ')';
        my $found = $sql->SelectListOfHashes($query, @names);
        my %found_names = map { $_->{name} => $_->{id} } @$found;
        for my $new_name (grep { !exists $found_names{$_} } @names)
        {
            my $id = $sql->InsertRow($table, {
                    name => $new_name,
                    page => 1234,
                }, 'id');
            $found_names{$new_name} = $id;
        }
        $sql->Commit;
        return %found_names; 
    }
};

no Moose::Role;
1;
