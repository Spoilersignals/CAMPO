"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { register, verifyEmail, resendVerificationCode } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyPending, setVerifyPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (state?.pendingVerification && state?.email) {
      setShowVerification(true);
      setVerificationEmail(state.email);
    }
  }, [state?.pendingVerification, state?.email]);

  async function handleVerify() {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerifyError("Please enter the 6-digit code");
      return;
    }

    setVerifyPending(true);
    setVerifyError("");

    const result = await verifyEmail(verificationEmail, verificationCode);

    if (result.success) {
      // Auto sign in after verification
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!signInResult?.error) {
          router.push("/");
          router.refresh();
        } else {
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    } else {
      setVerifyError(result.error || "Verification failed");
    }

    setVerifyPending(false);
  }

  async function handleResend() {
    setResendPending(true);
    setResendSuccess(false);
    setVerifyError("");

    const result = await resendVerificationCode(verificationEmail);

    if (result.success) {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } else {
      setVerifyError(result.error || "Failed to resend code");
    }

    setResendPending(false);
  }

  if (showVerification) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to {verificationEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
              {state.error}
            </div>
          )}
          
          {verifyError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {verifyError}
            </div>
          )}

          {resendSuccess && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
              Verification code sent! Check your email.
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>

          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={verifyPending || verificationCode.length !== 6}
          >
            {verifyPending ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendPending}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {resendPending ? "Sending..." : "Didn't receive the code? Resend"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            <button
              type="button"
              onClick={() => setShowVerification(false)}
              className="font-medium text-blue-600 hover:underline"
            >
              Use a different email
            </button>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Create an account with ComradeZone</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          {state?.error && !state?.pendingVerification && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <Input
            name="name"
            type="text"
            label="Full Name"
            placeholder="John Doe"
            error={state?.fieldErrors?.name?.[0]}
            required
          />

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            error={state?.fieldErrors?.email?.[0]}
            required
          />

          <PasswordInput
            name="password"
            label="Password"
            placeholder="••••••••"
            error={state?.fieldErrors?.password?.[0]}
            required
          />

          <PasswordInput
            name="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            error={state?.fieldErrors?.confirmPassword?.[0]}
            required
          />

          <Input
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="+1234567890"
            error={state?.fieldErrors?.phone?.[0]}
            required
          />

          <Input
            name="studentId"
            type="text"
            label="Student ID / Registration Number"
            placeholder="STU123456"
            error={state?.fieldErrors?.studentId?.[0]}
            required
          />

          <Input
            name="schoolName"
            type="text"
            label="School Name"
            placeholder="University of Example"
            error={state?.fieldErrors?.schoolName?.[0]}
            required
          />

          <div className="flex items-start gap-2">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
          {state?.fieldErrors?.terms?.[0] && (
            <p className="text-sm text-red-600">{state.fieldErrors.terms[0]}</p>
          )}

          <SubmitButton />

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
