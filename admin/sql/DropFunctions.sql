-- Automatically generated, do not edit.
\unset ON_ERROR_STOP

DROP FUNCTION a_del_artist();
DROP FUNCTION a_del_artist_alias();
DROP FUNCTION a_del_artist_credit_name();
DROP FUNCTION a_del_label();
DROP FUNCTION a_del_label_alias();
DROP FUNCTION a_del_recording();
DROP FUNCTION a_del_release();
DROP FUNCTION a_del_release_group();
DROP FUNCTION a_del_track();
DROP FUNCTION a_del_work();
DROP FUNCTION a_ins_artist();
DROP FUNCTION a_ins_artist_alias();
DROP FUNCTION a_ins_artist_credit_name();
DROP FUNCTION a_ins_label();
DROP FUNCTION a_ins_label_alias();
DROP FUNCTION a_ins_recording();
DROP FUNCTION a_ins_release();
DROP FUNCTION a_ins_release_group();
DROP FUNCTION a_ins_track();
DROP FUNCTION a_ins_work();
DROP FUNCTION a_upd_artist();
DROP FUNCTION a_upd_artist_alias();
DROP FUNCTION a_upd_artist_credit_name();
DROP FUNCTION a_upd_label();
DROP FUNCTION a_upd_label_alias();
DROP FUNCTION a_upd_recording();
DROP FUNCTION a_upd_release();
DROP FUNCTION a_upd_release_group();
DROP FUNCTION a_upd_track();
DROP FUNCTION a_upd_work();
DROP FUNCTION dec_name_refcount(tbl varchar, row_id integer, val integer);
DROP FUNCTION from_hex(t text);
DROP FUNCTION generate_uuid_v3(namespace varchar, name varchar);
DROP FUNCTION generate_uuid_v4();
DROP FUNCTION inc_name_refcount(tbl varchar, row_id integer, val integer);
DROP FUNCTION page_index(txt varchar);
