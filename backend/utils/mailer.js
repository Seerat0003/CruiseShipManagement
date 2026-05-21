const nodemailer = require("nodemailer");

let transporterPromise;
let warnedAboutMissingConfig = false;

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
};

const getMailConfig = () => ({
  host: process.env.SMTP_HOST || "",
  port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
  secure: parseBoolean(process.env.SMTP_SECURE, false),
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  fromEmail: process.env.MAIL_FROM_EMAIL || "noreply@oceanserenity.com",
  fromName: process.env.MAIL_FROM_NAME || "Ocean Serenity Fleet",
  replyTo: process.env.MAIL_REPLY_TO || "",
});

const hasSmtpConfig = (config) => Boolean(config.host && config.user && config.pass);

const getTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    const config = getMailConfig();
    if (!hasSmtpConfig(config)) {
      if (!warnedAboutMissingConfig) {
        console.warn(
          "Email disabled: set SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM_EMAIL in backend/.env to send booking confirmations."
        );
        warnedAboutMissingConfig = true;
      }

      return null;
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.verify();
    console.log(`Email transporter ready (${config.host}:${config.port})`);
    return transporter;
  })().catch((error) => {
    transporterPromise = null;
    throw error;
  });

  return transporterPromise;
};

const buildBookingApprovedEmail = (booking) => {
  const config = getMailConfig();
  const bookingName = booking.Service?.name || booking.Cruise?.name || "Premium Booking";
  const bookingType = booking.Service ? "service booking" : "cruise booking";
  const startTime = booking.start_time ? new Date(booking.start_time).toLocaleString() : "To be announced";

  return {
    from: `"${config.fromName}" <${config.fromEmail}>`,
    replyTo: config.replyTo || undefined,
    to: booking.User.email,
    subject: `Booking Approved: ${bookingName}`,
    text: [
      `Hello ${booking.User.name},`,
      "",
      `Your ${bookingType} has been approved.`,
      `Booking: ${bookingName}`,
      `Scheduled time: ${startTime}`,
      "",
      "Thank you for choosing Ocean Serenity.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 24px;">
        <div style="background: #07101a; color: #f8fafc; border-radius: 16px 16px 0 0; padding: 24px;">
          <h2 style="margin: 0; color: #f7d6a5;">Booking Approved</h2>
          <p style="margin: 12px 0 0; color: rgba(248,250,252,0.82);">Ocean Serenity reservation confirmation</p>
        </div>
        <div style="border: 1px solid #dbe4f0; border-top: 0; border-radius: 0 0 16px 16px; padding: 24px; background: #ffffff;">
          <p style="margin-top: 0;">Hello ${booking.User.name},</p>
          <p>Your ${bookingType} has been approved.</p>
          <div style="background: #f8fafc; border: 1px solid #dbe4f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Booking:</strong> ${bookingName}</p>
            <p style="margin: 0 0 8px;"><strong>Scheduled time:</strong> ${startTime}</p>
            <p style="margin: 0;"><strong>Status:</strong> <span style="color: #15803d;">Confirmed</span></p>
          </div>
          <p style="margin-bottom: 0;">Thank you for choosing Ocean Serenity.</p>
        </div>
      </div>
    `,
  };
};

const sendBookingApprovedEmail = async (booking) => {
  if (!booking?.User?.email) {
    return { skipped: true, reason: "missing-recipient" };
  }

  const transporter = await getTransporter();
  if (!transporter) {
    return { skipped: true, reason: "missing-smtp-config" };
  }

  const info = await transporter.sendMail(buildBookingApprovedEmail(booking));
  console.log(`Booking approval email sent to ${booking.User.email} (messageId: ${info.messageId})`);
  return { skipped: false, info };
};

module.exports = {
  sendBookingApprovedEmail,
};
