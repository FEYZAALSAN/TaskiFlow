const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = new PrismaClient();
const { sendPasswordResetEmail, isEmailConfigured } = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET;

//kayıt ol
exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        error:
          "Şifre en az 8 karakter olmalı; büyük harf, küçük harf, rakam ve özel karakter içermelidir.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {email}
    });

    if(user){
      res.status(400).json({
        error: "Mail adresi kullanımda."
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(password,10);
    
    const result = await prisma.$transaction(async  (tx) => {

      //kullanıcı
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          status: "active"
        }
      });

      //kullanıcı org
      const newOrg = await tx.organization.create({
        data: {
          name: `${name}'s Workspace`,
          ownerId: newUser.id
        }
      });

      //ara tabloya yaz
      await tx.user_Organization.create({
        data: {
          userId: newUser.id,
          organizationId: newOrg.id,
          role: "OWNER"
        }
      });

      return {
        user: newUser,
        organization: newOrg
      };
    });

    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        organizationId: result.organization.id
      },
      JWT_SECRET,
      {expiresIn: '24h'}
    );

    const {password: _, ...userData} = result.user;
    res.status(201).json({ message: "Kayıt Başarılı", token, user: userData });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Kayıt işlemi başarısız oldu." });
  }
};


//login
exports.login = async (req,res) => {
  const {email, password} = req.body;

  try{
    const user= await prisma.user.findUnique({
      where: {email},
      include:  {
        organizations: {
          select: {
            organizationId: true,
            organization: true,
            role: true
          }
        }
      }
    });


    if(!user) return await res.status(404).json({error: "Kullanıcı Yok."});

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Şifre yanlış." });

    const activeOrgId = user.organizations.length > 0 ? user.organizations[0].organizationId : null;


    const token = jwt.sign(
      {
        userId:user.id,
        email: user.email,
        organizationId: activeOrgId
      },
      JWT_SECRET,
      {expiresIn: '24h'}
    );

    const {password: _, ...userData} = user;
    res.json({ message: "Giriş Başarılı", token, user: userData, userOrganizations: user.organizations });

  }catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Geçerli bir e-posta girin." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: resetToken },
      });

      const resetBase =
        process.env.PASSWORD_RESET_URL ||
        "https://taskiflow.com/reset-password";
      const resetLink = `${resetBase}?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

      const sent = await sendPasswordResetEmail({
        to: normalizedEmail,
        resetLink,
      });

      if (!sent && !isEmailConfigured()) {
        console.log("[forgot-password] Mailtrap/SMTP yok. Gelistirme token:", resetToken);
        console.log("[forgot-password] Link:", resetLink);
      } else if (!sent) {
        console.error("[forgot-password] E-posta gonderilemedi:", normalizedEmail);
      }
    }

    return res.json({
      message:
        "Eğer bu e-posta kayıtlıysa, şifre sıfırlama talimatları gönderildi.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ error: "İstek işlenemedi." });
  }
};