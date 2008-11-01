#!/usr/bin/perl -w
# vi: set ts=4 sw=4 :
#____________________________________________________________________________
#
#   MusicBrainz -- the internet music database
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

package QuerySupport;

use strict;
use constant TRM_ID_SILENCE              => "7d154f52-b536-4fae-b58b-0666826c2bac";
use constant TRM_TOO_SHORT               => "f9809ab1-2b0f-4d78-8862-fb425ade8ab9";
use constant TRM_SIGSERVER_BUSY          => "c457a4a8-b342-4ec9-8f13-b6bd26c0e400";

use MusicBrainz::Server::Release; # for constants
use DBDefs;
use MusicBrainz::Server::Validation;
use MusicBrainz::Server::LogFile qw( lprint lprintf );
use MusicBrainz::Server::Replication ':replication_type';
use TaggerSupport; # for constants

use Carp qw( carp );
use Digest::SHA1 qw(sha1_hex);
use Apache::Session::File;

use vars qw(@ISA @EXPORT);
@ISA    = @ISA    = '';
@EXPORT = @EXPORT = '';

use constant DEBUG_TRM_LOOKUP => 1;

sub GetCDInfoMM2
{
   my ($dbh, $parser, $rdf, $id, $numtracks) = @_;
   my ($sql, @row, $album, $di, $toc, $i, $currentURI);

   return $rdf->ErrorRDF("No Discid given.") if (!defined $id);

   my $ns = $rdf->GetMMNamespace();
   if (defined $numtracks)
   {
      $toc = "1 $numtracks ";
      $currentURI = $parser->GetBaseURI();
      for($i = 1; $i <= $numtracks + 1; $i++)
      {
          $toc .= $parser->Extract($currentURI, "${ns}toc [$i] ${ns}sectorOffset") . " ";
      }
   }

   # Check to see if the album is in the main database
   require MusicBrainz::Server::ReleaseCDTOC;
   $di = MusicBrainz::Server::ReleaseCDTOC->new($dbh);
   $rdf->SetDepth(5);
   return $di->GenerateAlbumFromDiscid($rdf, $id, $toc);
}

sub AssociateCDMM2
{
   my ($dbh, $parser, $rdf, $Discid, $albumid) = @_;
   my ($numtracks, $di, $toc, $i, $currentURI);

   return $rdf->ErrorRDF("No Discid given.") if (!defined $Discid);

   my $ns = $rdf->GetMMNamespace();

   $currentURI = $parser->GetBaseURI();
   $numtracks = $parser->Extract($currentURI, "${ns}lastTrack");
   $toc = "1 $numtracks ";
   for($i = 1; $i <= $numtracks + 1; $i++)
   {
       $toc .= $parser->Extract($currentURI, "${ns}toc [$i] ${ns}sectorOffset") . " ";
   }

   # Check to see if the album is in the main database
   require MusicBrainz::Server::ReleaseCDTOC;
   $di = MusicBrainz::Server::ReleaseCDTOC->new($dbh);
   $di->Insert($albumid, $toc);
}

# returns artistList
sub FindArtistByName
{
   my ($dbh, $parser, $rdf, $search, $limit) = @_;
   my ($sql, @ids);

   return $rdf->ErrorRDF("No artist search criteria given.")
      if (!defined $search);
   return undef if (!defined $dbh);

   $limit = 15 if not defined $limit;

   require SearchEngine;
   my $engine = SearchEngine->new($dbh, 'artist');

    $engine->Search(
	query => $search,
	limit => $limit,
    );

   while (my $row = $engine->NextRow)
   {
       push @ids, $row->{'artistid'};
   }

   return $rdf->CreateArtistList($parser, @ids);
}

# returns albumList
sub FindAlbumByName
{
   my ($dbh, $parser, $rdf, $search, $limit) = @_;
   my ($sql, @ids);

   return $rdf->ErrorRDF("No album search criteria given.")
      if (!defined $search);
   return undef if (!defined $dbh);

   $limit = 25 if not defined $limit;

   require SearchEngine;
   my $engine = SearchEngine->new($dbh, 'album');

    $engine->Search(
	query => $search,
	limit => $limit,
    );

   while (my $row = $engine->NextRow)
   {
       push @ids, $row->{'albumid'};
   }

   return $rdf->CreateAlbumList(@ids);
}

# returns trackList
sub FindTrackByName
{
   my ($dbh, $parser, $rdf, $search, $limit) = @_;
   my ($sql, @ids);

   return $rdf->ErrorRDF("No track search criteria given.")
      if (!defined $search);
   return undef if (!defined $dbh);

   $limit = 25 if not defined $limit;

   require SearchEngine;
   my $engine = SearchEngine->new($dbh, 'track');

    $engine->Search(
	query => $search,
	limit => $limit,
    );

   while (my $row = $engine->NextRow)
   {
       push @ids, $row->{'trackid'};
   }

   return $rdf->CreateTrackList(@ids);
}

