BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE artist_name CASCADE;
TRUNCATE artist CASCADE;
TRUNCATE artist_type CASCADE;
TRUNCATE gender CASCADE;

INSERT INTO artist_name (id, name) VALUES (1, 'Artist Name');
INSERT INTO artist (id, gid, name, sortname)
    VALUES (1, '745c079d-374e-4436-9448-da92dedef3ce', 1, 1);

INSERT INTO gender (id, name) VALUES (1, 'Male');
INSERT INTO artist_type (id, name) VALUES (1, 'Group');

COMMIT;
