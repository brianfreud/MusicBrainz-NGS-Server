BEGIN;
SET client_min_messages TO 'WARNING';

TRUNCATE work_type CASCADE;

INSERT INTO work_type (id, name) VALUES (1, 'Composition');
INSERT INTO work_type (id, name) VALUES (2, 'Symphony');

COMMIT;
