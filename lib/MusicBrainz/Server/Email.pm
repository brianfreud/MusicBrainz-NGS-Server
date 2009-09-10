package MusicBrainz::Server::Email;

use Moose;
use Readonly;
use Email::Address;
use Email::Sender::Simple qw( sendmail );
use Email::MIME;
use Email::MIME::Creator;
use URI::Escape qw( uri_escape );
use DBDefs;

has 'c' => (
    is => 'rw',
    isa => 'Object'
);

Readonly my $NOREPLY_ADDRESS => 'MusicBrainz Server <noreply@musicbrainz.org>';
Readonly my $SUPPORT_ADDRESS => 'MusicBrainz <support@musicbrainz.org>';

our $test_transport = undef;

sub _user_address
{
    my ($user, $hidden) = @_;

    if ($hidden) {
        # Hide the deal address
        my $email = sprintf '%s@users.musicbrainz.org', $user->name;
        return Email::Address->new($user->name, $email)->format;
    }

    return Email::Address->new($user->name, $user->email)->format;
}

sub _create_email
{
    my ($self, $headers, $body) = @_;

    return Email::MIME->create(
        header => $headers,
        body => $body,
        attributes => {
            content_type => "text/plain",
            charset      => "UTF-8",
            encoding     => "quoted-printable",
        });
}

sub _create_message_to_editor_email
{
    my ($self, %opts) = @_;

    my $from = $opts{from} or die "Missing 'from' argument";
    my $to = $opts{to} or die "Missing 'to' argument";
    my $subject = $opts{subject} or die "Missing 'subject' argument";
    my $message = $opts{message} or die "Missing 'message' argument";

    my @headers = (
        'To'      => _user_address($to),
        'Sender'  => $NOREPLY_ADDRESS,
        'Subject' => $subject,
    );

    if ($opts{reveal_address}) {
        push @headers, 'From', _user_address($from);
    }
    else {
        push @headers, 'From', _user_address($from, 1);
        push @headers, 'Reply-To', $NOREPLY_ADDRESS;
    }

    if ($opts{send_to_self}) {
        push @headers, 'BCC', _user_address($from);
    }

    my $from_name = $from->name;
    my $contact_url = sprintf "http://%s/user/%s/contact",
                        &DBDefs::WEB_SERVER,
                        uri_escape($from->name);

    my $body = <<EOS;
MusicBrainz editor '$from_name' has sent you the following message:
------------------------------------------------------------------------
$message
------------------------------------------------------------------------
EOS

    if ($opts{reveal_address}) {
        $body .= <<EOS;
If you would like to respond, please reply to this message or visit
$contact_url to send editor
'$from_name' an e-mail.
EOS
    }
    else {
        $body .= <<EOS;
If you would like to respond, please visit
$contact_url to send editor
'$from_name' an e-mail.
EOS
    }

    return $self->_create_email(\@headers, $body);
}

sub _create_email_verification_email
{
    my ($self, %opts) = @_;

    my @headers = (
        'To'       => $opts{email},
        'From'     => $NOREPLY_ADDRESS,
        'Reply-To' => $SUPPORT_ADDRESS,
        'Subject'  => 'Please verify your email address',
    );

    my $verification_link = $opts{verification_link};

    my $body = <<EOS;
This is the a verification email for your MusicBrainz account. Please click
on the link below to verify your email address:

$verification_link

If clicking the link directly does not work, you may need to manually cut
and paste the link into the location bar of your preferred web browser.

Thanks for using MusicBrainz!

-- The MusicBrainz Team
EOS

    return $self->_create_email(\@headers, $body);
}

sub _create_lost_username_email
{
    my ($self, %opts) = @_;

    my @headers = (
        'To'       => _user_address($opts{user}),
        'From'     => $NOREPLY_ADDRESS,
        'Reply-To' => $SUPPORT_ADDRESS,
        'Subject'  => 'Lost username',
    );

    my $user_name = $opts{user}->name;
    my $lost_password_url = sprintf "http://%s/lost-password", &DBDefs::WEB_SERVER;

    my $body = <<EOS;
Hello. Someone asked to look up the MusicBrainz account associated with the
email address.

Your MusicBrainz username is: $user_name

If you have also forgotten your password, use the username and email address
to reset your password here - $lost_password_url

-- The MusicBrainz Team
EOS

    return $self->_create_email(\@headers, $body);
}

