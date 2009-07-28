package MusicBrainz::Server::Form::Field::ArtistCredit;
use HTML::FormHandler::Moose;
extends 'HTML::FormHandler::Field::Compound';

use MusicBrainz::Server::Entity::ArtistCredit;
use MusicBrainz::Server::Entity::ArtistCreditName;

has_field 'names'=> ( type => 'Repeatable' );

has_field 'names.name' => (
    type => 'Text',
    required => 1,
);

has_field 'names.artist_id' => (
    type => 'Integer',
);

has_field 'names.join_phrase' => (
    type => 'Text',
    trim => { transform => sub { shift } }
);

sub validate
{
    my $self = shift;

    my @credits;
    for my $field ($self->field('names')->fields)
    {
        my $name = $field->field('name')->value;
        my $id = $field->field('artist_id')->value;
        my $join = $field->field('join_phrase')->value;

        push @credits, { artist => $id, name => $name };
        push @credits, $join if defined $join;
    }

    $self->value(\@credits);
}

sub _build_fif
{
    my $self = shift;

    my $artist_data = $self->form->ctx->model('Artist');
    my $preview = MusicBrainz::Server::Entity::ArtistCredit->new(
        names => [
            map {
                my $acn = MusicBrainz::Server::Entity::ArtistCreditName->new(
                    name => $_->field('name')->value,
                );
                $acn->artist_id($_->field('artist_id')->value) if $_->field('artist_id')->value;
                $acn->join_phrase($_->field('join_phrase')->value) if $_->field('join_phrase')->value;

                $acn;
            } $self->field('names')->fields
        ]
    );
    $artist_data->load(@{ $preview->names });
    return $preview;
}

1;
