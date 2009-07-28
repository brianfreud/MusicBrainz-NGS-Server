#!/usr/bin/perl
# vi: set ts=4 sw=4 :
#____________________________________________________________________________
#
#   MusicBrainz -- the open internet music database
#
#   Copyright (C) 2004 Robert Kaye
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

package MusicBrainz::Server::Annotation;

use strict;
use warnings;
use MusicBrainz::Server::Editor;

BEGIN
{
    use TableBase;
    { our @ISA = qw( TableBase Exporter ) }

    use Exporter;
    our @EXPORT_OK = qw(
        ARTIST_ANNOTATION
        RELEASE_ANNOTATION
        LABEL_ANNOTATION
        TRACK_ANNOTATION
    );

    our %EXPORT_TAGS = (
        type => [qw( ARTIST_ANNOTATION RELEASE_ANNOTATION LABEL_ANNOTATION TRACK_ANNOTATION )],
    );
}

use ModDefs qw( :artistid MODBOT_MODERATOR );

use Carp qw( cluck croak );
use Encode qw( encode decode );
use Text::WikiFormat;
use DBDefs;
require Moderation; # FIXME? circular dependency
use MusicBrainz::Server::Validation qw( encode_entities );

use constant ARTIST_ANNOTATION	=>	1;
use constant RELEASE_ANNOTATION	=>	2;
use constant LABEL_ANNOTATION	=>	3;
use constant TRACK_ANNOTATION	=>	4;


use constant TRUNC_NONE => 0;
use constant TRUNC_PARA => 1;
use constant TRUNC_WORD => 2;

sub new
{
	my $class = shift;
	my $self = $class->SUPER::new(@_);

	return $self;
}

sub moderator
{
    my ($self, $new_moderator) = @_;

    if (defined $new_moderator) { $self->{moderator} = $new_moderator; }
    return $self->{moderator};
}

sub moderator_name
{
    my ($self, $new_name) = @_;

    if (defined $new_name) { $self->{moderator_name} = $new_name; }
    return $self->{moderator_name};
}

sub moderation
{
    my ($self, $new_mod) = @_;

    if (defined $new_mod) { $self->{moderation} = $new_mod; }
    return $self->{moderation};
}

sub change_log
{
    my ($self, $new_change_log) = @_;

    if (defined $new_change_log) { $self->{changelog} = $new_change_log; }
    return $self->{changelog};
}

sub entity_id
{
    my ($self, $entity_type, $new_id) = @_;

    if (defined $new_id and defined $entity_type)
    {
        use Switch;
        switch ($entity_type)
        {
            case('artist')  { $self->artist($new_id); }
            case('label')   { $self->SetLabel($new_id); }
            case('release') { $self->release($new_id); }
            case('track')   { $self->SetTrack($new_id); }
        }
    }

	return $self->{rowid};
}

sub GetLabel
{
	return $_[0]->{rowid};
}

sub GetTrack
{
	return $_[0]->{rowid};
}

sub creation_time
{
    my ($self, $new_time) = @_;

    if (defined $new_time) { $self->{creation_time} = $new_time; }
    return $self->{creation_time};
}

sub text
{
    my ($self, $new_text) = @_;

    if (defined $new_text) { $self->{text} = $new_text; }
    return $self->{text};
}

sub type
{
    my ($self, $new_type) = @_;

    if (defined $new_type) { $self->{type} = $new_type; }
    return $self->{type};
}

sub type_word
{
	return "artist" if $_[0]{type} == ARTIST_ANNOTATION;
	return "album" if $_[0]{type} == RELEASE_ANNOTATION;
	return "label" if $_[0]{type} == LABEL_ANNOTATION;
	return "track" if $_[0]{type} == TRACK_ANNOTATION;
	die;
}

sub text_as_html
{
	my $self = shift;
	my $text = $self->text;
	if ($text eq '')
	{
		return $text
	}
	else 
	{
            $text =~ s/</&lt;/g;
            $text =~ s/>/&gt;/g;
    		return Text::WikiFormat::format($text, {}, 
		    	            		    { prefix => "http://wiki.musicbrainz.org/",
            			        	      extended => 1,
		    				      absolute_links => 1,
	                                	      implicit_links => 0
			    	        	    });
	}
}

