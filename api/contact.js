const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>]/g, '').trim().substring(0, 1000);
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' });

    const { name, email, tour, date, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ ok: false, message: 'Please fill in all required fields.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ ok: false, message: 'Invalid email address.' });
    }

    try {
        await transporter.sendMail({
            from: `"${sanitize(name)} via GoT Tours" <${process.env.SMTP_USER}>`,
            replyTo: sanitize(email),
            to: process.env.SMTP_USER,
            subject: `📩 New Contact Message from ${sanitize(name)}`,
            html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#c8a84e;font-size:22px;font-family:Georgia,serif;letter-spacing:1px;">⚔ Dubrovnik Game of Thrones Tours</h1>
    <p style="margin:8px 0 0;color:#a0a0b0;font-size:13px;">New Contact Form Submission</p>
  </td></tr>
  <!-- Sender card -->
  <tr><td style="padding:28px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:10px;border-left:4px solid #c8a84e;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#1a1a2e;">${sanitize(name)}</p>
        <a href="mailto:${sanitize(email)}" style="color:#4a7c59;font-size:14px;text-decoration:none;">${sanitize(email)}</a>
      </td></tr>
    </table>
  </td></tr>
  <!-- Details -->
  <tr><td style="padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${tour ? '<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;width:110px;">Tour Interest</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;font-size:14px;">' + sanitize(tour) + '</td></tr>' : ''}
      ${date ? '<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:13px;width:110px;">Preferred Date</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;font-size:14px;">' + sanitize(date) + '</td></tr>' : ''}
    </table>
  </td></tr>
  <!-- Message -->
  <tr><td style="padding:0 40px 28px;">
    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;">Message</p>
    <div style="background:#fafafa;border-radius:8px;padding:16px 20px;border:1px solid #eee;font-size:14px;line-height:1.6;color:#333;">${sanitize(message)}</div>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#999;">Reply directly to this email to respond to <strong>${sanitize(name)}</strong></p>
    <p style="margin:8px 0 0;font-size:11px;color:#bbb;">dubrovnikgameofthronestours.com</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>
            `
        });
        res.json({ ok: true, message: 'Message sent! We will get back to you soon.' });
    } catch (err) {
        console.error('Email error:', err.message);
        res.status(500).json({ ok: false, message: 'Failed to send. Please email us directly.' });
    }
};
