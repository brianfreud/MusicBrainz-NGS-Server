#!/usr/bin/perl -w
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
#   $Id: MOD_EDIT_ALBUMNAME.pm 8492 2006-09-26 22:44:39Z robert $
#____________________________________________________________________________

use strict;

package MusicBrainz::Server::Moderation::MOD_SET_RELEASE_DURATIONS;

use ModDefs qw( :modstatus MODBOT_MODERATOR );
use base 'Moderation';
use MusicBrainz::Server::CDTOC;
use Sql;
use Track;

sub Name { "Set Release Durations" }
(__PACKAGE__)->RegisterHandler;

sub TrackLengthsFromTOC
{
    my $toc = shift;
    map { $_/75*1000 } @{ $toc->GetTrackLengths };
}

sub PreInsert
{
	my ($self, %opts) = @_;

	my $release = $opts{'release'} or die;
	my $cdtoc = $opts{'cdtoc'} or die;

    my $sql = Sql->new($self->{DBH});
    my $tracks = $sql->SelectListOfHashes(
       "SELECT t.id, t.length, j.sequence
          FROM track t, albumjoin j
         WHERE t.id = j.track
           AND j.album = ?
      ORDER BY j.sequence",
       $release->GetId,
    );
    my $prevdurs;
    foreach (@$tracks)
    {
        $prevdurs .= Track::FormatTrackLength($_->{length}) . " ";
    }

    my @dur = TrackLengthsFromTOC($cdtoc);
    my $newdurs;
    foreach (@dur)
    {
        $newdurs .= Track::FormatTrackLength($_) . " ";
    }

    my %new = (
           NewDurs => $newdurs,
           CDTOCId => $cdtoc->GetId
    );

    $self->SetNew($self->ConvertHashToNew(\%new));
	$self->SetPrev($prevdurs);
	$self->SetArtist($release->GetArtist);
	$self->SetTable("album");
	$self->SetColumn("cdtoc.text");
	$self->SetRowId($release->GetId);
}

sub PostLoad
{
	my $self = shift;

	$self->{'new_unpacked'} = $self->ConvertNewToHash($self->GetNew)
		or die;
	($self->{"albumid"}, $self->{"checkexists-album"}) = ($self->GetRowId, 1);
} 

sub CheckPrerequisites
{
	my $self = shift;

	# Load the album by ID
	require Album;
	my $release = Album->new($self->{DBH});
	$release->SetId($self->GetRowId);
	unless ($release->LoadFromId)
	{
		$self->InsertNote(MODBOT_MODERATOR, "This release has been deleted");
		return STATUS_FAILEDDEP;
	}

    # Check to make sure the CD TOC still exists
    my $new = $self->{'new_unpacked'};
    my $cdtocid = $new->{CDTOCId};
    my $cdtoc = MusicBrainz::Server::CDTOC->newFromId($self->{DBH}, $cdtocid);
    if (!defined $cdtocid)
	{
		$self->InsertNote(MODBOT_MODERATOR, "This CD TOC has been deleted");
		return STATUS_FAILEDDEP;
	}

	# Save for ApprovedAction
	$self->{_release} = $release;
	$self->{_cdtoc} = $cdtoc;

	undef;
}

sub ApprovedAction
{
	my $this = shift;

	my $status = $this->CheckPrerequisites;
	return $status if $status;

    my $release = $this->{_release};
    my $cdtoc = $this->{_cdtoc};
    my @durs = TrackLengthsFromTOC($cdtoc);

    my $sql = Sql->new($this->{DBH});
    my $tracks = $sql->SelectListOfHashes(
       "SELECT t.id, t.length, j.sequence
          FROM track t, albumjoin j
         WHERE t.id = j.track
           AND j.album = ?
      ORDER BY j.sequence",
       $release->GetId,
    );

    for my $t (@$tracks)
    {
        my $id = $t->{id};
        my $l = int($durs[$t->{sequence}-1]);
        $sql->Do("UPDATE track SET length = ? WHERE id = ?", $l, $id);
    }

	STATUS_APPLIED;
}

1;
# eof MOD_SET_RELEASE_DURATIONS.pm