sub summary_as_html
{
	my ($self, $morelink) = @_;

	my ($trunc_type, $text) = $self->summary;
	if ($text ne '')
	{
	    $text =~ s/</&lt;/g;
	    $text =~ s/>/&gt;/g;
	    $text = Text::WikiFormat::format($text, {}, 
			                	{ prefix => "http://wiki.musicbrainz.org/",
        			    		  extended => 1,
						  absolute_links => 1,
                        			  implicit_links => 0
			    			});
	}

	$text =~ s[(?:</p>\s*)?\z][&nbsp;&hellip;]
		if $trunc_type == TRUNC_WORD;

	$text =~ s[(?:</p>\s*)?\z][&nbsp;$morelink]
		if $trunc_type != TRUNC_NONE;

	$text;
}

sub release
{
    my ($self, $new_release) = @_;

    if (defined $new_release)
    {
        $self->{type } = RELEASE_ANNOTATION;
        $self->{rowid} = $new_release;
    }

    return $self->{album};
}

sub artist
{
    my ($self, $new_artist) = @_;

    if (defined $new_artist)
    {
        $self->{type } = ARTIST_ANNOTATION;
        $self->{rowid} = $new_artist;
    }

    return $self->{rowid};
}

sub SetLabel
{
	$_[0]->{type} = LABEL_ANNOTATION;
	$_[0]->{rowid} = $_[1];
}

sub SetTrack
{
	$_[0]->{type} = TRACK_ANNOTATION;
	$_[0]->{rowid} = $_[1];
}

# Make an annotation object just from some text (for preview purposes)

sub newPreview
{
	my ($class, $text) = @_;
	bless {
		text => $text,
	}, $class;
}

# Load and construct from an ID

sub newFromId
{
	my $self = shift;
	$self = $self->new(shift) if not ref $self;
	my $id = shift;

	$self->id($id);
	$self->LoadFromId
		or return undef;
	$self;
}

# Load an annotation. The id has to be set via id() or moderation().

sub LoadFromId
{
	my $self = shift;

	my $searchby;
	my $id;
	if ( defined $self->{id} ) {
		$searchby = 'a.id';
		$id = $self->{id};
	}
	else {
		$searchby = 'a.moderation';
		$id = $self->{moderation};
	}

	my $sql = Sql->new($self->dbh);
	my $row = undef;
        use MusicBrainz::Server::Replication 'RT_SLAVE';
        if (&DBDefs::REPLICATION_TYPE == RT_SLAVE) {

	$row = $sql->SelectSingleRowArray(
		  "SELECT	a.id, a.moderator, a.type, a.rowid, a.text, a.created, "
		. "		a.moderation, a.changelog "
		. "FROM		annotation a "
		. "WHERE	$searchby = ? ",
		$id,
	) or return undef;

	} else { # Not replicated

        $row = $sql->SelectSingleRowArray(
                  "SELECT       a.id, a.moderator, a.type, a.rowid, a.text, a.created, "
                . "                     a.moderation, a.changelog, m.name "
                . "FROM         annotation a, moderator m "
                . "WHERE        $searchby = ? AND a.moderator = m.id ",
                $id,
        ) or return undef;
}

	$self->{id}				= $row->[0];
	$self->{moderator}		= $row->[1];
	$self->{type}			= $row->[2];
	$self->{rowid}			= $row->[3];
	$self->{text}			= $row->[4];
	$self->{creation_time}	= $row->[5];
	$self->{moderation}		= $row->[6];
	$self->{changelog}		= $row->[7];
        if (&DBDefs::REPLICATION_TYPE == RT_SLAVE) {
                $self->{moderator_name}         = undef;
        } else {
                $self->{moderator_name}         = $row->[8];
        }

	return 1;
}

# Get the latest Annotation for the artist or release.
# To make this work, artist() or release() have to be called

