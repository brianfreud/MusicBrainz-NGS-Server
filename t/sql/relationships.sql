BEGIN;
SET client_min_messages TO 'warning';

TRUNCATE TABLE link_attribute_type CASCADE;
TRUNCATE TABLE link_type CASCADE;
TRUNCATE TABLE link_type_attribute_type CASCADE;
TRUNCATE TABLE link CASCADE;
TRUNCATE TABLE link_attribute CASCADE;
TRUNCATE TABLE l_artist_recording CASCADE;

INSERT INTO link_attribute_type (id, root, gid, name)
    VALUES (1, 1, '36990974-4f29-4ea1-b562-3838fa9b8832', 'Additional'),
           (2, 2, '108d76bd-95eb-4099-aed6-447e4ec78553', 'Instrument');

INSERT INTO link_attribute_type (id, parent, root, gid, name)
    VALUES (3, 2, 2, '4f7bb10f-396c-466a-8221-8e93f5e454f9', 'String Instruments'),
           (4, 3, 2, 'c3273296-91ba-453d-94e4-2fb6e958568e', 'Guitar');

INSERT INTO link_type (id, gid, entitytype0, entitytype1, name, linkphrase, rlinkphrase, shortlinkphrase)
    VALUES (1, '7610b0e9-40c1-48b3-b06c-2c1d30d9dc3e', 'artist', 'recording', 'instrument',
            'performed {additional} {instrument} on',
            'has {additional} {instrument} performed by',
            'performer');

INSERT INTO link_type_attribute_type (link_type, attribute_type, min, max)
    VALUES (1, 1, 0, 1),
           (1, 2, 1, NULL);

INSERT INTO link (id, link_type, attributecount) VALUES (1, 1, 1),
                                                        (2, 1, 2);

INSERT INTO link_attribute (link, attribute_type) VALUES (1, 4),
                                                         (2, 1),
                                                         (2, 3);

TRUNCATE artist_name CASCADE;
TRUNCATE track_name CASCADE;
TRUNCATE artist CASCADE;
TRUNCATE recording CASCADE;

INSERT INTO artist_name (id, name) VALUES (1, 'Artist 1');
INSERT INTO artist_name (id, name) VALUES (2, 'Artist 2');
INSERT INTO track_name (id, name) VALUES (1, 'Track 1');
INSERT INTO track_name (id, name) VALUES (2, 'Track 2');

INSERT INTO artist (id, gid, name, sortname)
    VALUES (1, 'e2a083a9-9942-4d6e-b4d2-8397320b95f7', 1, 1),
           (2, '2fed031c-0e89-406e-b9f0-3d192637907a', 2, 2);

INSERT INTO recording (id, gid, name)
    VALUES (1, '99caac80-72e4-11de-8a39-0800200c9a66', 1),
           (2, 'a12bb640-72e4-11de-8a39-0800200c9a66', 2);

INSERT INTO l_artist_recording (id, link, entity0, entity1) VALUES (1, 1, 1, 1);
INSERT INTO l_artist_recording (id, link, entity0, entity1, editpending) VALUES (2, 1, 2, 1, 1);
INSERT INTO l_artist_recording (id, link, entity0, entity1) VALUES (3, 2, 1, 2);

COMMIT;
