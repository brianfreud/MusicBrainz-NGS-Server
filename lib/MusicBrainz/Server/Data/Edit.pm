package MusicBrainz::Server::Data::Edit;
use Moose;

use DateTime;
use MusicBrainz::Server::Edit;
use XML::Simple;

extends 'MusicBrainz::Server::Data::Entity';

sub _table
{
    return 'edit';
}

sub _columns
{
    return 'edit.id, edit.editor, edit.opentime, edit.expiretime, 
            edit.closetime, edit.data, edit.language, edit.type,
            edit.yesvotes, edit.novotes';
}

sub _dbh
{
    return shift->c->raw_dbh;
}

sub _new_from_row
{
    my ($self, $row) = @_;

    # Readd the class marker
    my $class = MusicBrainz::Server::Edit->class_from_type($row->{type})
        or die "Could not look up class for type";
    my $data = XMLin($row->{data}, SuppressEmpty => 1);

    my $edit = $class->new(
        id => $row->{id},
        yes_votes => $row->{yesvotes},
        no_votes => $row->{novotes},
        editor_id => $row->{editor},
    );
    $edit->restore($data);
    $edit->created_time($row->{opentime});
    $edit->expires_time($row->{expiretime});
    $edit->close_time($row->{closetime}) if defined $row->{closetime};
    return $edit;
}

sub insert
{
    my ($self, @edits) = @_;
    my $sql = Sql->new($self->c->raw_dbh);
    for my $edit (@edits)
    {
        $edit->insert;

        my $row = $self->_to_row($edit);
        my $open = DateTime->now;
        my $expire = $open + DateTime::Duration->new(days => 7);

        $row->{opentime} = $open;
        $row->{expiretime} = $expire;
        $row->{closetime} = DateTime->now if $edit->is_auto_edit;

        my $edit_id = $sql->InsertRow('edit', $row, 'id');
        $edit->id($edit_id);
    }
    return @edits > 1 ? @edits : $edits[0];
}

sub _to_row
{
    my ($self, $edit) = @_;
    return {
        editor => $edit->editor_id,
        data => XMLout($edit->to_hash, NoAttr => 1),
        status => $edit->status,
        type => $edit->edit_type,
    };
}

__PACKAGE__->meta->make_immutable;
no Moose;

1;

