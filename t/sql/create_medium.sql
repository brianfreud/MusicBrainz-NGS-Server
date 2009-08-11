BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE artist CASCADE;
TRUNCATE artist_credit CASCADE;
TRUNCATE artist_credit_name CASCADE;
TRUNCATE artist_name CASCADE;
TRUNCATE medium CASCADE;
TRUNCATE release CASCADE;
TRUNCATE release_name CASCADE;
TRUNCATE tracklist CASCADE;

INSERT INTO artist_name (id, name) VALUES (1, 'Tosca');
INSERT INTO artist (id, gid, name, sortname)
    VALUES (1, '82a72730-792f-11de-8a39-0800200c9a66', 1, 1);

INSERT INTO artist_credit (id, artistcount) VALUES (1, 1);
INSERT INTO artist_credit_name (artist_credit, position, name, artist) VALUES (1, 1, 1, 1);

INSERT INTO release_name (id, name) VALUES (1, 'No Hassle');
INSERT INTO release_name (id, name) VALUES (2, 'RG');

INSERT INTO release_group (id, gid, name, artist_credit)
    VALUES (1, 'a037f860-792f-11de-8a39-0800200c9a66', 2, 1);

INSERT INTO release (id, gid, name, artist_credit, release_group)
    VALUES (1, '6a7d1660-792f-11de-8a39-0800200c9a66', 1, 1, 1);

INSERT INTO tracklist (id, trackcount) VALUES (1, 1);

COMMIT;
