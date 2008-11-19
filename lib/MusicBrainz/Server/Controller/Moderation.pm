package MusicBrainz::Server::Controller::Moderation;

use strict;
use warnings;

use base 'MusicBrainz::Server::Controller';

use DBDefs;
use MusicBrainz::Server::Vote;

=head1 NAME

MusicBrainz::Server::Controller::Moderation - handle user interaction
with moderations

=head1 DESCRIPTION

This controller allows editors to view moderations, and vote on open
moderations.

=head1 ACTIONS

=head2 moderation

Root of chained actions that work with a single moderation. Cannot be
called on its own.

=cut

sub moderation : Chained CaptureArgs(1)
{
    my ($self, $c, $mod_id) = @_;
    $c->stash->{moderation} = $c->model('Moderation')->load($mod_id);
}

=head2 list

Show all open moderations in chronological order.

=cut

sub show : Chained('moderation')
{
    my ($self, $c) = @_;

    $c->forward('/user/login');

    my $add_note = $c->form(undef, 'Moderation::AddNote');

    $c->stash->{add_note} = $add_note;

    $c->stash->{expire_action} = \&ModDefs::GetExpireActionText;
    $c->stash->{template     } = 'moderation/show.tt';
}

=head2 add_note

Add a moderation note to an existing edit

=cut

sub add_note : Chained('moderation')
{
    my ($self, $c) = @_;

    $c->forward('/user/login');

    my $moderation = $c->stash->{moderation};

    my $form = $c->form($moderation, 'Moderation::AddNote');
    $form->context($c);

    return unless $c->form_posted && $form->validate($c->req->params);

    $form->insert;

    $c->response->redirect($c->entity_url($moderation, 'show'));
}

=head2 vote

POST only method to enter votes on a moderation

=cut

sub enter_votes : Local
{
    my ($self, $c) = @_;

    $c->forward('/user/login');

    return unless $c->form_posted;

    my %votes;

    while(my ($field, $vote) = each %{ $c->req->params })
    {
        my ($id) = $field =~ m/vote_(\d+)/;
        if (defined $id)
        {
            $votes{$id} = $vote;
        }
    }

    my $sql  = new Sql($c->mb->{DBH});
    my $vote = new MusicBrainz::Server::Vote($c->mb->{DBH});

    eval
    {
        $sql->Begin;
        $vote->InsertVotes(\%votes, $c->user->id);
        $sql->Commit;
    };

    if ($@)
    {
        my $err = $@;
        $sql->Rollback;

        die "Could not enter vote: $err";
    }

    $c->forward('/moderation/open');
}

=head2 approve

Approve action for staging servers (not available on master servers).

=cut

sub approve : Chained('moderation')
{
    my ($self, $c) = @_;

    $c->forward('/user/login');

    die "Approve is only available on test servers"
        unless DBDefs::REPLICATION_TYPE eq MusicBrainz::Server::Replication::RT_STANDALONE;

    my $moderation = $c->stash->{moderation};

    my $vertmb = new MusicBrainz;
    $vertmb->Login(db => 'RAWDATA');

    my $vertsql = Sql->new($vertmb->{DBH});
    my $sql     = Sql->new($c->mb->{DBH});

    $sql->Begin;
    $vertsql->Begin;

    $Moderation::DBConnections{READWRITE} = $sql;
    $Moderation::DBConnections{RAWDATA} = $vertsql;

    my $status = $moderation->ApprovedAction;
    $moderation->status($status);

    my $user = $moderation->moderator;
    $user->CreditModerator($user->id, $status);

    $moderation->CloseModeration($status);

    delete $Moderation::DBConnections{READWRITE};
    delete $Moderation::DBConnections{RAWDATA};

    $vertsql->Commit;
    $sql->Commit;

    # Reload moderation
    $moderation = $c->model('Moderation')->load($moderation->id);
    $c->stash->{moderation} = $moderation;

    $c->flash->{ok} = "Moderation approved";

    $c->forward('show');
}

=head2 reject

Reject action for staging servers (not available on master servers).

=cut

sub reject : Chained('moderation')
{
    my ($self, $c) = @_;

    $c->forward('/user/login');

    die "Reject is only available on test servers"
        unless DBDefs::REPLICATION_TYPE eq MusicBrainz::Server::Replication::RT_STANDALONE;

    my $moderation = $c->stash->{moderation};

    my $vertmb = new MusicBrainz;
    $vertmb->Login(db => 'RAWDATA');

    my $vertsql = Sql->new($vertmb->{DBH});
    my $sql     = Sql->new($c->mb->{DBH});

    $sql->Begin;
    $vertsql->Begin;

    $Moderation::DBConnections{READWRITE} = $sql;
    $Moderation::DBConnections{RAWDATA} = $vertsql;

    my $status = $moderation->DeniedAction;
    $moderation->status($status);

    my $user = $c->model('User')->load({ id => $moderation->moderator });
    $user->CreditModerator($moderation->moderator, $status);

    $moderation->CloseModeration($status);

    delete $Moderation::DBConnections{READWRITE};
    delete $Moderation::DBConnections{RAWDATA};

    $vertsql->Commit;
    $sql->Commit;

    # Reload moderation
    $moderation = $c->model('Moderation')->load($moderation->id);
    $c->stash->{moderation} = $moderation;

    $c->flash->{ok} = "Moderation approved";

    $c->forward('show');
}

=head2 open

Show a list of open moderations

=cut

sub open : Local
{
    my ($self, $c) = @_;

    $c->forward('/user/login');

    use POSIX qw/ceil floor/;

    my $offset = $c->req->query_params->{offset} || 0;
    my $limit  = $c->req->query_params->{limit} || 25;

    $limit = $limit > 100 ? 100 : $limit;
    $limit = $limit < 25  ? 25  : $limit;

    $offset = $offset < 0 ? 0 : $offset;

    my $current_page = floor($offset / $limit) + 1;

    my $edits      = $c->model('Moderation')->list_open($limit, $offset);
    my $total_open = $c->model('Moderation')->count_open();

    $c->stash->{current_page} = $current_page;
    $c->stash->{total_pages}  = ceil($total_open / $limit);
    $c->stash->{url_for_page} = sub {
        my $page_number = shift; # Page number, 0 base
	$page_number--;

        my $new_offset = $page_number * $limit;

        my $query = $c->req->query_params;
        $query->{offset} = $new_offset;

	$c->uri_for('/moderation/open', $query);
    };

    $c->stash->{template} = 'moderation/open.tt';
    $c->stash->{edits   } = $edits;
}

1;