# returns TRMList
sub FindDistinctTRM
{
    my ($dbh, $parser, $rdf, $name, $artist) = @_;

    MusicBrainz::Server::Validation::TrimInPlace($name) if defined $name;
    if (not defined $name or $name eq "")
    {
	carp "Missing name in FindDistinctTRM";
	return $rdf->ErrorRDF("No name or artist search criteria given.");
    }

    MusicBrainz::Server::Validation::TrimInPlace($artist) if defined $artist;
    if (not defined $artist or $artist eq "")
    {
	carp "Missing artist in FindDistinctTRM";
	return $rdf->ErrorRDF("No name or artist search criteria given.");
    }

    my $sql = Sql->new($dbh);

    # This query finds single track id by name and artist
    my $ids = $sql->SelectSingleColumnArray(
	"SELECT	trm.trm
	FROM	track, artist, trmjoin, trm
	WHERE	LOWER(track.name) = LOWER(?)
	AND	LOWER(artist.name) = LOWER(?)
	AND	track.artist = artist.id
	AND	trmjoin.track = track.id
	AND	trm.id = trmjoin.trm",
	$name,
	$artist,
    );

    $rdf->CreateTRMList(@$ids);
}

# returns artistList
sub select_artist_by_guid
{
    my ($dbh, $parser, $rdf, $id) = @_;

    if (not defined $id or $id eq "")
    {
	carp "Missing artist GUID in select_artist_by_guid";
	return $rdf->ErrorRDF("No artist GUID given");
    }

    my $sql = Sql->new($dbh);
    my $artist = $sql->SelectSingleValue(
	"SELECT id FROM artist WHERE gid = ?",
	lc $id,
    );

    return $rdf->CreateArtistList($parser, $artist);
}

# returns album
sub GetAlbumByGlobalId
{
    my ($dbh, $parser, $rdf, $id) = @_;

    if (not defined $id or $id eq "")
    {
	carp "Missing album GUID in GetAlbumByGlobalId";
	return $rdf->ErrorRDF("No album GUID given");
    }

    my $sql = Sql->new($dbh);
    my $album = $sql->SelectSingleValue(
	"SELECT id FROM album WHERE gid = ?",
	lc $id,
    );

    return $rdf->CreateAlbum(0, $album);
}

# returns trackList
sub GetTrackByGlobalId
{
    my ($dbh, $parser, $rdf, $id) = @_;

    if (not defined $id or $id eq "")
    {
	carp "Missing track GUID in GetTrackByGlobalId";
	return $rdf->ErrorRDF("No track GUID given");
    }

    my $sql = Sql->new($dbh);
    my $ids = $sql->SelectSingleColumnArray(
	"SELECT id FROM track WHERE gid = ?",
	lc $id,
    );

    return $rdf->CreateTrackList(@$ids);
}

# returns trackList
sub GetTrackByTRM
{
    my ($dbh, $parser, $rdf, $id) = @_;

    if (not defined $id or $id eq "")
    {
	carp "Missing TRM ID in GetTrackByTRM";
	return $rdf->ErrorRDF("No TRM ID given");
    }

    my $sql = Sql->new($dbh);
    my $ids = $sql->SelectSingleColumnArray(
	"SELECT	trmjoin.track
	FROM	trm, trmjoin
	WHERE	trm.trm = ?
	AND	trmjoin.trm = trm.id",
	lc $id,
    );

    return $rdf->CreateTrackList(@$ids);
}

sub LookupMetadata
{
   my ($dbh, $parser, $rdf, $id) = @_;
   my (@ids, $gu, $tr);

   #PrintData("Lookup:", $id);

   require MusicBrainz::Server::TRM;
   $gu = MusicBrainz::Server::TRM->new($dbh);
   require MusicBrainz::Server::Track;
   $tr = MusicBrainz::Server::Track->new($dbh);

   # has this data been accepted into the database?
   @ids = @{ $gu->GetTrackIdsFromTRM($id) };
   if (scalar(@ids) > 0)
   {
      my (@data, $i);

      # @data will contain 5 items, in the same order as shown above
      @data = $tr->GetMetadataFromIdAndAlbum($ids[0]);
      if (scalar(@data) > 0)
      {
          #PrintData("Matched database (outgoing):", @data);
          return $rdf->CreateMetadataExchange(@data);
      }
   }
   return $rdf->CreateStatus(0);
}

sub PrintData
{
     my ($note, @data) = @_;

     print STDERR "$note\n";
     print STDERR "    Name: $data[0]\n";
     print STDERR "  Artist: $data[1]\n";
     print STDERR "   Album: $data[2]\n";
     print STDERR "     Seq: $data[3]\n";
     print STDERR "    TRM: $data[4]\n";
     print STDERR "Filename: $data[5]\n";
     print STDERR "    Year: $data[6]\n";
     print STDERR "   Genre: $data[7]\n";
     print STDERR " Comment: $data[8]\n";
     print STDERR "Duration: $data[9]\n";
     print STDERR "Bitprint: $data[10]\n";
     print STDERR " First20: $data[11]\n" if (defined $data[11]);
     print STDERR "  Length: $data[12]\n" if (defined $data[12]);
     print STDERR "AudioSHA: $data[13]\n" if (defined $data[13]);
     print STDERR "SampRate: $data[14]\n" if (defined $data[14]);
     print STDERR " BitRate: $data[15]\n" if (defined $data[15]);
     print STDERR "  Stereo: $data[16]\n" if (defined $data[16]);
     print STDERR "     VBR: $data[17]\n\n" if (defined $data[17]);
}

