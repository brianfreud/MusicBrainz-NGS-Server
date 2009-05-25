package MusicBrainz::Server::Controller::Work;
use Moose;

BEGIN { extends 'MusicBrainz::Server::Controller'; }

with 'MusicBrainz::Server::Controller::Annotation';

__PACKAGE__->config(
    model       => 'Work',
    entity_name => 'work',
);

sub base : Chained('/') PathPart('work') CaptureArgs(0) { }
sub work : Chained('load') PathPart('') CaptureArgs(0) { }

sub show : PathPart('') Chained('work')
{
    my ($self, $c) = @_;

    my $work = $c->stash->{work};
    $c->model('WorkType')->load($work);
    $c->model('ArtistCredit')->load($work);
    $c->model('Work')->annotation->load_latest($work);

    $c->stash->{template} = 'work/index.tt';
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