sub GetLatestAnnotation
{
	my $self = shift;
	
	my $sql = Sql->new($self->dbh);
	
	my $query = undef;
    if (&DBDefs::REPLICATION_TYPE == RT_SLAVE)
	{
		$query = q{
			SELECT a.id, a.moderator, a.text, a.created,
				   a.moderation, a.changelog
              FROM annotation a
             WHERE a.rowid = ? AND a.type = ?
          ORDER BY a.id DESC
             LIMIT 1
			};
	}
	else
	{
		$query = q{
			SELECT a.id, a.moderator, a.text, a.created,
			       a.moderation, a.changelog, m.name
			  FROM annotation a, moderator m
             WHERE a.rowid = ? AND a.type = ?
               AND a.moderator = m.id
          ORDER BY a.id DESC
             LIMIT 1
			};
	}
	
	my $row = $sql->SelectSingleRowArray(
		$query,
		$self->{rowid},
		$self->{type},
	) or return undef;

	$self->{id}             = $row->[0];
	$self->{moderator}      = $row->[1];
	$self->{text}           = $row->[2];
	$self->{creation_time}  = $row->[3];
	$self->{moderation}     = $row->[4];
	$self->{changelog}      = $row->[5];
	$self->{moderator_name} = $row->[6];
	
	return $self;
}

# Insert an annotation. Moderator and release have to be set.
# If the text attribute is unset, an empty annotation is inserted.

sub Insert
{
	my $self = shift;

	# Disallow special artists
	return undef
		if $self->{type} == ARTIST_ANNOTATION
		and ($self->{rowid} == VARTIST_ID or $self->{rowid} == DARTIST_ID);

	my $sql = Sql->new($self->dbh);

	$sql->Do(
		  "INSERT INTO annotation "
		. "(moderator, moderation, type, rowid, changelog, text) "
		. "VALUES (?, ?, ?, ?, ?, ?)",
		$self->{moderator}->id,
		$self->{moderation},
		$self->{type},
		$self->{rowid},
		$self->{changelog},
		$self->{text},
	);

	$self->{id} = $sql->GetLastInsertId('annotation');

	return $self->{id};
}

# Returns a reference to an array of Annotation IDs for the specified
# object.

sub GetAnnotationIDs
{
    my $self = shift;
    my $sql  = Sql->new($self->dbh);

    return $sql->SelectSingleColumnArray(
        "SELECT id FROM annotation WHERE rowid = ? AND type = ? ORDER BY id DESC",
        $self->{rowid}, $self->{type},
    );
}

################################################################################

# Given two annotations, are they for the same host object?

sub IsForSameObject
{
	my ($self, $other) = @_;
	$self->{type} == $other->{type}
		and $self->{rowid} == $other->{rowid};
}

# Get the IDs of all annotations for the same host object as this

sub GetAllIDs
{
	my $self = shift;
	(ref $self)->_GetAnnotationIDs($self->{dbh}, $self->{rowid}, $self->{type});
}

# Get the ID of the annotation prior to this one

sub GetPreviousID
{
	my $self = shift;
	my $ids = $self->GetAllIDs;
	$ids = join " ", @$ids;
	($ids =~ /\b$self->{id}\b (\d+)/)
		? $1 : undef;
}

sub GetPrevious
{
	my $self = shift;
	my $prev_id = $self->GetPreviousID
		or return undef;
	(ref $self)->newFromId($self->{dbh}, $prev_id);
}

sub IsBlank
{
	not($_[0]->text =~ /\S/);
}

################################################################################
# Merging and Deleting
################################################################################

sub MergeArtists
{
	my $self = shift;
	$self->_Merge(ARTIST_ANNOTATION, @_);
}

sub MergeLabels
{
	my $self = shift;
	$self->_Merge(LABEL_ANNOTATION, @_);
}

sub MergeReleases
{
	my $self = shift;
	$self->_Merge(RELEASE_ANNOTATION, @_);
}

sub MergeTracks
{
	my $self = shift;
	$self->_Merge(TRACK_ANNOTATION, @_);
}

