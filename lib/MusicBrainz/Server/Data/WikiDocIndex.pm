package MusicBrainz::Server::Data::WikiDocIndex;

use Moose;
use Readonly;
use LWP::Simple qw();
use MusicBrainz::Server::Replication ':replication_type';

has 'c' => (
    is => 'ro',
    isa => 'Object'
);

Readonly my $CACHE_PREFIX => "wikidoc";
Readonly my $CACHE_KEY => "wikidoc-index";

sub _index_file { &DBDefs::WIKITRANS_INDEX_FILE }
sub _master_index_url { &DBDefs::WIKITRANS_INDEX_URL }

sub _parse_index
{
    my ($self, $data) = @_;

    my %index;
    foreach my $line (split(/\n/, $data)) {
        my ($page, $version) = split(/=/, $line);
        $index{$page} = $version;
    }
    return \%index;
}

sub _load_index_from_disk
{
    my ($self) = @_;

    if (!open(FILE, "<" . $self->_index_file)) {
        $self->c->log->error("Could not open wikitrans index file: $!.");
        return {};
    }
    my $data = do { local $/; <FILE> };
    close(FILE);

    return $self->_parse_index($data);
}

sub _load_index_from_master
{
    my ($self) = @_;

    my $data = LWP::Simple::get($self->_master_index_url);
    unless (defined $data) {
        $self->c->log->error("Could not fetch wikitrans index file.");
        return {};
    }

    return $self->_parse_index($data);
}

sub _load_index
{
    my ($self) = @_;

    my $cache = $self->c->cache($CACHE_PREFIX);
    my $index = $cache->get($CACHE_KEY);
    return $index
        if defined $index;

    if (&DBDefs::REPLICATION_TYPE == RT_SLAVE) {
        $index = $self->_load_index_from_master;
    }
    else {
        $index = $self->_load_index_from_disk;
    }

    $cache->set($CACHE_KEY, $index);
    return $index;
}

sub _save_index
{
    my ($self, $index) = @_;

    if (!open(FILE, ">" . $self->_index_file)) {
        $self->c->log->error("Could not open wikitrans index file: $!.");
        return;
    }
    foreach my $page (keys %$index) {
        my $version = $index->{$page};
        print FILE "$page=$version\n";
    }
    close(FILE);

    my $cache = $self->c->cache($CACHE_PREFIX);
    $cache->set($CACHE_KEY, $index);
}

sub get_index
{
    my ($self) = @_;

    return $self->_load_index;
}

sub get_page_version
{
    my ($self, $page) = @_;

    return $self->_load_index->{$page};
}

sub set_page_version
{
    my ($self, $page, $version) = @_;

    my $index = $self->_load_index;
    if (defined $version) {
        $index->{$page} = $version;
    }
    else {
        delete $index->{$page};
    }

    $self->_save_index($index);
}

__PACKAGE__->meta->make_immutable;
no Moose;
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
