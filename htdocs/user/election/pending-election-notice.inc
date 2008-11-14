<%perl>
	# -----------------------------------------------------------------------------
	#                               Musicbrainz.org
	#                        Copyright (c) 2001 Robert Kaye
	# -----------------------------------------------------------------------------
	#  This software is provided "as is", without warranty of any kind, express or
	#  implied, including  but not limited  to the warranties of  merchantability,
	#  fitness for a particular purpose and noninfringement. In no event shall the
	#  authors or  copyright  holders be  liable for any claim,  damages or  other
	#  liability, whether  in an  action of  contract, tort  or otherwise, arising
	#  from,  out of  or in  connection with  the software or  the  use  or  other
	#  dealings in the software.
	#
	#  GPL - The GNU General Public License    http://www.gnu.org/licenses/gpl.txt
	#  Permits anyone the right to use and modify the software without limitations
	#  as long as proper  credits are given  and the original  and modified source
	#  code are included. Requires  that the final product, software derivate from
	#  the original  source or any  software  utilizing a GPL  component, such  as
	#  this, is also licensed under the GPL license.
	# -----------------------------------------------------------------------------
	#
	# Summary:
	# -----------------------------------------------------------------------------
	# This page shows a notice if there are pending autoeditor elections
	#
	# $Id$
	#
</%perl>
<%perl>

	return unless $session{uid};
	return unless UserStuff->IsAutoEditor($session{privs});
	my $mb = $m->comp("/comp/dblogin");
	my $e = MusicBrainz::Server::AutomodElection->new($mb->{DBH});
	my $pending = $e->GetPendingElections($session{uid});
	@$pending or return;

	my $url = (
		(@$pending == 1)
		? "/user/election/show.html?id=" . $pending->[0]->GetId
		: "/user/election/"
	);

</%perl>

	<p class="notice">
		Please participate in the <a href="<% $url %>">autoeditor elections</a>. Thank you!
	</p>

%# vi: set ts=4 sw=4 ft=mason :