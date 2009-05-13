BEGIN;

CREATE TABLE artist_alias
(
    id                 SERIAL,
    artist             INTEGER NOT NULL, -- references artist.id
    name               VARCHAR(255) NOT NULL,
    editspending       INTEGER,
    timesused          INTEGER DEFAULT 0,
    lastused           TIMESTAMP WITH TIME ZONE
);

ALTER TABLE artist_alias ADD CONSTRAINT artist_alias_pk PRIMARY KEY (id);

ALTER TABLE artist_alias ADD CONSTRAINT artist_alias_fk_artist
    FOREIGN KEY (artist) REFERENCES artist(id);

CREATE TABLE label_alias
(
    id                 SERIAL,
    label              INTEGER NOT NULL, -- references label.id
    name               VARCHAR(255) NOT NULL,
    editspending       INTEGER,
    timesused          INTEGER DEFAULT 0,
    lastused           TIMESTAMP WITH TIME ZONE
);

ALTER TABLE label_alias ADD CONSTRAINT label_alias_pk PRIMARY KEY (id);

ALTER TABLE label_alias ADD CONSTRAINT label_alias_fk_label
    FOREIGN KEY (label) REFERENCES label(id);

COMMIT;
