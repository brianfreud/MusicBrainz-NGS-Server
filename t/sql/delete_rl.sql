BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE artist CASCADE;
TRUNCATE artist_name CASCADE;
TRUNCATE artist_credit CASCADE;
TRUNCATE artist_credit_name CASCADE;
TRUNCATE label CASCADE;
TRUNCATE label_name CASCADE;
TRUNCATE release CASCADE;
TRUNCATE release_name CASCADE;
TRUNCATE release_label CASCADE;

INSERT INTO artist_name (id, name) VALUES (1, 'Name');
INSERT INTO artist (id, gid, name, sortname)
    VALUES (1, 'a9d99e40-72d7-11de-8a39-0800200c9a66', 1, 1);

INSERT INTO artist_credit (id, artistcount) VALUES (1, 1);
INSERT INTO artist_credit_name (artist_credit, artist, name, position, joinphrase)
    VALUES (1, 1, 1, 0, NULL);

INSERT INTO label_name (id, name) VALUES (1, 'Label');
INSERT INTO label (id, gid, name, sortname)
    VALUES (1, 'f2a9a3c0-72e3-11de-8a39-0800200c9a66', 1, 1);

INSERT INTO release_name (id, name) VALUES (1, 'Release #1');
INSERT INTO release_group (id, gid, name, artist_credit)
    VALUES (1, '3b4faa80-72d9-11de-8a39-0800200c9a66', 1, 1);

INSERT INTO release (id, gid, name, artist_credit, release_group)
    VALUES (1, 'f34c079d-374e-4436-9448-da92dedef3ce', 1, 1, 1);

INSERT INTO release_label (id, release, label, catno)
    VALUES (1, 1, 1, 'LBL-001'), (2, 1, 1, 'LBL-002'), (3, 1, 1, 'LBL-003');

COMMIT;
