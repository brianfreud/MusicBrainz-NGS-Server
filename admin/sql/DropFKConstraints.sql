\unset ON_ERROR_STOP

-- Alphabetical order by table

ALTER TABLE album DROP CONSTRAINT album_fk_artist;
ALTER TABLE album DROP CONSTRAINT album_fk_language;
ALTER TABLE album DROP CONSTRAINT album_fk_script;
ALTER TABLE album_amazon_asin DROP CONSTRAINT album_amazon_asin_fk_album;
ALTER TABLE album_cdtoc DROP CONSTRAINT album_cdtoc_fk_album;
ALTER TABLE album_cdtoc DROP CONSTRAINT album_cdtoc_fk_cdtoc;
ALTER TABLE albumjoin DROP CONSTRAINT albumjoin_fk_album;
ALTER TABLE albumjoin DROP CONSTRAINT albumjoin_fk_track;
-- albummeta ?
ALTER TABLE albumwords DROP CONSTRAINT albumwords_fk_albumid;
ALTER TABLE artist_relation DROP CONSTRAINT artist_relation_fk_artist1;
ALTER TABLE artist_relation DROP CONSTRAINT artist_relation_fk_artist2;
ALTER TABLE artistalias DROP CONSTRAINT artistalias_fk_ref;
ALTER TABLE artistwords DROP CONSTRAINT artistwords_fk_artistid;
ALTER TABLE automod_election DROP CONSTRAINT automod_election_fk_candidate;
ALTER TABLE automod_election DROP CONSTRAINT automod_election_fk_proposer;
ALTER TABLE automod_election DROP CONSTRAINT automod_election_fk_seconder_1;
ALTER TABLE automod_election DROP CONSTRAINT automod_election_fk_seconder_2;
ALTER TABLE automod_election_vote DROP CONSTRAINT automod_election_vote_fk_automod_election;
ALTER TABLE automod_election_vote DROP CONSTRAINT automod_election_vote_fk_voter;
ALTER TABLE labelwords DROP CONSTRAINT labelwords_fk_labelid;
ALTER TABLE labelalias DROP CONSTRAINT labelalias_fk_ref;
ALTER TABLE l_album_album DROP CONSTRAINT fk_l_album_album_link0;
ALTER TABLE l_album_album DROP CONSTRAINT fk_l_album_album_link1;
ALTER TABLE l_album_album DROP CONSTRAINT fk_l_album_album_link_type;
ALTER TABLE l_album_artist DROP CONSTRAINT fk_l_album_artist_link0;
ALTER TABLE l_album_artist DROP CONSTRAINT fk_l_album_artist_link1;
ALTER TABLE l_album_artist DROP CONSTRAINT fk_l_album_artist_link_type;
ALTER TABLE l_label_label DROP CONSTRAINT fk_l_label_label_link0;
ALTER TABLE l_label_label DROP CONSTRAINT fk_l_label_label_link1;
ALTER TABLE l_label_label DROP CONSTRAINT fk_l_label_label_link_type;
ALTER TABLE l_album_track DROP CONSTRAINT fk_l_album_track_link0;
ALTER TABLE l_album_track DROP CONSTRAINT fk_l_album_track_link1;
ALTER TABLE l_album_track DROP CONSTRAINT fk_l_album_track_link_type;
ALTER TABLE l_album_url DROP CONSTRAINT fk_l_album_url_link0;
ALTER TABLE l_album_url DROP CONSTRAINT fk_l_album_url_link1;
ALTER TABLE l_album_url DROP CONSTRAINT fk_l_album_url_link_type;
ALTER TABLE l_artist_artist DROP CONSTRAINT fk_l_artist_artist_link0;
ALTER TABLE l_artist_artist DROP CONSTRAINT fk_l_artist_artist_link1;
ALTER TABLE l_artist_artist DROP CONSTRAINT fk_l_artist_artist_link_type;
ALTER TABLE l_artist_label DROP CONSTRAINT fk_l_artist_label_link0;
ALTER TABLE l_artist_label DROP CONSTRAINT fk_l_artist_label_link1;
ALTER TABLE l_artist_label DROP CONSTRAINT fk_l_artist_label_link_type;
ALTER TABLE l_artist_track DROP CONSTRAINT fk_l_artist_track_link0;
ALTER TABLE l_artist_track DROP CONSTRAINT fk_l_artist_track_link1;
ALTER TABLE l_artist_track DROP CONSTRAINT fk_l_artist_track_link_type;
ALTER TABLE l_artist_url DROP CONSTRAINT fk_l_artist_url_link0;
ALTER TABLE l_artist_url DROP CONSTRAINT fk_l_artist_url_link1;
ALTER TABLE l_artist_url DROP CONSTRAINT fk_l_artist_url_link_type;
ALTER TABLE l_label_label DROP CONSTRAINT fk_l_label_label_link0;
ALTER TABLE l_label_label DROP CONSTRAINT fk_l_label_label_link1;
ALTER TABLE l_label_label DROP CONSTRAINT fk_l_label_label_link_type;
ALTER TABLE l_label_track DROP CONSTRAINT fk_l_label_track_link0;
ALTER TABLE l_label_track DROP CONSTRAINT fk_l_label_track_link1;
ALTER TABLE l_label_track DROP CONSTRAINT fk_l_label_track_link_type;
ALTER TABLE l_label_url DROP CONSTRAINT fk_l_label_url_link0;
ALTER TABLE l_label_url DROP CONSTRAINT fk_l_label_url_link1;
ALTER TABLE l_label_url DROP CONSTRAINT fk_l_label_url_link_type;
ALTER TABLE l_track_track DROP CONSTRAINT fk_l_track_track_link0;
ALTER TABLE l_track_track DROP CONSTRAINT fk_l_track_track_link1;
ALTER TABLE l_track_track DROP CONSTRAINT fk_l_track_track_link_type;
ALTER TABLE l_track_url DROP CONSTRAINT fk_l_track_url_link0;
ALTER TABLE l_track_url DROP CONSTRAINT fk_l_track_url_link1;
ALTER TABLE l_track_url DROP CONSTRAINT fk_l_track_url_link_type;
ALTER TABLE l_url_url DROP CONSTRAINT fk_l_url_url_link0;
ALTER TABLE l_url_url DROP CONSTRAINT fk_l_url_url_link1;
ALTER TABLE l_url_url DROP CONSTRAINT fk_l_url_url_link_type;
ALTER TABLE link_attribute DROP CONSTRAINT fk_link_attribute_type;
ALTER TABLE lt_album_album DROP CONSTRAINT fk_lt_album_album_parent;
ALTER TABLE lt_album_artist DROP CONSTRAINT fk_lt_album_artist_parent;
ALTER TABLE lt_album_label DROP CONSTRAINT fk_lt_album_label_parent;
ALTER TABLE lt_album_track DROP CONSTRAINT fk_lt_album_track_parent;
ALTER TABLE lt_album_url DROP CONSTRAINT fk_lt_album_url_parent;
ALTER TABLE lt_artist_artist DROP CONSTRAINT fk_lt_artist_artist_parent;
ALTER TABLE lt_artist_label DROP CONSTRAINT fk_lt_artist_label_parent;
ALTER TABLE lt_artist_track DROP CONSTRAINT fk_lt_artist_track_parent;
ALTER TABLE lt_artist_url DROP CONSTRAINT fk_lt_artist_url_parent;
ALTER TABLE lt_label_label DROP CONSTRAINT fk_lt_label_label_parent;
ALTER TABLE lt_label_track DROP CONSTRAINT fk_lt_label_track_parent;
ALTER TABLE lt_label_url DROP CONSTRAINT fk_lt_label_url_parent;
ALTER TABLE lt_track_track DROP CONSTRAINT fk_lt_track_track_parent;
ALTER TABLE lt_track_url DROP CONSTRAINT fk_lt_track_url_parent;
ALTER TABLE lt_url_url DROP CONSTRAINT fk_lt_url_url_parent;
ALTER TABLE moderation_closed DROP CONSTRAINT moderation_closed_fk_artist;
ALTER TABLE moderation_closed DROP CONSTRAINT moderation_closed_fk_moderator;
ALTER TABLE moderation_closed DROP CONSTRAINT moderation_closed_fk_language;
ALTER TABLE moderation_note_closed DROP CONSTRAINT moderation_note_closed_fk_moderation;
ALTER TABLE moderation_note_closed DROP CONSTRAINT moderation_note_closed_fk_moderator;
ALTER TABLE moderation_note_open DROP CONSTRAINT moderation_note_open_fk_moderation;
ALTER TABLE moderation_note_open DROP CONSTRAINT moderation_note_open_fk_moderator;
ALTER TABLE moderation_open DROP CONSTRAINT moderation_open_fk_artist;
ALTER TABLE moderation_open DROP CONSTRAINT moderation_open_fk_moderator;
ALTER TABLE moderation_open DROP CONSTRAINT moderation_open_fk_language;
ALTER TABLE moderator_preference DROP CONSTRAINT moderator_preference_fk_moderator;
ALTER TABLE moderator_subscribe_artist DROP CONSTRAINT modsubartist_fk_moderator;
ALTER TABLE "PendingData" DROP CONSTRAINT "PendingData_SeqId";
ALTER TABLE puid DROP CONSTRAINT puid_fk_clientversion;
ALTER TABLE puid_stat DROP CONSTRAINT puid_stat_fk_puid;
ALTER TABLE puidjoin DROP CONSTRAINT puidjoin_fk_track;
ALTER TABLE puidjoin DROP CONSTRAINT puidjoin_fk_puid;
ALTER TABLE puidjoin_stat DROP CONSTRAINT puidjoin_stat_fk_puidjoin;
ALTER TABLE release DROP CONSTRAINT release_fk_album;
ALTER TABLE release DROP CONSTRAINT release_fk_country;
ALTER TABLE label DROP CONSTRAINT label_fk_country;
ALTER TABLE script_language DROP CONSTRAINT script_language_fk_language;
ALTER TABLE script_language DROP CONSTRAINT script_language_fk_script;
ALTER TABLE track DROP CONSTRAINT track_fk_artist;
ALTER TABLE trackwords DROP CONSTRAINT trackwords_fk_trackid;
ALTER TABLE trm DROP CONSTRAINT trm_fk_clientversion;
ALTER TABLE trm_stat DROP CONSTRAINT trm_stat_fk_trm;
ALTER TABLE trmjoin DROP CONSTRAINT trmjoin_fk_track;
ALTER TABLE trmjoin DROP CONSTRAINT trmjoin_fk_trm;
ALTER TABLE trmjoin_stat DROP CONSTRAINT trmjoin_stat_fk_trmjoin;
ALTER TABLE vote_closed DROP CONSTRAINT vote_closed_fk_moderation;
ALTER TABLE vote_closed DROP CONSTRAINT vote_closed_fk_moderator;
ALTER TABLE vote_open DROP CONSTRAINT vote_open_fk_moderation;
ALTER TABLE vote_open DROP CONSTRAINT vote_open_fk_moderator;

-- vi: set ts=4 sw=4 et :
