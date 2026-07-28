const nodemailer = require("nodemailer");

/** Varsayilan: Mailtrap Sandbox SMTP — https://mailtrap.io */
const MAILTRAP_SMTP = {
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false,
};

function resolveSmtpOptions() {
  const provider = (process.env.SMTP_PROVIDER || "mailtrap").toLowerCase();

  if (provider === "mailtrap") {
    return {
      host: process.env.SMTP_HOST || MAILTRAP_SMTP.host,
      port: Number(process.env.SMTP_PORT || MAILTRAP_SMTP.port),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
}

function isEmailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendMail({ to, subject, text, html }) {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] SMTP ayarlari eksik (SMTP_USER / SMTP_PASS). E-posta gonderilmedi:",
      to,
      subject
    );
    return false;
  }

  const smtp = resolveSmtpOptions();
  if (!smtp.host) {
    console.warn("[email] SMTP_HOST tanimli degil. E-posta gonderilmedi.");
    return false;
  }

  const transporter = nodemailer.createTransport(smtp);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "TaskiFlow <noreply@taskiflow.com>",
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("[email] Gonderim hatasi:", err?.message || err);
    return false;
  }
}

async function sendPasswordResetEmail({ to, resetLink }) {
  const subject = "TaskiFlow — Sifre sifirlama";
  const text = [
    "Merhaba,",
    "",
    "TaskiFlow hesabiniz icin sifre sifirlama talebi alindi.",
    "Asagidaki baglantiya tiklayin:",
    resetLink,
    "",
    "Bu talebi siz yapmadiysaniz bu e-postayi yok sayabilirsiniz.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a;">
      <h2 style="color:#2563eb;">Sifre sifirlama</h2>
      <p>TaskiFlow hesabiniz icin sifre sifirlama talebi alindi.</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">
          Sifremi sifirla
        </a>
      </p>
      <p style="font-size:13px;color:#64748b;">Baglanti calismazsa adresi tarayiciya yapistirin:<br/>${resetLink}</p>
      <p style="font-size:12px;color:#94a3b8;">Bu talebi siz yapmadiysaniz bu e-postayi yok sayabilirsiniz.</p>
    </div>
  `;

  return sendMail({ to, subject, text, html });
}

module.exports = {
  isEmailConfigured,
  sendMail,
  sendPasswordResetEmail,
};
