package MusicBrainz::Server::Controller::EditListingRole;
use Moose::Role -traits => 'MooseX::MethodAttributes::Role::Meta::Role';

use MusicBrainz::Server::Types qw( :edit_status );

requires '_load_paged';

sub open_edits : Chained('load') PathPart('edits')
{
    my ($self, $c) = @_;
    
    my $name = $self->{entity_name};
    my $entity = $c->stash->{ $name };

    my $edits = $self->_load_paged($c, sub {
        my ($offset, $limit) = @_;
        warn $offset; warn $limit;
        $c->model('Edit')->find({ $name => $entity->id }, $offset, $limit);
    });

    $c->model('Editor')->load(@$edits);
    $c->model('Edit')->load_all(@$edits);

    $c->stash(
        edits => $edits,
    );
}

no Moose::Role;
1;
