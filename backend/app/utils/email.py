"""Low-level SMTP email sending utility."""
import logging
import smtplib
from email.message import EmailMessage

from backend.app.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str, html: str | None = None) -> bool:
    """Send an email via SMTP.

    Returns ``True`` on success. Failures are logged and return ``False`` so
    that email problems never crash a request flow.
    """
    message = EmailMessage()
    message["From"] = settings.SMTP_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    if html:
        message.add_alternative(html, subtype="html")

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
        return True
    except Exception as exc:  # noqa: BLE001 - email must never break the request
        logger.warning("Failed to send email to %s: %s", to, exc)
        return False
