package MusicBrainz::Server::Form::AddRelease::Tracks;

use strict;
use warnings;

use base 'MusicBrainz::Server::Form::EditForm';

use Rose::Object::MakeMethods::Generic(
    scalar => [ 'track_count' ]
);

sub profile
{
    return {
        required => {
            title   => 'Text',
            event_1 => '+MusicBrainz::Server::Form::Field::ReleaseEvent',
        },
        optional => {
            edit_note => 'TextArea',
        }
    };
}

sub add_tracks
{
    my ($self, $count) = @_;
    $self->track_count($count);

    for my $i (1..$count)
    {
        my $track_field = $self->make_field("track_$i", '+MusicBrainz::Server::Form::Field::Track');
        $track_field->sub_form->field('number')->value($i);
        $track_field->required(1);

        my $artist_field = $self->make_field("artist_$i", 'Text');
        $artist_field->required(1);

        $self->add_field($track_field);
        $self->add_field($artist_field);
    }
}

sub mod_type { ModDefs::MOD_ADD_RELEASE }

sub build_options
{
    my ($self, $artists_id_map) = @_;

    my $opts = {
        AlbumName => $self->value('title'),
        artist    => $self->item->id,
    };

    for my $i (1 .. $self->track_count)
    {
        $opts->{"Track$i"}    = $self->value("track_$i")->{name};
        $opts->{"ArtistID$i"} = $artists_id_map->{"artist_$i"}->{id};
        $opts->{"TrackDur$i"} = $self->value("track_$i")->{duration};
    }

    return $opts;
}

1;