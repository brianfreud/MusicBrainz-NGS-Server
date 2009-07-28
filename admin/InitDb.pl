#!/usr/bin/perl -w
#____________________________________________________________________________
#
#   MusicBrainz -- the open internet music database
#
#   Copyright (C) 2002 Robert Kaye
#
#   This program is free software; you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation; either version 2 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program; if not, write to the Free Software
#   Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
#
#   $Id$
#____________________________________________________________________________

use FindBin;
use lib "$FindBin::Bin/../lib";

use MusicBrainz;
use DBDefs;
use MusicBrainz::Server::Replication ':replication_type';

my $READWRITE = MusicBrainz::Server::Database->get("READWRITE");
my $READONLY = MusicBrainz::Server::Database->get("READONLY");
my $RAWDATA = MusicBrainz::Server::Database->get("RAWDATA");

# Register a new database connection as the system user, but to the MB
# database
my $SYSTEM = MusicBrainz::Server::Database->get("SYSTEM");
my $SYSMB = $SYSTEM->modify(database => $READWRITE->database);
MusicBrainz::Server::Database->register("SYSMB", $SYSMB);

# Check to make sure that the main and raw databases are not the same
die "The READWRITE database and the RAWDATA database cannot be the same. Use a different name for the RAWDATA database." 
   if ($RAWDATA->database eq $READWRITE->database);

my $REPTYPE = &DBDefs::REPLICATION_TYPE;

my $psql = "psql";
my $path_to_pending_so;
my $fFixUTF8 = 0;
my $fCreateDB;
my $fCreateRawDBOnly;

warn "Warning: this is a slave replication server, but there is no READONLY connection defined\n"
	if $REPTYPE == RT_SLAVE and not $READONLY;

use Getopt::Long;
use strict;

my $fEcho = 0;
my $fQuiet = 0;

my $sqldir = "$FindBin::Bin/sql";
-d $sqldir or die "Couldn't find SQL script directory";

sub RunSQLScript
{
	my ($db, $file, $startmessage) = @_;
	$startmessage ||= "Running sql/$file";
	print localtime() . " : $startmessage ($file)\n";

    my $opts = $db->shell_args;
	my $echo = ($fEcho ? "-e" : "");
	my $stdout = ($fQuiet ? ">/dev/null" : "");

	$ENV{"PGOPTIONS"} = "-c search_path=musicbrainz";
	print "$psql $echo -f $sqldir/$file $opts 2>&1 $stdout |\n";
	open(PIPE, "$psql $echo -f $sqldir/$file $opts 2>&1 $stdout |")
		or die "exec '$psql': $!";
	while (<PIPE>)
	{
		print localtime() . " : " . $_;
	}
	close PIPE;

	die "Error during sql/$file" if ($? >> 8);
}

sub CreateReplicationFunction
{
	# Now connect to that database
	my $mb = MusicBrainz->new;
	$mb->Login(db => "SYSMB");
	my $sql = Sql->new($mb->{dbh});

	$sql->AutoCommit;
	$sql->Do(
		"CREATE FUNCTION \"recordchange\" () RETURNS trigger
		AS ?, 'recordchange' LANGUAGE 'C'",
		$path_to_pending_so,
	);
}

{
    my $mb;
    my $sql;
    sub get_sql
    {
        my ($name) = shift;
        $mb = MusicBrainz->new;
        $mb->Login(db => $name);
        $sql = Sql->new($mb->{dbh});
    }
}

sub Create 
{
    my $createdb = $_[0];
    my $system_sql;

	# Check we can find these programs on the path
	for my $prog (qw( createuser createdb createlang ))
	{
		next if `which $prog` and $? == 0;
		die "Can't find '$prog' on your PATH\n";
	}

    # Figure out the name of the system database
    my $sysname;
    if ($createdb eq 'READWRITE' || $createdb eq 'READONLY')
    {
        $sysname = "SYSTEM";
    }
    else
    {
        $sysname = $createdb . "_SYSTEM";
	$sysname = "SYSTEM" if not defined MusicBrainz::Server::Database->get($sysname);
    }

    my $db = MusicBrainz::Server::Database->get($createdb);

    {
        # Check the cluster uses the C locale
        $system_sql = get_sql($sysname);

        my $username = $db->username;

        if (!($system_sql->SelectSingleValue(
            "SELECT 1 FROM pg_shadow WHERE usename = ?", $username)))
        {
            my $passwordclause = "";
            $passwordclause = "PASSWORD '$_'"
                if local $_ = $db->password;

            $system_sql->AutoCommit;
            $system_sql->Do(
                "CREATE USER $username $passwordclause NOCREATEDB NOCREATEUSER",
            );
        }
    }

	my $dbname = $db->database;
	print localtime() . " : Creating database '$dbname'\n";
	$system_sql->AutoCommit;
	my $dbuser = $db->username;
	$system_sql->Do("CREATE DATABASE $dbname WITH OWNER = $dbuser ENCODING = 'UNICODE'");

	# You can do this via CREATE FUNCTION, CREATE LANGUAGE; but using
	# "createlang" is simpler :-)
	my $sys_in_thisdb =  MusicBrainz::Server::Database->get($sysname)->modify(database => $dbname);
	my @opts = $sys_in_thisdb->shell_args;
	splice(@opts, -1, 0, "-d");
	push @opts, "plpgsql";
	system "createlang", @opts;
	die "\nFailed to create language\n" if ($? >> 8);
}

