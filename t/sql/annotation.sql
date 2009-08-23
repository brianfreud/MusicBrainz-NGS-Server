BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE artist_name CASCADE;
TRUNCATE artist CASCADE;
TRUNCATE artist_credit CASCADE;
TRUNCATE artist_credit_name CASCADE;
TRUNCATE label_name CASCADE;
TRUNCATE label CASCADE;
TRUNCATE recording CASCADE;
TRUNCATE track_name CASCADE;
TRUNCATE editor CASCADE;

INSERT INTO artist_name (id, name) VALUES (1, 'Artist Name');
INSERT INTO artist (id, gid, name, sortname)
    VALUES (1, '745c079d-374e-4436-9448-da92dedef3ce', 1, 1);

INSERT INTO artist_credit (id, artistcount) VALUES (1, 1);
INSERT INTO artist_credit_name (artist_credit, name, position, artist, joinphrase)
    VALUES (1, 1, 1, 1, NULL);

INSERT INTO label_name (id, name) VALUES (1, 'Label Name');
INSERT INTO label (id, gid, name, sortname)
    VALUES (1, '56a40160-8ff2-11de-8a39-0800200c9a66', 1, 1);

INSERT INTO track_name (id, name) VALUES (1, 'Recording Name');
INSERT INTO recording (id, gid, name, artist_credit)
    VALUES (1, 'e4919fa0-8ff2-11de-8a39-0800200c9a66', 1, 1);

INSERT INTO editor (id, name, password) VALUES (1, 'editor', 'pass');

COMMIT;
