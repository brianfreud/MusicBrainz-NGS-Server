#!/bin/bash

set -o errexit
cd `dirname $0`/..

echo 'DROP SCHEMA musicbrainz_test CASCADE;' | ./admin/psql --profile=test READWRITE
echo 'DROP SCHEMA musicbrainz_test CASCADE;' | ./admin/psql --profile=test RAWDATA
echo 'CREATE SCHEMA musicbrainz_test;' | ./admin/psql --profile=test READWRITE
echo 'CREATE SCHEMA musicbrainz_test;' | ./admin/psql --profile=test RAWDATA

./admin/psql --profile=test READWRITE <./admin/sql/CreateTables.sql
./admin/psql --profile=test READWRITE <./admin/sql/CreateFunctions.sql
./admin/psql --profile=test --system READWRITE <./admin/sql/CreateSearchConfiguration.sql

./admin/psql --profile=test READWRITE <./admin/sql/CreatePrimaryKeys.sql
./admin/psql --profile=test READWRITE <./admin/sql/CreateFKConstraints.sql
./admin/psql --profile=test READWRITE <./admin/sql/CreateTriggers.sql

./admin/psql --profile=test READWRITE <./admin/sql/CreateIndexes.sql
./admin/psql --profile=test READWRITE <./admin/sql/CreateSearchIndexes.sql

./admin/psql --profile=test RAWDATA <./admin/sql/vertical/rawdata/CreateTables.sql
./admin/psql --profile=test RAWDATA <./admin/sql/vertical/rawdata/CreatePrimaryKeys.sql
./admin/psql --profile=test RAWDATA <./admin/sql/vertical/rawdata/CreateFKConstraints.sql
./admin/psql --profile=test RAWDATA <./admin/sql/vertical/rawdata/CreateIndexes.sql

# eof