sub CreateRelations
{
	my $import = shift;

    my $opts = $READWRITE->shell_args;
    system("echo \"CREATE SCHEMA musicbrainz\" | $psql $opts");
    die "\nFailed to create schema\n" if ($? >> 8);

    $opts = $RAWDATA->shell_args;
    system("echo \"CREATE SCHEMA musicbrainz\" | $psql $opts");
    die "\nFailed to create schema\n" if ($? >> 8);

	RunSQLScript($READWRITE, "CreateTables.sql", "Creating tables ...");
	RunSQLScript($RAWDATA, "vertical/rawdata/CreateTables.sql", "Creating raw tables ...");

	if ($import)
    {
		local $" = " ";
        my @opts = "--ignore-errors";
        push @opts, "--fix-broken-utf8" if ($fFixUTF8);
        system($^X, "$FindBin::Bin/MBImport.pl", @opts, @$import);
        die "\nFailed to import dataset.\n" if ($? >> 8);
    } else {
		RunSQLScript($READWRITE, "InsertDefaultRows.sql", "Adding default rows ...");
	}

	RunSQLScript($READWRITE, "CreatePrimaryKeys.sql", "Creating primary keys ...");
	RunSQLScript($RAWDATA, "vertical/rawdata/CreatePrimaryKeys.sql", "Creating raw primary keys ...");

	RunSQLScript($SYSMB, "CreateSearchConfiguration.sql", "Creating search configuration ...");
	RunSQLScript($READWRITE, "CreateFunctions.sql", "Creating functions ...");

	RunSQLScript($READWRITE, "CreateIndexes.sql", "Creating indexes ...");
	RunSQLScript($RAWDATA, "vertical/rawdata/CreateIndexes.sql", "Creating raw indexes ...");
	RunSQLScript($READWRITE, "CreateFKConstraints.sql", "Adding foreign key constraints ...")
	    unless $REPTYPE == RT_SLAVE;
	RunSQLScript($RAWDATA, "vertical/rawdata/CreateFKConstraints.sql", "Adding raw foreign key constraints ...")
	    unless $REPTYPE == RT_SLAVE;

	RunSQLScript($READWRITE, "SetSequences.sql", "Setting raw initial sequence values ...");
	RunSQLScript($RAWDATA, "vertical/rawdata/SetSequences.sql", "Setting raw initial sequence values ...");

	RunSQLScript($READWRITE, "CreateViews.sql", "Creating views ...");
	RunSQLScript($READWRITE, "CreateTriggers.sql", "Creating triggers ...")
	    unless $REPTYPE == RT_SLAVE;

	RunSQLScript($READWRITE, "CreateSearchIndexes.sql", "Creating search indexes ...");

	if ($REPTYPE == RT_MASTER)
	{
		CreateReplicationFunction();
		RunSQLScript($READWRITE, "CreateReplicationTriggers.sql", "Creating replication triggers ...");
	}

    print localtime() . " : Optimizing database ...\n";
    $opts = $READWRITE->shell_args;
    system("echo \"vacuum analyze\" | $psql $opts");
    die "\nFailed to optimize database\n" if ($? >> 8);

    print localtime() . " : Optimizing rawdata database ...\n";
    $opts = $RAWDATA->shell_args;
    system("echo \"vacuum analyze\" | $psql $opts");
    die "\nFailed to optimize rawdata database\n" if ($? >> 8);

    print localtime() . " : Initialized and imported data into the database.\n";
}

