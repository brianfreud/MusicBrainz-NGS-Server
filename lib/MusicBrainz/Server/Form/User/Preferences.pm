package MusicBrainz::Server::Form::User::Preferences;

use HTML::FormHandler::Moose;
use DateTime;
use DateTime::TimeZone;

extends 'MusicBrainz::Server::Form';

has '+name' => ( default => 'prefs' );

has_field 'public_ratings' => ( type => 'Boolean' );
has_field 'public_subscriptions' => ( type => 'Boolean' );
has_field 'public_tags' => ( type => 'Boolean' );
has_field 'public_collection' => ( type => 'Boolean' );

has_field 'datetime_format' => (
    type => 'Select',
    required => 1,
);

has_field 'timezone' => (
    type => 'Select',
    required => 1,
);

sub options_datetime_format
{
    my @allowed_datetime_formats = (
        '%Y-%m-%d %H:%M:%S %Z',
        '%c',
        '%x %X',
        '%X %x',
        '%A %B %e %Y, %H:%M',
        '%d %B %Y %H:%M:%S',
        '%a %b %e %Y, %H:%M',
        '%d %b %Y %H:%M:%S',
        '%d/%m/%Y %H:%M:%S',
        '%m/%d/%Y %H:%M:%S',
        '%d.%m.%Y %H:%M:%S',
        '%m.%d.%Y %H:%M:%S',
    );

    my $now = DateTime->now;

    my @options;
    foreach my $format (@allowed_datetime_formats) {
        push @options, $format, $now->strftime($format);
    }
    return \@options;
}

sub options_timezone
{
    my @timezones = ('UTC', DateTime::TimeZone->all_names);

    my @options;
    foreach my $timezone (sort @timezones) {
        push @options, $timezone, $timezone;
    }
    return \@options;
}

1;

=head1 COPYRIGHT

Copyright (C) 2009 Lukas Lalinsky

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

=cut
