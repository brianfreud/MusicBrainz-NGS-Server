package MusicBrainz::Server::Filters;

use strict;
use warnings;

use MusicBrainz::Server::DateTime;
use MusicBrainz::Server::Track;

sub date
{
    my $date = shift;
    return MusicBrainz::Server::DateTime::format_datetime($date);
}

sub release_date
{
    my $date = shift;

    my ($y, $m, $d) = split /-/, $date;

    my $str = "";

    $str .= $y     if ($y && 0 + $y);
    $str .= "-".$m if ($m && 0 + $m);
    $str .= "-".$d if ($d && 0 + $d);

    return $str;
}

sub format_time
{
    my $ms = shift;
    return MusicBrainz::Server::Track::FormatTrackLength($ms);
}

1;