sub _Merge
{
	my $self = shift;
	my $type = shift;
	$self = $self->new(shift) if not ref $self;
	my $old_id = shift;
	my $new_id = shift;
	my %opts = @_;

	my $sql = Sql->new($self->dbh);

	# If the target artist is VARTIST_ID, simply delete any old annotations.
	if ($type == ARTIST_ANNOTATION and $old_id == VARTIST_ID)
	{
		$sql->Do(
			"DELETE FROM annotation WHERE type = ? AND rowid = ?",
			$type,
			$old_id,
		);
		return;
	}

	# Get latest annotation for "old".  If there are no annotations, there is
	# nothing to do.
	my $old_latest = (ref $self)->new($self->dbh);
	$old_latest->{type} = $type;
	$old_latest->{rowid} = $old_id;
	$old_latest->GetLatestAnnotation
		or return;
	
	# Get latest annotation for "new".
	my $new_latest = (ref $self)->new($self->dbh);
	$new_latest->{type} = $type;
	$new_latest->{rowid} = $new_id;
	$new_latest->GetLatestAnnotation
		or $new_latest = undef;

	# Move all the annotations from old to new
	$sql->Do(
		"UPDATE annotation SET rowid = ? WHERE type = ? AND rowid = ?",
		$new_id,
		$type,
		$old_id,
	);

	# If there were previously no annotations for "new", then we're done.
	return if not $new_latest;

	# Otherwise, both old and new had annotations, so we need to merge them.
	# We've already moved them all from old to new, so now we need to create a
	# new annotation at the head of the bunch which represents both
	# $old_latest and $new_latest.

	my $text = $new_latest->text
		. "\n\n"
		. $old_latest->text;

	require MusicBrainz::Server::Editor;

	if ($type == ARTIST_ANNOTATION)
	{
		my @mods = Moderation->InsertModeration(
			dbh	=> $self->{dbh},
			uid	=> MODBOT_MODERATOR,
			privs => MusicBrainz::Server::Editor->AUTOMOD_FLAG,
			type => &ModDefs::MOD_ADD_ARTIST_ANNOTATION,
			# --
			artistid => $new_id,
			text => $text,
			changelog => "Result of artist merge",
            notrans => 1
		);
	} 
	elsif ($type == LABEL_ANNOTATION) 
	{
		my @mods = Moderation->InsertModeration(
			DBH	=> $self->{dbh},
			uid	=> MODBOT_MODERATOR,
			privs => MusicBrainz::Server::Editor->AUTOMOD_FLAG,
			type => &ModDefs::MOD_ADD_LABEL_ANNOTATION,
			# --
			labelid => $new_id,
			text => $text,
			changelog => "Result of label merge",
            notrans => 1
		);
	} 
	elsif ($type == RELEASE_ANNOTATION) 
	{
		my $artist_id = $opts{artistid} or die;

		my @mods = Moderation->InsertModeration(
			dbh	=> $self->{dbh},
			uid	=> MODBOT_MODERATOR,
			privs => MusicBrainz::Server::Editor->AUTOMOD_FLAG,
			type => &ModDefs::MOD_ADD_RELEASE_ANNOTATION,
			# --
			artistid => $artist_id,
			albumid => $new_id,
			text => $text,
			changelog => "Result of album merge",
            notrans => 1
		);
	}
	elsif ($type == TRACK_ANNOTATION) 
	{
		my $artist_id = $opts{artistid} or die;

		my @mods = Moderation->InsertModeration(
			DBH	=> $self->{dbh},
			uid	=> MODBOT_MODERATOR,
			privs => MusicBrainz::Server::Editor->AUTOMOD_FLAG,
			type => &ModDefs::MOD_ADD_TRACK_ANNOTATION,
			# --
			artistid => $artist_id,
			trackid => $new_id,
			text => $text,
			changelog => "Result of track merge",
			notrans => 1
		);
	}
}

sub DeleteArtist
{
	my $self = shift;
	$self->_Delete(ARTIST_ANNOTATION, @_);
}

sub DeleteRelease
{
	my $self = shift;
	$self->_Delete(RELEASE_ANNOTATION, @_);
}

sub DeleteLabel
{
	my $self = shift;
	$self->_Delete(LABEL_ANNOTATION, @_);
}

sub _Delete
{
	my $self = shift;
	my $type = shift;
	$self = $self->new(shift) if not ref $self;
	my $old_id = shift;

	# Delete the data
	my $sql = Sql->new($self->dbh);
	$sql->Do(
		"DELETE FROM annotation WHERE type = ? AND rowid = ?",
		$type,
		$old_id,
	);
}

