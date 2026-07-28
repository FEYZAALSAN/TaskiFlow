const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        notificationEnabled: true,
        phone: true,
        bio: true,
        department: true,
        profileRole: true,
        location: true,
        status: true,
        createdAt: true,
        organizations: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // 🔥 İSTATİSTİKLER
    const projectCount = await prisma.project.count({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
    });

    const taskCount = await prisma.task.count({
      where: {
        OR: [
          { ownerId: userId },
          { assigneeId: userId },
        ],
      },
    });

    const completedTaskCount = await prisma.task.count({
      where: {
        isCompleted: true,
        OR: [
          { ownerId: userId },
          { assigneeId: userId },
        ],
      },
    });

    const formattedUser = {
      ...user,
      myOrganizations: (user.organizations || []).map((item) => ({
        id: item.organization.id,
        name: item.organization.name,
        role: item.role,
      })),
    };

    return res.json({
      ...formattedUser,
      stats: {
        projectCount,
        taskCount,
        completedTaskCount,
      },
    });

  } catch (error) {
    console.error("GetMe Hatası:", error);
    return res
      .status(500)
      .json({ error: "Kullanıcı bilgileri alınırken hata oluştu." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const {
      name,
      email,
      username,
      phone,
      bio,
      department,
      profileRole,
      notificationEnabled,
      location,
    } = req.body;

    if (typeof name !== "string" || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "İsim en az 2 karakter olmalıdır." });
    }

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "E-posta boş olamaz." });
    }

    if (username !== undefined && typeof username !== "string") {
      return res.status(400).json({ error: "Kullanıcı adı metin olmalıdır." });
    }

    if (phone !== undefined && typeof phone !== "string") {
      return res.status(400).json({ error: "Telefon metin olmalıdır." });
    }

    if (bio !== undefined && typeof bio !== "string") {
      return res.status(400).json({ error: "Biyografi metin olmalıdır." });
    }

    if (department !== undefined && typeof department !== "string") {
      return res.status(400).json({ error: "Departman metin olmalıdır." });
    }
    if (profileRole !== undefined && typeof profileRole !== "string") {
      return res.status(400).json({ error: "Rol metin olmalıdır." });
    }

    if (location !== undefined && typeof location !== "string") {
      return res.status(400).json({ error: "Konum metin olmalıdır." });
    }
    if (notificationEnabled !== undefined &&typeof notificationEnabled !== "boolean") {
      return res.status(400).json({ error: "Bildirim ayarı boolean olmalıdır." });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedBio = typeof bio === "string" ? bio.trim() : "";
    const trimmedDepartment =
      typeof department === "string" ? department.trim() : "";
    const trimmedProfileRole =
      typeof profileRole === "string" ? profileRole.trim() : "";
    const trimmedLocation =
      typeof location === "string" ? location.trim() : "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Geçerli bir e-posta giriniz." });
    }

    if (trimmedUsername && trimmedUsername.length < 3) {
      return res
        .status(400)
        .json({ error: "Kullanıcı adı en az 3 karakter olmalıdır." });
    }

    const existingEmailUser = await prisma.user.findFirst({
      where: {
        email: trimmedEmail,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingEmailUser) {
      return res.status(400).json({
        error: "Bu e-posta başka bir kullanıcı tarafından kullanılıyor.",
      });
    }

    if (trimmedUsername) {
      const existingUsernameUser = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUsernameUser) {
        return res.status(400).json({
          error: "Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername || null,
        phone: trimmedPhone || null,
        bio: trimmedBio || null,
        department: trimmedDepartment || null,
        profileRole: trimmedProfileRole || null,
        location: trimmedLocation || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        bio: true,
        department: true,
        profileRole: true,
        location: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "Profiliniz başarıyla güncellendi.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UpdateProfile Hatası:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    if (error?.code === "P2002") {
      return res.status(400).json({
        error: "Bu bilgiler başka bir kullanıcı tarafından kullanılıyor.",
      });
    }

    return res
      .status(500)
      .json({ error: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    const currentPasswordTrimmed = currentPassword.trim();
    const newPasswordTrimmed = newPassword.trim();
    const confirmPasswordTrimmed = confirmPassword.trim();

    if (
      !currentPasswordTrimmed ||
      !newPasswordTrimmed ||
      !confirmPasswordTrimmed
    ) {
      return res.status(400).json({ error: "Tüm alanlar doldurulmalıdır." });
    }

    const passwordPolicyOk =
      newPasswordTrimmed.length >= 8 &&
      /[A-Z]/.test(newPasswordTrimmed) &&
      /[a-z]/.test(newPasswordTrimmed) &&
      /\d/.test(newPasswordTrimmed) &&
      /[^A-Za-z0-9]/.test(newPasswordTrimmed);

    if (!passwordPolicyOk) {
      return res.status(400).json({
        error:
          "Yeni şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ile özel karakter içermelidir.",
      });
    }

    if (newPasswordTrimmed !== confirmPasswordTrimmed) {
      return res.status(400).json({ error: "Yeni şifreler eşleşmiyor." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ error: "Bu kullanıcı için şifre bilgisi bulunamadı." });
    }

    const isMatch = await bcrypt.compare(currentPasswordTrimmed, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Mevcut şifre yanlış." });
    }

    const sameAsOld = await bcrypt.compare(newPasswordTrimmed, user.password);

    if (sameAsOld) {
      return res
        .status(400)
        .json({ error: "Yeni şifre mevcut şifre ile aynı olamaz." });
    }

    const hashedPassword = await bcrypt.hash(newPasswordTrimmed, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return res.json({ message: "Şifre başarıyla güncellendi." });
  } catch (error) {
    console.error("ChangePassword Hatası:", error);
    return res
      .status(500)
      .json({ error: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Hesabı silmek için şifrenizi girin." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const isValid = await bcrypt.compare(password.trim(), user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Şifre yanlış." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: { assigneeId: userId },
        data: { assigneeId: null },
      });

      await tx.task.updateMany({
        where: { ownerId: userId },
        data: { ownerId: null },
      });

      const ownedOrganizations = await tx.organization.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });

      for (const org of ownedOrganizations) {
        await tx.organization.delete({ where: { id: org.id } });
      }

      await tx.project.deleteMany({ where: { ownerId: userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return res.json({ message: "Hesabınız kalıcı olarak silindi." });
  } catch (error) {
    console.error("DeleteAccount Hatası:", error);
    return res.status(500).json({ error: "Hesap silinemedi. Lütfen tekrar deneyin." });
  }
};