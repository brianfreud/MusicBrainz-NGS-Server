#!/home/httpd/musicbrainz/mb_server/cgi-bin/perl -w
# vi: set ts=4 sw=4 :
#____________________________________________________________________________
#
#   MusicBrainz -- the open internet music database
#
#   Copyright (C) 1998 Robert Kaye
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

use FindBin;
use lib "$FindBin::Bin/../../cgi-bin";

use strict;
use warnings;

package TracksWithManyTRMs;
use base qw( MusicBrainz::Server::ReportScript );

sub GatherData
{
	my $self = shift;

	$self->GatherDataFromQuery(<<EOF);
		SELECT t.id AS track_id, t.name AS track_name, a.id AS artist_id,
				a.name AS artist_name, trmcount
		FROM (
			SELECT track, COUNT(*) AS trmcount
			FROM trmjoin
			GROUP BY track
			HAVING COUNT(*) >= 10
		) tmp
		INNER JOIN track t ON t.id = tmp.track
		INNER JOIN artist a ON a.id = t.artist
		ORDER BY trmcount DESC
EOF
}

__PACKAGE__->new->RunReport;

# eof TracksWithManyTRMs.pl