sub GrantSelect
{
	return unless $READONLY;

    my $name = $_[0];

	my $mb = MusicBrainz->new;
	$mb->Login(db => $name);
	my $dbh = $mb->{dbh};
	$dbh->{AutoCommit} = 1;

	my $username = $READONLY->username;
	return if $username eq $READWRITE->username;

	my $sth = $dbh->table_info("", "public") or die;
	while (my $row = $sth->fetchrow_arrayref)
	{
		my $tablename = $row->[2];
		next if $tablename =~ /^(Pending|PendingData)$/;
		$dbh->do("GRANT SELECT ON $tablename TO $username")
			or die;
	}
	$sth->finish;
}

sub SanityCheck
{
    die "The postgres psql application must be on your path for this script to work.\n"
       if not -x $psql and (`which psql` eq '');

	if ($REPTYPE == RT_MASTER && !$fCreateRawDBOnly)
	{
		defined($path_to_pending_so) or die <<EOF;
Error: this is a master replication server, but you did not specify
the path to "pending.so" (i.e. --with-pending=PATH)
EOF
		if (not -f $path_to_pending_so)
		{
			warn <<EOF;
Warning: $path_to_pending_so not found.
This might be OK for example if you simply don't have permission to see that
file, or if the database server is on a remote host.
EOF
		}
	} else {
		defined($path_to_pending_so) and die <<EOF;
Error: this is not a master replication server, but you specified
the path to "pending.so" (--with-pending=PATH), which makes no sense.
EOF
	}
}

sub Usage
{
   die <<EOF;
Usage: InitDb.pl [options] [file] ...

Options are:
     --psql=PATH        Specify the path to the "psql" utility
     --postgres=NAME    Specify the name of the system user
     --createdb         Create the database, PL/PGSQL language and user
  -i --import           Prepare the database and then import the data from 
                        the given files
  -c --clean            Prepare a ready to use empty database
     --[no]echo         When running the various SQL scripts, echo the commands
                        as they are run
  -q, --quiet           Don't show the output of any SQL scripts
  -h --help             This help
  --with-pending=PATH   For use only if this is a master replication server
                        (DBDefs::REPLICATION_TYPE==RT_MASTER).  PATH specifies
                        the path to "pending.so" (on the database server).
	 --fix-broken-utf8  replace invalid UTF-8 byte sequences with the special
	                    Unicode "replacement character" U+FFFD.
						(Should only be used, when an import without the option
						fails with an "ERROR:  invalid UTF-8 byte sequence detected"!
						see also `MBImport.pl --help')

After the import option, you may specify one or more MusicBrainz data dump
files for importing into the database. Once this script runs to completion
without errors, the database will be ready to use. Or it *should* at least.

Since all non-option arguments are passed directly to MBImport.pl, you can
pass additional options to that script by using "--".  For example:

  InitDb.pl --createdb --echo --import -- --tmp-dir=/var/tmp *.tar.bz2

EOF
}

my $mode = "MODE_IMPORT";

GetOptions(
	"psql=s"			=> \$psql,
	"createdb"			=> \$fCreateDB,
	"createrawonly"		=> \$fCreateRawDBOnly,
	"empty-database"	=> sub { $mode = "MODE_NO_TABLES" },
	"import|i"			=> sub { $mode = "MODE_IMPORT" },
	"clean|c"			=> sub { $mode = "MODE_NO_DATA" },
	"with-pending=s"	=> \$path_to_pending_so,
	"echo!"				=> \$fEcho,
	"quiet|q"			=> \$fQuiet,
	"help|h"			=> \&Usage,
	"fix-broken-utf8"   => \$fFixUTF8
) or exit 2;

SanityCheck();

print localtime() . " : InitDb.pl starting\n";
my $started = 1;

if ($fCreateRawDBOnly)
{
    Create("RAWDATA");
    GrantSelect("RAWDATA");
}
else
{
    if ($fCreateDB)
    {
        Create("READWRITE");
        Create("RAWDATA");
    }

    if ($mode eq "MODE_NO_TABLES") { } # nothing to do
    elsif ($mode eq "MODE_NO_DATA") { CreateRelations() }
    elsif ($mode eq "MODE_IMPORT") { CreateRelations(\@ARGV) }

    GrantSelect("READWRITE");
    GrantSelect("RAWDATA");
}

END {
	print localtime() . " : InitDb.pl "
		. ($? == 0 ? "succeeded" : "failed")
		. "\n"
		if $started;
}

# vi: set ts=4 sw=4 :
