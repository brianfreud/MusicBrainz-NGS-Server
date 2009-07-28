#!/usr/bin/perl
use strict;
use warnings;
use Test::More tests => 2;
BEGIN { use_ok 'MusicBrainz::Server::Edit' }

{
    package Entity;
    use Moose;

    has 'foo_id' => (
        is => 'ro',
        isa => 'Int',
    );

    sub code { 'potatoes' }
};

{
    package TestEdit;
    use Moose;
    extends 'MusicBrainz::Server::Edit';

    sub _mapping
    {
        return (
            foo => 'foo_id',
            bar => sub { shift->code }
        )
    }
};

my $edit = TestEdit->new;
my $instance = Entity->new(foo_id => 5);
is_deeply($edit->_change_hash($instance, qw( foo bar )), { foo => 5, bar => 'potatoes' });
