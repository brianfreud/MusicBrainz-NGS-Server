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
	# This page displays the "password sent" message
	#
	# $Id$
	#
</%perl>
% 	my $user = shift;

<& /comp/sidebar-notitle, pagetitle => "Password sent" &>

	<& /comp/tablebegin, title => "Password sent" &>
		Your password has been sent to the e-mail address 
		registered for this account.
	<& /comp/tableend &>

	<& /comp/tablebegin, title => "Login" &>
		<& /comp/loginbox &>
	<& /comp/tableend &>

<& /comp/footer &>

%# vi: set ts=4 sw=4 ft=mason :