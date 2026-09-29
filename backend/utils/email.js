const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a training confirmation email to a participant.
 */
async function sendConfirmationEmail({ to, name, programme, dates, venue }) {
  const dateList = dates.join(', ');
  const mailOptions = {
    from:    process.env.SMTP_FROM || 'TMS System <noreply@mdtu.gov.lk>',
    to,
    subject: `[TMS] Training Programme Confirmation – ${programme}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        <div style="background:#1D4ED8;padding:20px;color:white">
          <h2 style="margin:0">Training Confirmation</h2>
          <p style="margin:4px 0 0;opacity:.8">Management Development Training Unit</p>
        </div>
        <div style="padding:24px">
          <p>Dear <strong>${name}</strong>,</p>
          <p>You have been <strong style="color:#059669">selected</strong> for the following training programme:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:600">Programme</td><td style="padding:8px 12px">${programme}</td></tr>
            <tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:600">Date(s)</td><td style="padding:8px 12px">${dateList}</td></tr>
            <tr><td style="padding:8px 12px;background:#f1f5f9;font-weight:600">Venue</td><td style="padding:8px 12px">${venue || '—'}</td></tr>
          </table>
          <p>Please log in to the TMS portal to confirm your attendance.</p>
          <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:#1D4ED8;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">Login to TMS</a>
        </div>
        <div style="padding:12px 24px;background:#f8fafc;color:#94a3b8;font-size:12px">
          This is an automated email from the TMS. Do not reply.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err) {
    // If SMTP is not configured, log to console instead of throwing
    console.log('[EMAIL STUB] Would send to:', to, '— Subject:', mailOptions.subject);
    return { success: true, stub: true };
  }
}

module.exports = { sendConfirmationEmail };
