#!/home/httpd/musicbrainz/mb_server/cgi-bin/perl -w
# vi: set ts=4 sw=4 :
#____________________________________________________________________________
#
#   MusicBrainz -- the open internet music database
#
#   Copyright (C) 2000 Robert Kaye
#
#   This program is free software; you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation; either version 2 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program; if not, write to the Free Software
#   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
#
#   $Id$
#____________________________________________________________________________

use strict;

package MusicBrainz::Server::Moderation::MOD_REMOVE_PUID;

use ModDefs;
use base 'Moderation';

sub Name { "Remove PUID ID" }
(__PACKAGE__)->RegisterHandler;

sub PreInsert
{
	my ($self, %opts) = @_;

	my $track = $opts{'track'} or die;
	my $puid = $opts{'puid'} or die;
	my $puidjoinid = $opts{'puidjoinid'} or die;

	$self->SetTable("puidjoin");
	$self->SetColumn("id");
	$self->SetRowId($puidjoinid);
	$self->SetArtist($track->GetArtist);
	$self->SetPrev($puid);

	# Save the PUID's clientversion in case we need to re-add it
	require PUID;
	my $puidobj = PUID->new($self->{DBH});
	my $clientversion = $puidobj->FindPUIDClientVersion($puid);

	my %new = (
		TrackId => $track->GetId,
		ClientVersion => $clientversion,
	);

	$self->SetNew($self->ConvertHashToNew(\%new));

	# This is one of those mods where we give the user instant gratification,
	# then undo the mod later if it's rejected.
	require PUID;
	my $t = PUID->new($self->{DBH});
	$t->RemovePUIDByPUIDJoin($self->GetRowId);
}

sub PostLoad
{
	my $self = shift;
	$self->{'new_unpacked'} = $self->ConvertNewToHash($self->GetNew)
		or die;
		
	my $new = $self->{'new_unpacked'};
	($self->{"trackid"}, $self->{"checkexists-track"}) = ($new->{'TrackId'}, 1);	
}

sub AdjustModPending { () }

sub ApprovedAction
{
	&ModDefs::STATUS_APPLIED;
}

sub DeniedAction
{
	my $self = shift;
	my $new = $self->{'new_unpacked'};

	my $trackid = $new->{'TrackId'}
		or return;

	require Track;
	my $track = Track->new($self->{DBH});
	$track->SetId($trackid);
	unless ($track->LoadFromId)
	{
		$self->InsertNote(
			&ModDefs::MODBOT_MODERATOR,
			"This track has been deleted",
		);
		return;
	}

	require PUID;
	my $t = PUID->new($self->{DBH});
	my $id = $t->Insert($self->GetPrev, $trackid, $new->{'ClientVersion'});

	# The above Insert can fail, usually if the row in the "puid" table
	# needed to be re-inserted but we neglected to save the clientversion
	# before it was deleted (i.e. mods inserted before this bug was
	# fixed).
	if (not $id)
	{
		$self->InsertNote(
			&ModDefs::MODBOT_MODERATOR,
			"Unable to re-insert PUID",
		);
	}
}

1;
# eof MOD_REMOVE_PUID.pm
