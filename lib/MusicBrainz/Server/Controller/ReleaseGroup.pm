package MusicBrainz::Server::Controller::ReleaseGroup;
use Moose;

BEGIN { extends 'MusicBrainz::Server::Controller'; }

with 'MusicBrainz::Server::Controller::Annotation';
with 'MusicBrainz::Server::Controller::RelationshipRole';
with 'MusicBrainz::Server::Controller::RatingRole';

__PACKAGE__->config(
    model       => 'ReleaseGroup',
    entity_name => 'rg',
    namespace   => 'release_group',
);

sub base : Chained('/') PathPart('release-group') CaptureArgs(0) { }

after 'load' => sub
{
    my ($self, $c) = @_;
    
    $c->model('ReleaseGroupType')->load($c->stash->{rg});
    $c->model('ArtistCredit')->load($c->stash->{rg});
};

sub show : Chained('load') PathPart('')
{
    my ($self, $c) = @_;

    my $releases = $self->_load_paged($c, sub {
        $c->model('Release')->find_by_release_group($c->stash->{rg}->id, shift, shift);
    });

    $c->model('Medium')->load(@$releases);
    $c->model('MediumFormat')->load(map { $_->all_mediums } @$releases);
    $c->model('Country')->load(@$releases);
    $c->model('ReleaseLabel')->load(@$releases);
    $c->model('Label')->load(map { $_->all_labels } @$releases);

    $c->stash(
        template => 'release_group/index.tt',
        releases => $releases
    );
}

# TODO
sub tags : Chained('load') { }

# TODO
sub details : Chained('load') { }

1;

=head1 NAME

MusicBrainz::Server::Controller::ReleaseGroup - controller for release groups

=head1 COPYRIGHT

Copyright (C) 2009 Oliver Charles

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
