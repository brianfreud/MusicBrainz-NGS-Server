BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE label_name CASCADE;
TRUNCATE label CASCADE;

INSERT INTO label_name (id, name) VALUES (1, 'Label');

INSERT INTO label (id, gid, name, sortname)
    VALUES (1, 'da34a170-7f7f-11de-8a39-0800200c9a66', 1, 1),
           (2, 'e9f5fc80-7f7f-11de-8a39-0800200c9a66', 1, 1);

COMMIT;
