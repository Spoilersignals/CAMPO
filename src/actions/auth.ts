"use server";

import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validators";
import { sendVerificationEmail, generateVerificationCode } from "@/lib/email";
import { isKabarakEmail, getSchoolFromEmail } from "@/lib/moderation";

type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
  pendingVerification?: boolean;
  email?: string;
} | null;

export async function register(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    phone: formData.get("phone") as string,
    studentId: formData.get("studentId") as string,
    schoolName: formData.get("schoolName") as string,
    terms: formData.get("terms") === "on",
  };

  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, phone, studentId, schoolName } = result.data;

  // Validate Kabarak University email
  if (!isKabarakEmail(email)) {
    return { 
      error: "Only @kabarak.ac.ke email addresses are allowed. Please use your university email.",
      fieldErrors: {
        email: ["Email must end with @kabarak.ac.ke"],
      },
    };
  }

  // Auto-detect school from email
  const detectedSchool = getSchoolFromEmail(email) || schoolName;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (!existingUser.emailVerified) {
      // Resend verification code
      const code = generateVerificationCode();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: code,
          expires,
        },
      });

      await sendVerificationEmail(email, code, existingUser.name || "User");

      return { 
        pendingVerification: true, 
        email,
        error: "An account exists but is not verified. We've sent a new verification code."
      };
    }
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      studentId,
      schoolName: detectedSchool,
    },
  });

  // Generate and send verification code
  const code = generateVerificationCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires,
    },
  });

  await sendVerificationEmail(email, code, name);

  return { pendingVerification: true, email };
}

export async function verifyEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token: code,
    },
  });

  if (!token) {
    return { success: false, error: "Invalid verification code" };
  }

  if (token.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: code } },
    });
    return { success: false, error: "Verification code has expired" };
  }

  // Mark email as verified
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: code } },
  });

  return { success: true };
}

export async function resendVerificationCode(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.emailVerified) {
    return { success: false, error: "Email is already verified" };
  }

  // Delete existing tokens
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Generate new code
  const code = generateVerificationCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires,
    },
  });

  await sendVerificationEmail(email, code, user.name || "User");

  return { success: true };
}

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return { error: "Invalid email or password" };
  }

  const isValid = await compare(password, user.password);

  if (!isValid) {
    return { error: "Invalid email or password" };
  }

  return { success: true };
}
