BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE annotation CASCADE;
TRUNCATE editor CASCADE;
TRUNCATE recording_annotation CASCADE;
TRUNCATE recording_gid_redirect CASCADE;

INSERT INTO editor (id, name, password) VALUES (1, 'editor', 'password');
INSERT INTO annotation (id, editor, text, changelog) VALUES (1, 1, 'Annotation', 'changelog');
INSERT INTO recording_annotation (recording, annotation) VALUES (1, 1);
INSERT INTO recording_gid_redirect (gid, newid) VALUES ('0986e67c-6b7a-40b7-b4ba-c9d7583d6426', 1);

COMMIT;