################################################################################
# Advisory Locking
################################################################################

sub _key
{
	my ($class, $type, $id) = @_;
	"annotation-$type-$id-lock";
}

sub LockedBy
{
	my ($class, $type, $id, $session_id) = @_;
	my $key = $class->_key($type, $id);
	MusicBrainz::Server::Cache->get($key) || "";
}

sub GetLock
{
	my ($class, $type, $id, $session_id) = @_;
	my $key = $class->_key($type, $id);
	MusicBrainz::Server::Cache->set($key, $session_id, &DBDefs::ANNOTATION_LOCK_TIME);
}

sub ReleaseLock
{
	my ($class, $type, $id, $session_id) = @_;
	my $key = $class->_key($type, $id);
	MusicBrainz::Server::Cache->delete($key);
}

################################################################################
# Given the full text entry, chop it down to something nice and short
################################################################################

# Lots of hard-wired numbers in here representing what I think are sensible
# settings.

sub summary
{
	my $self = shift;
	my $text = $self->{text};
	
	# fix for ticket 1649, turn off truncating annotation texts.
	return(TRUNC_NONE, $text);

	use MusicBrainz::Server::Validation qw( encode_entities );

	$text = decode "utf-8", $text;
	$text =~ s/(\015\012|\012\015|\012|\015)\1+/\n\n/g;
	$text =~ s/\s+\z//;

	# shorten url's that are longer than ~50 chars.
	my $is_url = 1;	
	$text = join "", map {

		# shorten url's that are longer 50 characters
		my $encurl = encode_entities($_);
		my $shorturl = $encurl;
		if (length($_) > 50)
		{
			$shorturl = substr($_, 0, 48);
			$shorturl = encode_entities($shorturl);
			$shorturl .= "&#8230;";
		}					
		($is_url = not $is_url)
			? qq[<a href="$encurl" title="$encurl">$shorturl</a>]
			: $_; # since we feed the text into the
				  # Text::WikiFormat class, there's no need
				  # to encode the text if it is not an url.
			 
	} split /
		(
			# Something that looks like the start of a URL
			\b
			(?:https?|ftp)
			:\/\/
			.*?
			# Stop at one of these sequences:
			(?=
				\z # end of string
				| \s # any space
				| [,\.!\?](?:\s|\z) # punctuation then space or end
				| [\x29"'>] # any of these characters
			)
		)
		/six, $text, -1;

	# Is there a summary marker? (specifically, a paragraph consisting entirely
	# of hyphens).
	if (my ($summary, $rest) = $text =~ /\A(.*)\n\n+-+\n\n(.*)\z/s)
	{
		my ($sc, $sw, $sl, $sp) = $self->_count_text($summary);

		# Is the marker in a sensible place?  If so, return the summary text
		return (TRUNC_PARA, encode("utf-8", $summary))
			if $sw >= 20 and $sl <= 10;

		$text = $summary . "\n\n" . $rest;
	}

	# No (sensible) summary marker.  Try to guess a sensible place to split
	# the text.
	my ($c, $w, $l, $p) = $self->_count_text($text);
	
	# Return the whole thing if it's short enough
	return (TRUNC_NONE, encode("utf-8", $text))
		if $l <= 10;

	# Try to break on a paragraph
	my @paras = split /\n\n+/, $text;
	for my $n (reverse(0..$#paras))
	{
		my $try = join "\n\n", @paras[0..$n];
		my ($tc, $tw, $tl, $tp) = $self->_count_text($try);
		return (TRUNC_PARA, encode("utf-8", $try))
			if $tl <= 10;
	}

	# Chop at 500 characters and rewind back to a whole word.
	$text = substr($text, 0, 500)
		if length($text) > 500;
	$text =~ s/\s\S+\z//;
	return(TRUNC_WORD, encode("utf-8", $text));
}

# Given some text, count characters, words, lines and paragraphs

sub _count_text
{
	my ($class, $text) = @_;

	my $c = length $text;
	my $w = @{[ $text =~ /\b\w/g ]};
	my $p = @{[ $text =~ /\n\n+/g ]};
	my $l = ($c / 100)+$p;

	return ($c, $w, $l, $p);
}

1;
# eof Annotation.pm
