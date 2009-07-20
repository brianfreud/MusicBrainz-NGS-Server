BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE artist CASCADE;
TRUNCATE artist_credit CASCADE;
TRUNCATE artist_credit_name CASCADE;
TRUNCATE artist_name CASCADE;
TRUNCATE country CASCADE;
TRUNCATE language CASCADE;
TRUNCATE release CASCADE;
TRUNCATE release_group CASCADE;
TRUNCATE release_name CASCADE;
TRUNCATE release_packaging CASCADE;
TRUNCATE release_status CASCADE;
TRUNCATE script CASCADE;

INSERT INTO artist_name (id, name) VALUES (1, 'Artist');
INSERT INTO artist (id, gid, name, sortname) VALUES
    (1, 'a28505a0-739d-11de-8a39-0800200c9a66', 1, 1),
    (2, '1c034cf0-73a5-11de-8a39-0800200c9a66', 1, 1);

INSERT INTO artist_credit (id, artistcount) VALUES (1, 1);
INSERT INTO artist_credit_name (artist_credit, name, artist, position, joinphrase)
    VALUES (1, 1, 1, 0, NULL);

INSERT INTO release_name (id, name) VALUES (1, 'Release');
INSERT INTO release_name (id, name) VALUES (2, 'Release Group');

INSERT INTO release_group (id, gid, name)
    VALUES (1, 'f83360f0-739d-11de-8a39-0800200c9a66', 2);

INSERT INTO release_group (id, gid, name)
    VALUES (2, '9524c7e0-73a4-11de-8a39-0800200c9a66', 2);

INSERT INTO release (id, gid, name, release_group, artist_credit)
    VALUES (1, 'ec8c4910-739d-11de-8a39-0800200c9a66', 1, 1, 1);

INSERT INTO release_status (id, name) VALUES (1, 'Official');
INSERT INTO release_packaging (id, name) VALUES (1, 'Jewel Case');
INSERT INTO country (id, isocode, name) VALUES (1, 'GB', 'United Kingdom');
INSERT INTO script (id, isocode, isonumber, name) VALUES (1, 'Ugar', '040', 'Ugaritic');
INSERT INTO language (id, isocode_3t, isocode_3b, isocode_2, name)
    VALUES (1, 'deu', 'ger', 'de', 'German');

ALTER SEQUENCE artist_credit_id_seq RESTART 2;
ALTER SEQUENCE artist_name_id_seq RESTART 2;
ALTER SEQUENCE release_name_id_seq RESTART 3;

COMMIT;
