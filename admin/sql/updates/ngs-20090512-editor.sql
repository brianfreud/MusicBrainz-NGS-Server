BEGIN;

CREATE TABLE editor
(
    id                  SERIAL,
    name                VARCHAR(64) NOT NULL,
    password            VARCHAR(64) NOT NULL, 
    privs               INTEGER DEFAULT 0, 
    email               VARCHAR(64) DEFAULT NULL, 
    website             VARCHAR(255) DEFAULT NULL, 
    bio                 TEXT DEFAULT NULL,
    membersince         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    emailconfirmdate    TIMESTAMP WITH TIME ZONE,
    lastlogindate       TIMESTAMP WITH TIME ZONE,
    editsaccepted       INTEGER DEFAULT 0,
    editsrejected       INTEGER DEFAULT 0,
    autoeditsaccepted   INTEGER DEFAULT 0,
    editsfailed         INTEGER DEFAULT 0
);

COMMIT;
