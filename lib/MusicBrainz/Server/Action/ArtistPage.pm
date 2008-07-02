package MusicBrainz::Server::Action::ArtistPage;

use strict;
use warnings;
use base 'Catalyst::Action';

use MusicBrainz::Server::Artist;
use MusicBrainz;

=head1 NAME

MusicBrainz::Server::Actions::ArtistPage - Custom Action for creating artist pages.

=head1 DESCRIPTION

This fills the Catalyst stash with variables to display the Artist header on a page

=head1 METHODS

=head2 execute

Executes the ArtistPage Action after the action has completed. This will load the artist with a
given MBID into the stash in the {_artist} key. 

=cut

sub execute
{
    my $self = shift;
    my ($controller, $c) = @_;

    my $mbid = $c->request->arguments->[0];
    if (defined $mbid)
    {
        # Validate the MBID
        die "Not a valid GUID"
            unless(MusicBrainz::Server::Validation::IsGUID($mbid));

        my $mb = new MusicBrainz;
        $mb->Login();

        my $artist = MusicBrainz::Server::Artist->new($mb->{DBH});
        $artist->SetMBId($mbid);
        $artist->LoadFromId(1) or $c->error("Failed to load artist");

        die "You cannot view the special DELETED_ARTIST"
            if ($artist->GetId == ModDefs::DARTIST_ID);

        $c->stash->{_artist} = $artist;

        $c->stash->{artist} = {
            name => $artist->GetName,
            type => 'artist',
            mbid => $artist->GetMBId,
            artist_type => MusicBrainz::Server::Artist::GetTypeName($artist->GetType),
            datespan => {
                start => $artist->GetBeginDate,
                end => $artist->GetEndDate
            },
            quality => ModDefs::GetQualityText($artist->GetQuality),
            resolution => $artist->GetResolution,
        };
    }

    $self->NEXT::execute(@_);
}

1;