# Data array cross reference
#  0  Name
#  1  Artist
#  2  Album
#  3  Sequence
#  4  TRM
#  5  Filename
#  6  Year
#  7  Genre
#  8  Comment
#  9  Duration (ms)
#  10 Bitprint/Sha1
#  Bitzi data items (not available on MetadataExchangeLite)
#  11 First20
#  12 Length (bytes)
#  13 AudioSha1
#  14 SampleRate
#  15 BitRate
#  16 Stereo
#  17 VBR
sub ExchangeMetadata
{
   my ($dbh, $parser, $rdf, @data) = @_;
   my (@ids, $id, $gu, $pe, $tr, $rv, $ar);

   #PrintData("Incoming:", @data);

   if (!&DBDefs::DB_READ_ONLY)
   {
       require MusicBrainz::Server::Artist;
       $ar = MusicBrainz::Server::Artist->new($dbh);
       require MusicBrainz::Server::TRM;
       $gu = MusicBrainz::Server::TRM->new($dbh);
       require MusicBrainz::Server::Track;
       $tr = MusicBrainz::Server::Track->new($dbh);

       # has this data been accepted into the database?
       @ids = @{ $gu->GetTrackIdsFromTRM($data[4]) };
       if (scalar(@ids) > 0)
       {
           my (@db_data, $i);

           # @db_data will contain 5 items, in the same order as shown above
           @db_data = $tr->GetMetadataFromIdAndAlbum($ids[0], $data[2]);
           if (scalar(@db_data) > 0)
           {
              for($i = 0; $i < 5;  $i++)
              {
                 if (defined $db_data[$i] &&
                    (!defined $data[$i] || $data[$i] eq ''))
                 {
                     $data[$i] = $db_data[$i]
                 }
              }
           }
       }
   }

   return $rdf->CreateMetadataExchange(@data);
}

sub SubmitTrack
{
   my ($dbh, $parser, $rdf, $name, $TRM, $artist, $album, $seq,
       $len, $year, $genre, $comment) = @_;
   my (@albumids, %info, $in, $ret);

   return $rdf->ErrorRDF("This feature is currently not enabled.");

   if (!defined $name || $name eq '' ||
       !defined $album || $album eq '' ||
       !defined $seq || $seq eq '' ||
       !defined $artist || $artist eq '')
   {
       return $rdf->ErrorRDF("Incomplete track information submitted.")
   }

   if (&DBDefs::DB_READ_ONLY)
   {
       return $rdf->ErrorRDF(&DBDefs::DB_READ_ONLY_MESSAGE)
   }

   require Insert;
   $in = Insert->new($dbh);

   $info{artist} = $artist;
   $info{sortname} = $artist;
   $info{album} = $album;
   $info{tracks} =
     [
       {
          track => $name,
          tracknum => $seq,
          duration => $len,
          trmid => $TRM
       }
     ];

   $ret = $in->Insert(\%info);
   return $rdf->ErrorRDF($in->GetError())
      if (!defined $ret);

   return $rdf->CreateStatus(0);
}

sub SubmitTRMList
{
    my ($dbh, $parser, $rdf, $session) = @_;

    return undef if (!defined $dbh);

    if (&DBDefs::DB_READ_ONLY)
    {
      	return $rdf->ErrorRDF(&DBDefs::DB_READ_ONLY_MESSAGE)
    }
    if (&DBDefs::REPLICATION_TYPE == RT_SLAVE)
    {
      	return $rdf->ErrorRDF("You cannot submit TRM identifiers to a mirror server. Please submit them" .
		              " to the main server at http://musicbrainz.org")
    }

    my $sql = Sql->new($dbh);

    my $ns = $rdf->GetMQNamespace();

    my $uri = $parser->GetBaseURI();
    my $clientVer = $parser->Extract($uri, "${ns}clientVersion");
    if (not defined $clientVer)
    {
     	return $rdf->ErrorRDF("Your MusicBrainz client must provide its version " .
                             "id string when submitting data to MusicBrainz.")
    }

    my @links;

    for (my $i = 1; ; $i++)
    {
       my ($trackid, $trmid) = $rdf->GetTRMTrackIdPair($parser, $uri, $i);
       if (!defined $trackid || $trackid eq '' ||
           !defined $trmid || $trmid eq '')
       {
            last if ($i > 1);
            return $rdf->ErrorRDF("Incomplete trackid and trmid submitted.")
       }

       # We have to have a limit, I think.  It's only sensible.
       # So far I've not seen anyone submit more that about 4,500 TRMs at once,
       # so this limit won't affect anyone in a hurry.
       if ($i > 5000)
       {
            return $rdf->ErrorRDF("Too many TRMs submitted at once - the limit is 5000.  Sorry.")
       }

       # Check to see if these trms represent silence or too short TRMs. If so, skip them.
       if ($trmid eq &ModDefs::TRM_TOO_SHORT || $trmid eq &ModDefs::TRM_SIGSERVER_BUSY)
       {
	   next;
       }
       if (!MusicBrainz::Server::Validation::IsGUID($trmid) || !MusicBrainz::Server::Validation::IsGUID($trackid))
       {
           # print STDERR "Invalid track/trm combination:\n";
           # print STDERR "trackid: $trackid\n";
           # print STDERR "trmid: $trmid\n\n";
           return $rdf->ErrorRDF("Invalid trackid or trmid submitted.")
       }

	#lookup the IDs associated with the $trackGID
	require MusicBrainz::Server::Track;
	my $trackobj = MusicBrainz::Server::Track->new($sql->{DBH});
	$trackobj->mbid($trackid);
	unless ($trackobj->LoadFromId)
	{
	    # print STDERR "Unknown MB Track Id: $trackid\n";
	} else {
	    push @links, { trmid => $trmid, trackid => $trackobj->id };
	}
   }

   if (@links)
   {
       eval
       {
	    require Moderation;
	    my @mods;

	    # Break the list of TRMs up into 100 TRMs at a time.
	    # This is so that each moderation is manageably small.
	    while (@links)
	    {
	    	my @thistime;
		if (@links > 100) { @thistime = splice(@links, 0, 100) }
		else { @thistime = @links; @links = () }

		my @mods = Moderation->InsertModeration(
		    DBH => $dbh,
		    uid => $session->{'uid'},
		    privs => 0, # TODO
		    type => &ModDefs::MOD_ADD_TRMS,
		    # --
		    client => $clientVer,
		    links => \@thistime,
		);
	    }
       };
       if ($@)
       {
           print STDERR "Cannot insert TRM: $@\n";
           return $rdf->ErrorRDF("Cannot write TRM Ids to database.")
       }
       return $rdf->CreateStatus(0);
   }

   return $rdf->ErrorRDF("No valid TRM ids were submitted.")
}

