import nodemailer from 'nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim().substring(0, 1000);
}

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return Response.json({ ok: false, message: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { tour, name, email, date, time, groupSize, requirements, website } = body;

  if (website) {
    return Response.json({ ok: true, message: 'Booking request sent! We will reply within 24 hours.' }, { headers: corsHeaders });
  }

  if (!name || !email || !date || !time) {
    return Response.json({ ok: false, message: 'Please fill in all required fields.' }, { status: 400, headers: corsHeaders });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, message: 'Invalid email address.' }, { status: 400, headers: corsHeaders });
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 465),
    secure: true,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${sanitize(name)} via GoT Tours" <${env.SMTP_USER}>`,
      replyTo: sanitize(email),
      to: env.SMTP_USER,
      subject: `🗡️ New Private Tour Booking — ${sanitize(name)} · ${sanitize(date)}`,
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#c8a84e;font-size:22px;font-family:Georgia,serif;letter-spacing:1px;">⚔ Dubrovnik Game of Thrones Tours</h1>
  <p style="margin:8px 0 0;color:#a0a0b0;font-size:13px;">New Private Tour Booking Request</p>
</td></tr>
<tr><td style="padding:28px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:10px;border-left:4px solid #c8a84e;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#1a1a2e;">${sanitize(name)}</p>
      <a href="mailto:${sanitize(email)}" style="color:#4a7c59;font-size:14px;text-decoration:none;">${sanitize(email)}</a>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:20px 40px 0;text-align:center;">
  <span style="display:inline-block;background:#1a1a2e;color:#c8a84e;font-size:14px;font-weight:600;padding:8px 24px;border-radius:20px;">${sanitize(tour || 'Private Tour')}</span>
</td></tr>
<tr><td style="padding:24px 40px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="50%" style="padding:8px 8px 8px 0;vertical-align:top;"><div style="background:#f8f9fa;border-radius:8px;padding:14px 16px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">📅 Date</p><p style="margin:0;font-size:16px;font-weight:600;color:#333;">${sanitize(date)}</p></div></td>
      <td width="50%" style="padding:8px 0 8px 8px;vertical-align:top;"><div style="background:#f8f9fa;border-radius:8px;padding:14px 16px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">🕐 Time</p><p style="margin:0;font-size:16px;font-weight:600;color:#333;">${sanitize(time)}</p></div></td>
    </tr>
    <tr>
      <td colspan="2" style="padding:8px 0 0;"><div style="background:#f8f9fa;border-radius:8px;padding:14px 16px;"><p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">👥 Group Size</p><p style="margin:0;font-size:16px;font-weight:600;color:#333;">${sanitize(groupSize || 'Not specified')}</p></div></td>
    </tr>
  </table>
</td></tr>
${requirements ? `<tr><td style="padding:0 40px 28px;"><p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;">Special Requirements</p><div style="background:#fafafa;border-radius:8px;padding:16px 20px;border:1px solid #eee;font-size:14px;line-height:1.6;color:#333;">${sanitize(requirements)}</div></td></tr>` : ''}
<tr><td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
  <p style="margin:0;font-size:12px;color:#999;">Reply directly to this email to respond to <strong>${sanitize(name)}</strong></p>
  <p style="margin:8px 0 0;font-size:11px;color:#bbb;">dubrovnikgameofthronestours.com</p>
</td></tr>
</table>
</td></tr></table>
</body></html>
      `,
    });

    return Response.json({ ok: true, message: 'Booking request sent! We will reply within 24 hours.' }, { headers: corsHeaders });
  } catch (error) {
    console.error('Email error:', error.message);
    return Response.json({ ok: false, message: 'Failed to send. Please email us directly.' }, { status: 500, headers: corsHeaders });
  }
}
