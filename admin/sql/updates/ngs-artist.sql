BEGIN;

------------------------
-- Artists
------------------------

INSERT INTO artist_name (name)
    (SELECT DISTINCT name FROM public.artist) UNION
    (SELECT DISTINCT sortname FROM public.artist) UNION
    (SELECT DISTINCT name FROM public.artistalias);

CREATE UNIQUE INDEX tmp_artist_name_name ON artist_name (name);

INSERT INTO artist (id, gid, name, sortname, type,
                    begindate_year, begindate_month, begindate_day,
                    enddate_year, enddate_month, enddate_day,
                    comment)
    SELECT
        a.id, gid::uuid, n1.id, n2.id,
        NULLIF(NULLIF(type, 0), 3),
        NULLIF(substr(begindate, 1, 4)::int, 0),
        NULLIF(substr(begindate, 6, 2)::int, 0),
        NULLIF(substr(begindate, 9, 2)::int, 0),
        NULLIF(substr(enddate, 1, 4)::int, 0),
        NULLIF(substr(enddate, 6, 2)::int, 0),
        NULLIF(substr(enddate, 9, 2)::int, 0),
        resolution
    FROM public.artist a JOIN artist_name n1 ON a.name = n1.name JOIN artist_name n2 ON a.sortname = n2.name;

INSERT INTO artist_credit (id, artistcount) SELECT id, 1 FROM artist;
SELECT setval('artist_credit_id_seq', (SELECT MAX(id) FROM artist_credit));

INSERT INTO artist_credit_name (artist_credit, artist, name, position) SELECT id, id, name, 0 FROM artist;

INSERT INTO artist_alias (artist, name)
    SELECT DISTINCT a.ref, n.id
    FROM public.artistalias a JOIN artist_name n ON a.name = n.name;

INSERT INTO artist_meta (id, lastupdate, rating, ratingcount)
    SELECT id, lastupdate, round(rating * 20), rating_count
    FROM public.artist_meta;

DROP INDEX tmp_artist_name_name;

COMMIT;
