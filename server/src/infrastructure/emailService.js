import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

/** Send the 6-digit verification code email */
export const sendOTPEmail = async (to, firstName, code) => {
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0fafa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fafa;padding:40px 0;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#0f9b8e,#0a7a6e);padding:36px 40px;text-align:center;">
  <div style="font-size:40px;margin-bottom:10px;">🔐</div>
  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Verify Your Email</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">MediTrack — Your Health Companion</p>
</td></tr>
<tr><td style="padding:40px;">
  <p style="margin:0 0 8px;font-size:16px;color:#0f4a47;">Hi <strong>${firstName}</strong> 👋</p>
  <p style="margin:0 0 32px;font-size:14px;color:#6b9e9a;line-height:1.6;">
    Use the verification code below to confirm your email address for medication reminders.
    This code expires in <strong style="color:#0f4a47;">10 minutes</strong>.
  </p>

  <!-- OTP Box -->
  <div style="text-align:center;margin:0 0 32px;">
    <div style="display:inline-block;background:#f0fafa;border:2px dashed #0f9b8e;border-radius:20px;padding:28px 48px;">
      <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#0f4a47;font-family:monospace;">
        ${code}
      </div>
    </div>
  </div>

  <div style="padding:16px 20px;background:#fff8e1;border-radius:14px;border-left:4px solid #f59e0b;">
    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
      ⚠️ Never share this code with anyone. MediTrack will never ask for it by phone or chat.
    </p>
  </div>
</td></tr>
<tr><td style="padding:16px 40px 28px;text-align:center;border-top:1px solid #e6f7f5;">
  <p style="margin:0;font-size:12px;color:#6b9e9a;">
    If you didn't request this, you can safely ignore this email.
  </p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  await createTransporter().sendMail({
    from:    `"MediTrack 💊" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${code} is your MediTrack verification code`,
    html,
  });

  console.log(`📧 OTP sent to ${to}`);
};

/** Send medication reminder email */
export const sendReminderEmail = async (to, firstName, meds) => {
  const medRows = meds.map((m) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e6f7f5;font-weight:700;color:#0f4a47;">${m.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e6f7f5;color:#0f9b8e;">${m.dosage}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e6f7f5;color:#6b9e9a;">${m.time}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0fafa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fafa;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#0f9b8e,#0a7a6e);padding:36px 40px;text-align:center;">
  <div style="font-size:40px;margin-bottom:10px;">💊</div>
  <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Medication Reminder</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">MediTrack — Your Health Companion</p>
</td></tr>
<tr><td style="padding:36px 40px;">
  <p style="margin:0 0 8px;font-size:16px;color:#0f4a47;">Hi <strong>${firstName}</strong> 👋</p>
  <p style="margin:0 0 28px;font-size:14px;color:#6b9e9a;line-height:1.6;">
    This is your scheduled medication reminder. Please take the following medication(s) now:
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:14px;overflow:hidden;border:1.5px solid #e6f7f5;">
    <thead><tr style="background:#e6f7f5;">
      <th style="padding:10px 16px;text-align:left;font-size:12px;color:#0f9b8e;font-weight:700;text-transform:uppercase;">Medication</th>
      <th style="padding:10px 16px;text-align:left;font-size:12px;color:#0f9b8e;font-weight:700;text-transform:uppercase;">Dosage</th>
      <th style="padding:10px 16px;text-align:left;font-size:12px;color:#0f9b8e;font-weight:700;text-transform:uppercase;">Scheduled</th>
    </tr></thead>
    <tbody>${medRows}</tbody>
  </table>
  <div style="margin-top:28px;padding:18px 20px;background:#f0fafa;border-radius:14px;border-left:4px solid #0f9b8e;">
    <p style="margin:0;font-size:13px;color:#6b9e9a;line-height:1.6;">
      ⚠️ <strong style="color:#0f4a47;">Medical Disclaimer:</strong>
      Always follow your doctor's instructions regarding dosage and timing.
    </p>
  </div>
</td></tr>
<tr><td style="padding:20px 40px 32px;text-align:center;border-top:1px solid #e6f7f5;">
  <p style="margin:0;font-size:12px;color:#6b9e9a;">
    You're receiving this because you enabled email reminders in MediTrack.<br/>
    To stop reminders, remove your email from the app's reminder settings.
  </p>
</td></tr>
</table></td></tr></table>
</body></html>`;

  await createTransporter().sendMail({
    from:    `"MediTrack 💊" <${process.env.GMAIL_USER}>`,
    to,
    subject: `💊 Medication Reminder — ${meds.map((m) => m.name).join(", ")}`,
    html,
  });

  console.log(`📧 Reminder sent to ${to} for: ${meds.map((m) => m.name).join(", ")}`);
};
