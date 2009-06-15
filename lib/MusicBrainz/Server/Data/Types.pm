package MusicBrainz::Server::Data::Types;

use Moose::Util::TypeConstraints;
use MooseX::Types::Moose qw( Str Int );
use MooseX::Types::Structured qw( Dict Optional );

subtype 'DateHash'
    => as Dict[
            year => Int,
            month => Optional[Int],
            day => Optional[Int],
        ]];

subtype 'ArtistHash'
    => as Dict[
        name => Str,
        sort_name => Optional[Str],
        type => Optional[Int],
        gender => Optional[Int],
        country => Optional[Int],
        comment => Optional[Str],
        begin_date => Optional[DateHash],
        end_date => Optional[DateHash],
    ];

1;
