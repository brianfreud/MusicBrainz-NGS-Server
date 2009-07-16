BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE artist_credit CASCADE;
TRUNCATE artist_credit_name CASCADE;
TRUNCATE artist_name CASCADE;
TRUNCATE artist CASCADE;
TRUNCATE recording CASCADE;
TRUNCATE tracklist CASCADE;
TRUNCATE track CASCADE;
TRUNCATE track_name CASCADE;

INSERT INTO artist_name (id, name) VALUES (1, 'Artist');

INSERT INTO artist (id, gid, name, sortname)
    VALUES (1, '945c079d-374e-4436-9448-da92dedef3cf', 1, 1);

INSERT INTO artist_credit (id, artistcount) VALUES (1, 1);
INSERT INTO artist_credit_name (artist_credit, position, artist, name, joinphrase)
    VALUES (1, 0, 1, 1, NULL);

INSERT INTO track_name (id, name)
    VALUES (1, 'Dancing Queen'), (2, 'Track 2'), (3, 'Track 3');

INSERT INTO recording (id, gid, name) VALUES (1, '48fca390-7220-11de-8a39-0800200c9a66', 1);

INSERT INTO tracklist (id) VALUES (1), (2);
INSERT INTO track (id, recording, tracklist, position, name, artist_credit,
        length, editpending)
    VALUES (1, 1, 1, 0, 1, 1, 9000, 1);

INSERT INTO track (id, recording, tracklist, position, name, artist_credit,
        length, editpending)
    VALUES (2, 1, 1, 1, 2, 1, 9000, 1);

INSERT INTO track (id, recording, tracklist, position, name, artist_credit,
        length, editpending)
    VALUES (3, 1, 2, 0, 3, 1, 9000, 1);

COMMIT;
