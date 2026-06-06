"""
Email utility for sending issue status update notifications to citizens.
All email sending is wrapped in try/except to ensure a failed email
NEVER breaks the API response.
"""

import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

# Human-readable messages per status
STATUS_MESSAGES = {
    'verified': 'Your issue has been verified and is under review by the authorities.',
    'in_progress': 'Great news! Work has started on your reported issue.',
    'resolved': 'Your issue has been resolved. Thank you for reporting it!',
    'rejected': 'Your issue report has been reviewed and was not accepted. If you believe this is an error, please contact support.',
    'pending': 'Your issue status has been reset to pending for further review.',
}


def send_status_update_email(issue):
    """
    Send an email notification to the citizen who reported the issue
    when its status changes.

    Args:
        issue: An Issue model instance with the updated status.
    """
    try:
        recipient_email = issue.reported_by.email
        if not recipient_email:
            logger.info(f"No email for user {issue.reported_by.username}, skipping notification.")
            return

        status_display = issue.get_status_display()
        status_message = STATUS_MESSAGES.get(issue.status, f'Your issue status has been updated to: {status_display}.')

        subject = f"[CivicFix] Issue #{issue.id} — Status Updated to {status_display}"

        body = (
            f"Hello {issue.reported_by.username},\n\n"
            f"There's an update on your reported issue:\n\n"
            f"  Issue:   {issue.title}\n"
            f"  ID:      #{issue.id}\n"
            f"  Status:  {status_display}\n\n"
            f"{status_message}\n\n"
            f"Thank you for helping improve your community!\n"
            f"— The CivicFix Team"
        )

        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )

        logger.info(f"Status email sent to {recipient_email} for issue #{issue.id} ({issue.status})")

    except Exception as e:
        # Never let email failures break the API response
        logger.error(f"Failed to send status email for issue #{issue.id}: {e}")