sub _create_no_vote_email
{
    my ($self, %opts) = @_;

    my $edit_id = $opts{edit_id} or die "Missing 'edit_id' argument";
    my $voter = $opts{voter} or die "Missing 'voter' argument";
    my $editor = $opts{editor} or die "Missing 'editor' argument";

    my @headers = (
        'To' => _user_address($opts{editor}),
        'From' => $NOREPLY_ADDRESS,
        'Reply-To' => $SUPPORT_ADDRESS,
        'References' => sprintf('<edit-%d@musicbrainz.org>', $edit_id),
        'Subject' => 'Someone has voted against your edit',
    );

    my $url = sprintf 'http://%s/edit/%d', &DBDefs::WEB_SERVER, $edit_id;
    my $prefs_url = sprintf 'http://%s/account/preferences', &DBDefs::WEB_SERVER;

    my $body = <<EOS;
MusicBrainz editor '${\ $voter->name }' has voted against your edit #$edit_id.
------------------------------------------------------------------------
If you would like to respond to this vote, please add your note at:

    $url

Please do not respond to this e-mail.

This e-mail is only sent for the first vote against your edit, not for each
one. If you would prefer not to receive these e-mails, please adjust your
preferences accordingly at $prefs_url
EOS

    return $self->_create_email(\@headers, $body);
}

sub _create_password_reset_request_email
{
    my ($self, %opts) = @_;

    my @headers = (
        'To'       => _user_address($opts{user}),
        'From'     => $NOREPLY_ADDRESS,
        'Reply-To' => $SUPPORT_ADDRESS,
        'Subject'  => 'Password reset request',
    );

    my $reset_password_link = $opts{reset_password_link};
    my $contact_url = sprintf "http://%s/doc/Contact_Us", &DBDefs::WEB_SERVER;

    my $body = <<EOS;
Hello. Someone asked that your MusicBrainz password be reset.

If you did ask to reset the password on your MusicBrainz account, please use
this link:

$reset_password_link

If you still have problems logging in, please drop us a line - see
$contact_url for details.

-- The MusicBrainz Team
EOS

    return $self->_create_email(\@headers, $body);
}

sub send_first_no_vote
{
    my $self = shift;
    my $email = $self->_create_no_vote_email(@_);
    return $self->_send_email($email);
}

sub send_message_to_editor
{
    my ($self, %opts) = @_;

    my $email = $self->_create_message_to_editor_email(%opts);
    return $self->_send_email($email);
}

sub send_email_verification
{
    my ($self, %opts) = @_;

    my $email = $self->_create_email_verification_email(%opts);
    return $self->_send_email($email);
}

sub send_lost_username
{
    my ($self, %opts) = @_;

    my $email = $self->_create_lost_username_email(%opts);
    return $self->_send_email($email);
}

sub send_password_reset_request
{
    my ($self, %opts) = @_;

    my $email = $self->_create_password_reset_request_email(%opts);
    return $self->_send_email($email);
}

has 'transport' => (
    is => 'rw',
    lazy => 1,
    builder => '_build_transport'
);

sub get_test_transport
{
    return $test_transport;
}

sub _build_transport
{
    my ($self) = @_;

    if (&DBDefs::_RUNNING_TESTS) { # XXX shouldn't be here
        if (!defined $test_transport) {
            use Email::Sender::Transport::Test;
            $test_transport = Email::Sender::Transport::Test->new();
        }
        return $test_transport;
    }

    use Email::Sender::Transport::SMTP;
    return Email::Sender::Transport::SMTP->new({
        host => &DBDefs::SMTP_SERVER,
    });
}

sub _send_email
{
    my ($self, $email) = @_;

    my $args = { transport => $self->transport };
    if ($email->header('Sender')) {
        my @sender = Email::Address->parse($email->header('Sender'));
        $args->{from} = $sender[0]->address;
    }
    return sendmail($email, $args);
}

__PACKAGE__->meta->make_immutable;
no Moose;
1;

=head1 COPYRIGHT

Copyright (C) 2009 Lukas Lalinsky

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

=cut
