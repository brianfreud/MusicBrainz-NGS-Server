\set ON_ERROR_STOP 1
begin;

create table Artist (
   Id serial primary key,
   Name varchar(255) not null,
   GID char(36) not null,
   ModPending int default 0,
   SortName varchar(255) not null,
   Page int not null);

create table ArtistAlias (
   Id serial primary key,
   Ref int not null, -- references Artist
   Name varchar(255) not null, 
   TimesUsed int default 0,
   ModPending int default 0,
   lastused timestamp with time zone
   );

create table Album (
   Id serial primary key,
   Artist int not null, -- references Artist
   Name varchar(255) not null,
   GID char(36) not null, 
   ModPending int default 0,
   Attributes int[] default '{0}',
   Page int not null);

create table AlbumMeta (
   Id int primary key,
   tracks int default 0,
   discids int default 0,
   trmids int default 0,
   firstreleasedate char(10));

create table Track (
   Id serial primary key,
   Artist int not null, -- references Artist
   Name varchar(255) not null,
   GID char(36) not null, 
   Length int default 0,
   Year int default 0,
   ModPending int default 0);

create table AlbumJoin (
   Id serial primary key,
   Album int not null, -- references Album
   Track int not null, -- references Track
   Sequence int not null,
   ModPending int default 0);

create table ClientVersion (
   Id serial primary key,
   Version varchar(64) not null);

create table TRM (
   Id serial primary key,
   TRM char(36) not null,
   LookupCount int default 0,
   Version int not null); -- references ClientVersion

create table TRMJoin (
   Id serial primary key,
   TRM int not null, -- references TRM
   Track int not null); -- references Track

create table Discid (
   Id serial primary key,
   Album int not null, -- references Album
   Disc char(28) not null unique,
   Toc text not null, 
   ModPending int default 0);

create table TOC (
   Id serial primary key,
   Album int not null, -- references Album
   Discid char(28), -- references Discid (Disc)
   Tracks int,
   Leadout int, Track1 int, Track2 int, Track3 int, Track4 int, Track5 int, Track6 int, Track7 int, 
   Track8 int, Track9 int, Track10 int, Track11 int, Track12 int, Track13 int, Track14 int, 
   Track15 int, Track16 int, Track17 int, Track18 int, Track19 int, Track20 int, Track21 int, 
   Track22 int, Track23 int, Track24 int, Track25 int, Track26 int, Track27 int, Track28 int, 
   Track29 int, Track30 int, Track31 int, Track32 int, Track33 int, Track34 int, Track35 int, 
   Track36 int, Track37 int, Track38 int, Track39 int, Track40 int, Track41 int, Track42 int, 
   Track43 int, Track44 int, Track45 int, Track46 int, Track47 int, Track48 int, Track49 int, 
   Track50 int, Track51 int, Track52 int, Track53 int, Track54 int, Track55 int, Track56 int, 
   Track57 int, Track58 int, Track59 int, Track60 int, Track61 int, Track62 int, Track63 int, 
   Track64 int, Track65 int, Track66 int, Track67 int, Track68 int, Track69 int, Track70 int, 
   Track71 int, Track72 int, Track73 int, Track74 int, Track75 int, Track76 int, Track77 int, 
   Track78 int, Track79 int, Track80 int, Track81 int, Track82 int, Track83 int, Track84 int, 
   Track85 int, Track86 int, Track87 int, Track88 int, Track89 int, Track90 int, Track91 int, 
   Track92 int, Track93 int, Track94 int, Track95 int, Track96 int, Track97 int, Track98 int, 
   Track99 int);

CREATE TABLE moderator (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(64) NOT NULL,
    password            VARCHAR(64) NOT NULL, 
    privs               INTEGER DEFAULT 0, 
    modsaccepted        INTEGER DEFAULT 0,
    modsrejected        INTEGER DEFAULT 0, 
    email               VARCHAR(64) DEFAULT NULL, 
    weburl              VARCHAR(255) DEFAULT NULL, 
    bio                 TEXT DEFAULT NULL,
    membersince         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    emailconfirmdate    TIMESTAMP WITH TIME ZONE,
    lastlogindate       TIMESTAMP WITH TIME ZONE,
    automodsaccepted    INTEGER DEFAULT 0,
    modsfailed          INTEGER DEFAULT 0
);

