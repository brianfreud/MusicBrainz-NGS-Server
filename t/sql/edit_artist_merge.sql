BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE artist_name CASCADE;
TRUNCATE artist CASCADE;

INSERT INTO artist_name (id, name) VALUES (1, 'Artist');

INSERT INTO artist (id, gid, name, sortname)
    VALUES (1, 'da34a170-7f7f-11de-8a39-0800200c9a66', 1, 1),
           (2, 'e9f5fc80-7f7f-11de-8a39-0800200c9a66', 1, 1);

COMMIT;