sub SubmitTRMFeedback
{
    my ($dbh, $parser, $rdf, $session) = @_;

    return undef if (!defined $dbh);

    if (&DBDefs::DB_READ_ONLY)
    {
      	return $rdf->ErrorRDF(&DBDefs::DB_READ_ONLY_MESSAGE)
    }
    if (&DBDefs::REPLICATION_TYPE == RT_SLAVE)
    {
      	return $rdf->ErrorRDF("You cannot submit TRM feedback to a mirror server. Please submit them" .
		              " to the main server at http://musicbrainz.org")
    }

    my $sql = Sql->new($dbh);

    my $ns = $rdf->GetMQNamespace();

    my $uri = $parser->GetBaseURI();
    for (my $i = 1; ; $i++)
    {
       my ($trackid, $trmid) = $rdf->GetTRMTrackIdPair($parser, $uri, $i);
       if (!defined $trackid || $trackid eq '' ||
           !defined $trmid || $trmid eq '')
       {
            last if ($i > 1);
            return $rdf->ErrorRDF("Incomplete trackid and trmid feedback submitted.")
       }
       # Check to see if these trms represent silence or too short TRMs. If so, skip them.
       if ($trmid eq &ModDefs::TRM_TOO_SHORT || $trmid eq &ModDefs::TRM_SIGSERVER_BUSY)
       {
	   next;
       }
       if (!MusicBrainz::Server::Validation::IsGUID($trmid) || !MusicBrainz::Server::Validation::IsGUID($trackid))
       {
           # print STDERR "Invalid track/trm combination:\n";
           # print STDERR "trackid: $trackid\n";
           # print STDERR "trmid: $trmid\n\n";
           return $rdf->ErrorRDF("Invalid trackid or trmid submitted.")
       }

	#lookup the IDs associated with the $trackGID
	require MusicBrainz::Server::Track;
	my $trackobj = MusicBrainz::Server::Track->new($sql->{DBH});
	$trackobj->mbid($trackid);
	unless ($trackobj->LoadFromId)
	{
	    # print STDERR "Unknown MB Track Id: $trackid\n";
	} else {
	    require MusicBrainz::Server::TRM;
	    my $trmobj = MusicBrainz::Server::TRM->new($sql->{DBH});
	    $trmobj->IncrementUsageCount($trmid, $trackobj->id);
	}
   }

   return $rdf->CreateStatus(0);
}

sub AuthenticateQuery
{
   my ($dbh, $parser, $rdf, $username) = @_;
   my ($session_id, $challenge, $us, $data);
   my ($uid, $digest, $chal_size, $i, $pass);

   if (!defined $username || $username eq '')
   {
       return $rdf->ErrorRDF("Invalid/missing user name.")
   }

   if (&DBDefs::DB_READ_ONLY)
   {
       return $rdf->ErrorRDF(&DBDefs::DB_READ_ONLY_MESSAGE)
   }

   require MusicBrainz::Server::Editor;
   $us = MusicBrainz::Server::Editor->new($dbh);
   ($pass, $uid) = $us->GetUserPasswordAndId($username);
   if (not defined($pass) or $pass eq MusicBrainz::Server::Editor->LOCKED_OUT_PASSWORD)
   {
       return $rdf->ErrorRDF("Unknown user.")
   }

   srand;
   $chal_size = int(rand 16) + 16;
   for($i = 0; $i < $chal_size; $i++)
   {
       $challenge .= sprintf("%02x", int(rand 256));
   }

   $data = $challenge . $username . $pass;
   $digest = sha1_hex($data);

   my %session;
   tie %session, 'Apache::Session::File', undef, {
                 Directory => &DBDefs::SESSION_DIR,
                 LockDirectory   => &DBDefs::LOCK_DIR};

   $session{session_key} = $digest;
   $session{uid} = $uid;
   $session{moderator} = $username;
   $session{expire} = time + &DBDefs::RDF_SESSION_SECONDS_TO_LIVE;

   $session_id = $session{_session_id};
   untie %session;
   # print STDERR "Start session: $username $session_id\n";

   return $rdf->CreateAuthenticateResponse($session_id, $challenge);
}

