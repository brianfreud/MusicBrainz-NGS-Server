#!/bin/sh

# TODO: If you are installing a main server, you need to update the paths below
ftpdir=/var/ftp/pub/musicbrainz/data
reportdir=/var/website/musicbrainz/prod/htdocs/reports
imagedir=/var/website/musicbrainz/prod/htdocs/images

export PATH=/bin:/usr/bin:/usr/local/pgsql/bin

# Go to the admin dir
cd ..

# Collect stats
./CollectStats.pl
cd statistics
./GeneratePlot.pl $imagedir/stats_30_days.gif
chmod a+r $imagedir/stats_30_days.gif
cd ..

# Vacuum and analyze the database for peak performance
echo "VACUUM ANALYZE;" | psql musicbrainz

# Dump the data
nice ./MBDump.pl /tmp/mbdump.tar.bz2
mv /tmp/mbdump.tar.bz2 $ftpdir

# Dump the RDF data
nice ./RDFDump.pl /tmp/mbdump.rdf.bz2
mv /tmp/mbdump.rdf.bz2 $ftpdir

# Create the reports
nice ./Caps.pl > $reportdir/caps.html
nice ./BadEntries.pl > $reportdir/bad_entries.html
nice ./Unknown.pl > $reportdir/unknown.html

cd -
