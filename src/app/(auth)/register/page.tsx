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
import { register } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (state?.success && formRef.current) {
      const formData = new FormData(formRef.current);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      signIn("credentials", { 
        email, 
        password, 
        redirect: false 
      }).then((result) => {
        if (!result?.error) {
          router.push("/");
          router.refresh();
        }
      });
    }
  }, [state?.success, router]);

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Join ComradeZone today</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          {state?.error && (
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