sub TrackInfoFromTRMId
{
   my ($dbh, $parser, $rdf, $id, $artist, $album, $track,
       $tracknum, $duration, $filename)=@_;
   my ($sql, @ids, $query);

    my $ip = eval { Apache->request->connection->remote_ip } || "?";
    lprint "trmlookup", "begin trm=".($id||'')." ip=$ip";

   return $rdf->ErrorRDF("No trm id given.")
      if (!defined $id || $id eq '');
   return undef if (!defined $dbh);

   lprintf("trmlookup", "TRM lookup, ip=$ip, TRM_SIGSERVER_BUSY"),
   return $rdf->ErrorRDF("This special TRM indicates the TRM server is too busy and cannot be looked up.")
       if ($id eq &ModDefs::TRM_SIGSERVER_BUSY);

   lprintf("trmlookup", "TRM lookup, ip=$ip, TRM_TOO_SHORT"),
   return $rdf->ErrorRDF("This is a special TRM Id associated to files that are too short for a full TRM.")
       if ($id eq &ModDefs::TRM_TOO_SHORT);

   lprintf("trmlookup", "TRM lookup, ip=$ip, TRM_ID_SILENCE"),
   return $rdf->ErrorRDF("This TRM represents silence.  Sorry, you cannot look up this TRM.")
       if ($id eq &ModDefs::TRM_ID_SILENCE);

    # Analysis of recent log files shows that:
    # - 44% of all requests to mb_server are for the TRM gateway.  However
    # these don't hit the database so we'll ignore them.
    # - 43% are for /mm-2.1/TrackInfoFromTRMId (i.e. this subroutine).  So
    # that's approx 90% of all database sessions are handled by this code.

    # This sub has three paths:
    # - HIT: the trm given matches one or more tracks
    # - MISS/HIT: the trm given did not match any tracks, but a TaggerSupport lookup found some tracks
    # - MISS: the trm given did not match any tracks, and a TaggerSupport lookup didn't find anything either

    # Of the calls made to this sub, 80% are "HIT", and approx 80% of all
    # elapsed time in this sub is on the "HIT" path.  So we'll optimise that
    # path.

    use Time::HiRes qw( gettimeofday tv_interval );
    my $t0 = [ gettimeofday ];

   $sql = Sql->new($dbh);
   $id =~ tr/A-Z/a-z/;

    my $selmode;

    if (my $r = Apache->request)
    {
	if ($r->pnotes("is-mbtagger") and $r->the_request =~ m/^POST \/mm-2.1\//)
	{
	    my $answer = run_optimised_trmlookup($sql, $id, $t0, $ip);
	    return $answer if $answer;
	    $selmode = "fast";
	    goto DO_TSLOOKUP;
	}
    }
    
    $selmode = "slow";

   $query = qq|select track.gid
                 from TRM, TRMJoin, track
                where TRM.TRM = ? and
                      TRMJoin.TRM = TRM.id and
                      TRMJoin.track = track.id
		limit 101|;
   if ($sql->Select($query, $id))
   {
       my @row;

       if ($sql->Rows > 100)
       {
	    lprint "trmlookup", "TRM $id matches many tracks - results truncated";
       }

       # If this TRM generated any hits, update the lookup count
       if ($sql->Rows >= 1)
       {
	   require MusicBrainz::Server::TRM;
           MusicBrainz::Server::TRM->IncrementLookupCount($id);
       }
       while(@row = $sql->NextRow())
       {
           push @ids, $row[0];
       }
       $sql->Finish;

	my $t1 = [ gettimeofday ];
	my $out = $rdf->CreateDenseTrackList(0, \@ids);
	lprintf "trmlookup", "TRM lookup, ip=%s, slow select=%.3f, HIT, RDF=%.3f, tracks=%d",
		$ip,
		tv_interval($t0, $t1),
		tv_interval($t1),
		scalar @ids,
		if DEBUG_TRM_LOOKUP;
	return $out;
   }

	$sql->Finish;
DO_TSLOOKUP:
	my $t1 = [ gettimeofday ];

       my (%lookup, $ts);

       $lookup{artist} = $artist;
       $lookup{album} = $album;
       $lookup{track} = $track;
       $lookup{tracknum} = $tracknum;
       $lookup{filename} = $filename;
       $lookup{duration} = $duration;

       require TaggerSupport;
       $ts = TaggerSupport->new($dbh);
       my ($error, $result, $flags, $list) = $ts->Lookup(\%lookup, 3);
	my $t2 = [ gettimeofday ];

       if ($flags & TaggerSupport::ALBUMTRACKLIST)
       {
           my ($id);

           foreach $id (@$list)
           {
               if ($id->{sim} >= .9)
               {
		    my $out = $rdf->CreateDenseTrackList(1, [$id->{mbid}]);
		    lprintf "trmlookup", "TRM lookup, ip=%s, $selmode select=%.3f, MISS, TSLookup=%.3f, HIT, RDF=%.3f",
			    $ip,
			    tv_interval($t0, $t1),
			    tv_interval($t1, $t2),
			    tv_interval($t2),
			    if DEBUG_TRM_LOOKUP;
		    return $out;
               }
           }
       }

	lprintf "trmlookup", "TRM lookup, ip=%s, $selmode select=%.3f, MISS, TSLookup=%.3f, MISS",
		$ip,
		tv_interval($t0, $t1),
		tv_interval($t1, $t2),
		if DEBUG_TRM_LOOKUP;
       return $rdf->CreateStatus(0);
}

# This method is the on the optimised TrackInfoFromTRMId path, and is only
# used if the client is (probably) MB Tagger 0.10.x
sub run_optimised_trmlookup
{
    my ($sql, $trmid, $t0, $ip) = @_;
    my $server = &DBDefs::RDF_SERVER;

    my $rows = $sql->SelectListOfLists(
	<<EOF,
	    SELECT	t.gid, t.name, t.length, t.artist, j.sequence,
			a.gid, a.name, a.attributes, a.artist
	    FROM	trm, trmjoin tj, track t, albumjoin j, album a
	    WHERE	trm.trm = ?
	    AND	tj.trm = trm.id
	    AND	t.id = tj.track
	    AND	j.track = t.id
	    AND	a.id = j.album
	    LIMIT 101
EOF
	$trmid,
    );
    @$rows or return undef;

    if (@$rows > 100)
    {
	lprint "trmlookup", "TRM $trmid matches many tracks - results truncated";
    }

    require MusicBrainz::Server::TRM;
    MusicBrainz::Server::TRM->IncrementLookupCount($trmid);
 
    my %artists;
    for my $artistid (map { $_->[3], $_->[8] } @$rows)
    {
	next if $artists{$artistid};
	require MusicBrainz::Server::Artist;
	my $ar = MusicBrainz::Server::Artist->newFromId($sql->{DBH}, $artistid);
	$artists{$artistid} = $ar;
    }

    my $out = <<'EOF';
<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:dc  = "http://purl.org/dc/elements/1.1/"
         xmlns:mq  = "http://musicbrainz.org/mm/mq-1.1#"
         xmlns:mm  = "http://musicbrainz.org/mm/mm-2.1#"
         xmlns:ar  = "http://musicbrainz.org/ar/ar-1.0#"
         xmlns:az  = "http://www.amazon.com/gp/aws/landing.html#">
  <mq:Result>
    <mq:status>OK</mq:status>
    <mm:trackList>
      <rdf:Bag>
EOF
	$out .= <<EOF
        <rdf:li rdf:resource="http://$server/mm-2.1/track/$_->[0]"/>
EOF
	    for @$rows;
	$out .= <<'EOF';
      </rdf:Bag>
    </mm:trackList>
  </mq:Result>
EOF

    my %albums;

    for my $row (@$rows)
    {
	my $ar = $artists{ $row->[3] }
	    or next;
	my $trackname = $row->[1]; RDF2::escape($trackname);
	my $artistgid = $ar->mbid;

	# Cheat: this is missing the trmidList
	$out .= <<EOF;
  <mm:Track rdf:about="http://$server/mm-2.1/track/$row->[0]">
    <dc:title>$trackname</dc:title>
    <dc:creator rdf:resource="http://$server/mm-2.1/artist/$artistgid"/>
    <mm:duration>$row->[2]</mm:duration>
    <mq:album rdf:resource="http://$server/mm-2.1/album/$row->[5]"/>
  </mm:Track>
EOF

	push @{ $albums{ $row->[5] } }, $row;
    }

    for my $album (values %albums)
    {
	my $row = $album->[0];
	my $ar = $artists{ $row->[8] }
	    or next;
	my $albumname = $row->[6]; RDF2::escape($albumname);
	my $artistgid = $ar->mbid;

	my $typehash = "";
	my $statushash = "";

	{
	    my @attrs = $row->[7] =~ /(\d+)/g;
	    shift @attrs;
	    my ($type, $status) = MusicBrainz::Server::Release->release_type_and_status(\@attrs);
	    $typehash = "Type" . MusicBrainz::Server::Release::attribute_name($type) if $type;
	    $statushash = "Status" . MusicBrainz::Server::Release::attribute_name($status) if $status;
	}

	# Cheat: this is missing the releaseDateList
	$out .= <<EOF;
  <mm:Album rdf:about="http://$server/mm-2.1/album/$row->[5]">
    <dc:title>$albumname</dc:title>
    <dc:creator rdf:resource="http://$server/mm-2.1/artist/$artistgid"/>
EOF
	$out .= <<EOF if $typehash;
    <mm:releaseType rdf:resource="http://musicbrainz.org/mm/mm-2.1#$typehash"/>
EOF
	$out .= <<EOF if $statushash;
    <mm:releaseStatus rdf:resource="http://musicbrainz.org/mm/mm-2.1#$statushash"/>
EOF
	$out .= <<EOF;
    <mm:trackList>
      <rdf:Seq>
EOF
	$out .= <<EOF for @$album;
        <rdf:_$_->[4] rdf:resource="http://$server/mm-2.1/track/$_->[0]"/>
EOF
	$out .= <<EOF;
      </rdf:Seq>
    </mm:trackList>
  </mm:Album>
EOF
    }

    for my $ar (values %artists)
    {
	$ar or next;
	# The "full" RDF code doesn't seem to spit out VARTIST_ID
	my $artistname = $ar->name; RDF2::escape($artistname);
	my $sortname = $ar->sort_name; RDF2::escape($sortname);
	my $artistgid = $ar->mbid;

	# Cheat: this is missing artistType and beginDate
	$out .= <<EOF;
  <mm:Artist rdf:about="http://$server/mm-2.1/artist/$artistgid">
    <dc:title>$artistname</dc:title>
    <mm:sortName>$sortname</mm:sortName>
  </mm:Artist>
EOF
    }

    $out .= <<EOF;
</rdf:RDF>
EOF

    lprintf "trmlookup", "TRM lookup, ip=%s, fast select=%.3f, HIT, tracks=%d",
    	$ip,
	tv_interval($t0),
	scalar @$rows,
	if DEBUG_TRM_LOOKUP;
    return $out;
}

# This method is now deprecated
sub QuickTrackInfoFromTRMId
{
   my ($dbh, $parser, $rdf, $id, $artist, $album, $track,
       $tracknum, $duration, $filename)=@_;
   my ($sql, @data, $out);

   return $rdf->ErrorRDF("No trm id given.")
      if (!defined $id || $id eq '');
   return undef if (!defined $dbh);

   $sql = Sql->new($dbh);
   $id =~ tr/A-Z/a-z/;

   my $query = qq|select Track.name, Artist.name, Album.name,
                         AlbumJoin.sequence, Track.GID, Track.Length
                    from TRM, TRMJoin, Track, AlbumJoin, Album, Artist
                   where TRM.TRM = ? and
                         TRMJoin.TRM = TRM.id and
                         TRMJoin.track = Track.id and
                         Track.id = AlbumJoin.track and
                         Album.id = AlbumJoin.album and
                         Track.Artist = Artist.id|;
   if ($sql->Select($query, $id))
   {
       if ($sql->Rows == 1)
       {
           @data = $sql->NextRow();
	   require MusicBrainz::Server::TRM;
           MusicBrainz::Server::TRM->IncrementLookupCount($id);
       }
       else
       {
           lprint "trmlookup", "TRM collision on: $id";
       }
       $sql->Finish;
   }
   else
   {
       $sql->Finish;
       my (%lookup, $ts);

       $lookup{artist} = $artist;
       $lookup{album} = $album;
       $lookup{track} = $track;
       $lookup{tracknum} = $tracknum;
       $lookup{filename} = $filename;
       $lookup{duration} = $duration;

       require TaggerSupport;
       $ts = TaggerSupport->new($dbh);
       my ($error, $result, $flags, $list) = $ts->Lookup(\%lookup, 3);
       if ($flags & TaggerSupport::ALBUMTRACKLIST)
       {
           my ($id);

           foreach $id (@$list)
           {
               my $sim;

               $sim = ($id->{sim_track} * .5) +
                      ($id->{sim_album} * .5);

               if ($sim >= .9)
               {
                   $data[0] = $id->{name};
                   $data[1] = $id->{artist};
                   $data[2] = $id->{album};
                   $data[3] = $id->{tracknum};
                   $data[4] = $id->{mbid};
                   $data[5] = $id->{tracklen};;
                   last;
               }

           }
       }
   }

   $out = $rdf->BeginRDFObject;
   $out .= $rdf->BeginDesc("mq:Result");
   $out .= $rdf->Element("mq:status", "OK");
   $out .= $rdf->Element("mq:artistName", $data[1]);
   $out .= $rdf->Element("mq:albumName", $data[2]);
   $out .= $rdf->Element("mq:trackName", $data[0]);
   $out .= $rdf->Element("mm:trackNum", $data[3]);
   $out .= $rdf->Element("mm:trackid", $data[4]);
   if (defined $data[5] && $data[5] != 0)
   {
       $out .= $rdf->Element("mm:duration", $data[5]);
   }
   $out .= $rdf->EndDesc("mq:Result");
   $out .= $rdf->EndRDFObject;

   return $out;
}

# This function will also soon be depricated. As soon as MB Tagger 0.10.x becomes
# completely irrelevant this function can go.
sub QuickTrackInfoFromTrackId
{
   my ($dbh, $parser, $rdf, $tid, $aid) = @_;

   return $rdf->ErrorRDF("No track and/or album id given.")
      if (!defined $tid || $tid eq '' || !defined $aid || $aid eq '');
   return undef if (!defined $dbh);

    require MusicBrainz::Server::Release;
    my $album = MusicBrainz::Server::Release->new($dbh);
    $album->mbid($aid);
    unless ($album->LoadFromId)
    {
        return $rdf->ErrorRDF("Cannot load given album.");
    }

    my $sql = Sql->new($dbh);
    my $data = $sql->SelectSingleRowArray(
	"SELECT track.name,
	       	artist.name,
		album.name,
		albumjoin.sequence,
		track.length,
		album.artist,
		artist.gid,
		artist.sortname,
		album.attributes
	FROM	track, albumjoin, album, artist
	WHERE	track.gid = ?
	AND	album.gid = ?
	AND	albumjoin.album = album.id
	AND	albumjoin.track = track.id
	AND	artist.id = track.artist",
	$tid,
	$aid,
    );

    unless ($data)
    {
     	return $rdf->ErrorRDF("Cannot load given album.");
    }

    my @data = @$data;
   my @attrs = ( $data[8] =~ /(\d+)/g );
   shift @attrs;

   my $out = $rdf->BeginRDFObject;
   $out .= $rdf->BeginDesc("mq:Result");
   $out .= $rdf->Element("mq:status", "OK");
   $out .= $rdf->Element("mq:artistName", $data[1]);
   $out .= $rdf->Element("mm:artistid", $data[6]);
   $out .= $rdf->Element("mm:sortName", $data[7]);
   $out .= $rdf->Element("mq:albumName", $data[2]);
   $out .= $rdf->Element("mq:trackName", $data[0]);
   $out .= $rdf->Element("mm:trackNum", $data[3]);
   if ($data[4] != 0)
   {
        $out .= $rdf->Element("mm:duration", $data[4]);
   }

   # This is a total hack, RDF wise speaking. This is to bridge the gap
   # for the MB Tagger 0.10.0 series. Once the new cross platform tagger
   # is out, this function will go away.
   if ($data[5] == &ModDefs::VARTIST_ID)
   {
        $out .= $rdf->Element("mm:albumArtist", &ModDefs::VARTIST_MBID);
   }

   foreach my $attr (@attrs)
   {
       if ($attr >= MusicBrainz::Server::Release::RELEASE_ATTR_SECTION_TYPE_START &&
           $attr <= MusicBrainz::Server::Release::RELEASE_ATTR_SECTION_TYPE_END)
       {
          $out .= $rdf->Element("mm:releaseType", "", "rdf:resource", $rdf->GetMMNamespace() .
                                 "Type" . MusicBrainz::Server::Release::attribute_name($attr));
       }
       elsif ($attr >= MusicBrainz::Server::Release::RELEASE_ATTR_SECTION_STATUS_START &&
              $attr <= MusicBrainz::Server::Release::RELEASE_ATTR_SECTION_STATUS_END)
       {
          $out .= $rdf->Element("mm:releaseStatus", "", "rdf:resource", $rdf->GetMMNamespace() .
                                 "Status" . MusicBrainz::Server::Release::attribute_name($attr));
       }
   }

   my (@releases, $releasedate);
   @releases = $album->ReleaseEvents;
   if (@releases)
   {
       require MusicBrainz::Server::Country;
       my $country_obj = MusicBrainz::Server::Country->new($album->{DBH});

       $out .= $rdf->BeginDesc("mm:releaseDateList");
       $out .= $rdf->BeginSeq();
       for my $rel (@releases)
       {
            my $cid = $rel->country;
            my $c = $country_obj->newFromId($cid);
            my ($year, $month, $day) = $rel->date();

            $releasedate = $year;
            $releasedate .= sprintf "-%02d", $month if ($month != 0);
            $releasedate .= sprintf "-%02d", $day if ($day != 0);
            $out .= $rdf->BeginElement("rdf:li");
            $out .= $rdf->BeginElement("mm:ReleaseDate");
            $out .= $rdf->Element("dc:date", $releasedate);
            $out .= $rdf->Element("mm:country", $c ? $c->GetISOCode : "?");
            $out .= $rdf->EndElement("mm:ReleaseDate");
            $out .= $rdf->EndElement("rdf:li");
        }
        $out .= $rdf->EndSeq();
        $out .= $rdf->EndDesc("mm:releaseDateList");
   }

   $out .= $rdf->EndDesc("mq:Result");
   $out .= $rdf->EndRDFObject;

   return $out;
}

# returns artistList
sub artist_relationships
{
    my ($dbh, $parser, $rdf, $id) = @_;

    if (not defined $id or $id eq "")
    {
	carp "Missing artist GUID in artist_relationships";
	return $rdf->ErrorRDF("No artist GUID given");
    }

    my $ar = MusicBrainz::Server::Artist->new($dbh);
    $ar->mbid($id);
    if (!$ar->LoadFromId())
    {
	carp "Invalid artist is given to GetTrackRelationships";
	return $rdf->ErrorRDF("Invalid artist GUID given");
    }

    my $sql = Sql->new($dbh);
    my @links = MusicBrainz::Server::Link->FindLinkedEntities($dbh, $ar->id, 'artist');

    return $rdf->CreateRelationshipList($parser, $ar, 'artist', \@links);
}

# returns albumList
sub GetAlbumRelationships
{
    my ($dbh, $parser, $rdf, $id) = @_;

    if (not defined $id or $id eq "")
    {
	carp "Missing artist GUID in GetAlbumRelationships";
	return $rdf->ErrorRDF("No album GUID given");
    }

    my $al = MusicBrainz::Server::Release->new($dbh);
    $al->mbid($id);
    if (!$al->LoadFromId())
    {
	carp "Invalid album is given to GetTrackRelationships";
	return $rdf->ErrorRDF("Invalid album GUID given");
    }

    my $sql = Sql->new($dbh);
    my @links = MusicBrainz::Server::Link->FindLinkedEntities($dbh, $al->id, 'album');

    return $rdf->CreateRelationshipList($parser, $al, 'album', \@links);
}

# returns albumList
sub GetTrackRelationships
{
    my ($dbh, $parser, $rdf, $id) = @_;

    if (not defined $id or $id eq "")
    {
	carp "Missing artist GUID in GetTrackRelationships";
	return $rdf->ErrorRDF("No artist GUID given");
    }

    my $tr = MusicBrainz::Server::Track->new($dbh);
    $tr->mbid($id);
    if (!$tr->LoadFromId())
    {
	carp "Invalid artist is given to GetTrackRelationships";
	return $rdf->ErrorRDF("Invalid artist GUID given");
    }

    my $sql = Sql->new($dbh);
    my @links = MusicBrainz::Server::Link->FindLinkedEntities($dbh, $tr->id, 'track');

    return $rdf->CreateRelationshipList($parser, $tr, 'track', \@links);
}

1;
# eof QuerySupport.pm