create table moderation_open (
   id serial primary key,
   artist int not null, -- references Artist
   moderator int not null, -- references Moderator
   tab varchar(32) not null,
   col varchar(64) not null, 
   type smallint not null, 
   status smallint not null, 
   rowid int not null, 
   prevvalue varchar(255) not null, 
   newvalue text not null, 
   yesvotes int default 0, 
   novotes int default 0,
   depmod int default 0,
   automod smallint default 0,
   opentime timestamp with time zone default now(),
   closetime timestamp with time zone,
   expiretime timestamp with time zone not null
   );

create table moderation_note_open (
   id serial primary key,
   moderation int not null, 
   moderator int not null, 
   text TEXT not null);

create table vote_open (
   id serial primary key,
   moderator int not null, -- references Moderator
   moderation int not null, -- references Moderation
   vote smallint not null,
   votetime timestamp with time zone default now(),
   superseded BOOLEAN NOT NULL DEFAULT FALSE
   );

create table moderation_closed (
   id int primary key,
   artist int not null, -- references Artist
   moderator int not null, -- references Moderator
   tab varchar(32) not null,
   col varchar(64) not null, 
   type smallint not null, 
   status smallint not null, 
   rowid int not null, 
   prevvalue varchar(255) not null, 
   newvalue text not null, 
   yesvotes int default 0, 
   novotes int default 0,
   depmod int default 0,
   automod smallint default 0,
   opentime timestamp with time zone default now(),
   closetime timestamp with time zone,
   expiretime timestamp with time zone not null
   );

create table moderation_note_closed (
   id int primary key,
   moderation int not null, 
   moderator int not null, 
   text TEXT not null);

create table vote_closed (
   id int primary key,
   moderator int not null, -- references Moderator
   moderation int not null, -- references Moderation
   vote smallint not null,
   votetime timestamp with time zone default now(),
   superseded BOOLEAN NOT NULL DEFAULT FALSE
   );

create table WordList(
   Id serial primary key,
   Word varchar(255) not null,
   artistusecount SMALLINT NOT NULL DEFAULT 0,
   albumusecount SMALLINT NOT NULL DEFAULT 0,
   trackusecount SMALLINT NOT NULL DEFAULT 0
);

create table ArtistWords(
   Wordid int not null,
   Artistid int not null);

create table AlbumWords(
   Wordid int not null,
   Albumid int not null);

create table TrackWords (
   Wordid int not null,
   Trackid int not null);

create table Stats (
   Id serial primary key,
   artists int not null, 
   albums int not null, 
   tracks int not null, 
   discids int not null, 
   trmids int not null, 
   moderations int not null, 
   votes int not null, 
   moderators int not null, 
   timestamp date not null);

create table artist_relation (
   Id serial primary key,
   artist int not null, -- references Artist
   ref int not null, -- references Artist
   weight integer not null);

CREATE TABLE currentstat
(
        name            VARCHAR(100) PRIMARY KEY,
        value           INTEGER NOT NULL,
        lastupdated     TIMESTAMP WITH TIME ZONE
);

CREATE TABLE historicalstat
(
        name            VARCHAR(100) NOT NULL,
        value           INTEGER NOT NULL,
        snapshotdate    DATE NOT NULL
);

CREATE TABLE moderator_preference
(
        id              SERIAL PRIMARY KEY,
        moderator       INTEGER NOT NULL, -- references moderator
        name            VARCHAR(50) NOT NULL,
        value           VARCHAR(100) NOT NULL,
        UNIQUE (moderator, name)
);

CREATE TABLE moderator_subscribe_artist
(
        id              SERIAL PRIMARY KEY,
        moderator       INTEGER NOT NULL, -- references moderator
        artist          INTEGER NOT NULL, -- weakly references artist
        lastmodsent     INTEGER NOT NULL, -- weakly references moderation
        deletedbymod    INTEGER NOT NULL DEFAULT 0, -- weakly references moderation
        mergedbymod     INTEGER NOT NULL DEFAULT 0, -- weakly references moderation
        UNIQUE (moderator, artist)
);

CREATE TABLE country
(
        id              SERIAL PRIMARY KEY,
        isocode         VARCHAR(2) NOT NULL,
        name            VARCHAR(100) NOT NULL
);

CREATE TABLE release
(
        id              SERIAL PRIMARY KEY,
        album           INTEGER NOT NULL, -- references album
        country         INTEGER NOT NULL, -- references country
        releasedate     CHAR(10) NOT NULL,
        modpending      INTEGER DEFAULT 0
);

commit;

-- vi: set ts=4 sw=4 et :
