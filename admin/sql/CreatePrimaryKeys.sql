ALTER TABLE album ADD CONSTRAINT album_pkey PRIMARY KEY (id);
ALTER TABLE albumjoin ADD CONSTRAINT albumjoin_pkey PRIMARY KEY (id);
ALTER TABLE albummeta ADD CONSTRAINT albummeta_pkey PRIMARY KEY (id);
ALTER TABLE album_amazon_asin ADD CONSTRAINT album_amazon_asin_pkey PRIMARY KEY (album);
ALTER TABLE albumwords ADD CONSTRAINT albumwords_pkey PRIMARY KEY (wordid, albumid);
ALTER TABLE artist ADD CONSTRAINT artist_pkey PRIMARY KEY (id);
ALTER TABLE artistalias ADD CONSTRAINT artistalias_pkey PRIMARY KEY (id);
ALTER TABLE artist_relation ADD CONSTRAINT artist_relation_pkey PRIMARY KEY (id);
ALTER TABLE artistwords ADD CONSTRAINT artistwords_pkey PRIMARY KEY (wordid, artistid);
ALTER TABLE clientversion ADD CONSTRAINT clientversion_pkey PRIMARY KEY (id);
ALTER TABLE country ADD CONSTRAINT country_pkey PRIMARY KEY (id);
ALTER TABLE currentstat ADD CONSTRAINT currentstat_pkey PRIMARY KEY (id);
ALTER TABLE discid ADD CONSTRAINT discid_pkey PRIMARY KEY (id);
ALTER TABLE historicalstat ADD CONSTRAINT historicalstat_pkey PRIMARY KEY (id);
ALTER TABLE moderation_closed ADD CONSTRAINT moderation_closed_pkey PRIMARY KEY (id);
ALTER TABLE moderation_note_closed ADD CONSTRAINT moderation_note_closed_pkey PRIMARY KEY (id);
ALTER TABLE moderation_note_open ADD CONSTRAINT moderation_note_open_pkey PRIMARY KEY (id);
ALTER TABLE moderation_open ADD CONSTRAINT moderation_open_pkey PRIMARY KEY (id);
ALTER TABLE moderator ADD CONSTRAINT moderator_pkey PRIMARY KEY (id);
ALTER TABLE moderator_preference ADD CONSTRAINT moderator_preference_pkey PRIMARY KEY (id);
ALTER TABLE moderator_subscribe_artist ADD CONSTRAINT moderator_subscribe_artist_pkey PRIMARY KEY (id);
ALTER TABLE release ADD CONSTRAINT release_pkey PRIMARY KEY (id);
ALTER TABLE replication_control ADD CONSTRAINT replication_control_pkey PRIMARY KEY (id);
ALTER TABLE stats ADD CONSTRAINT stats_pkey PRIMARY KEY (id);
ALTER TABLE toc ADD CONSTRAINT toc_pkey PRIMARY KEY (id);
ALTER TABLE track ADD CONSTRAINT track_pkey PRIMARY KEY (id);
ALTER TABLE trackwords ADD CONSTRAINT trackwords_pkey PRIMARY KEY (wordid, trackid);
ALTER TABLE trm ADD CONSTRAINT trm_pkey PRIMARY KEY (id);
ALTER TABLE trmjoin ADD CONSTRAINT trmjoin_pkey PRIMARY KEY (id);
ALTER TABLE vote_closed ADD CONSTRAINT vote_closed_pkey PRIMARY KEY (id);
ALTER TABLE vote_open ADD CONSTRAINT vote_open_pkey PRIMARY KEY (id);
ALTER TABLE wordlist ADD CONSTRAINT wordlist_pkey PRIMARY KEY (id);

-- vi: set ts=4 sw=4 et :
