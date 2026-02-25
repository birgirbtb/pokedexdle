"use client";

/* -------------------------------------------------------------------------- */
/*                                   Login                                    */
/* -------------------------------------------------------------------------- */
/*
  This is the Login page/component.
  It renders:
  - A styled "glass" card container
  - A form with:
    - Email/Username input
    - Password input
    - Submit button (Login)
    - Link button to Signup

  It uses:
  - react-hook-form to manage form state and validation
  - Zod to define a validation schema for the form data
  - zodResolver to connect Zod validation with react-hook-form
  - the login server action to handle form submission and return field-specific errors
*/

import Input from "../components/Input"; // Custom styled input component
import Button from "../components/Button"; // Custom styled button component
import { login } from "@/lib/actions/auth"; // Server action that performs login + returns validation state
import Link from "next/link"; // Next.js client navigation
import { useForm } from "react-hook-form"; // Form handling library
import * as z from "zod"; // Zod for schema validation
import { zodResolver } from "@hookform/resolvers/zod"; // Connects Zod with react-hook-form
import { LoginFormSchema } from "@/lib/schemas"; // Zod schema for validating the login form data
import { ArrowLeft } from "lucide-react";

export default function Login() {
  // Initialize the form with react-hook-form and Zod validation
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      emailusername: "",
      password: "",
    },
  });

  // onSubmit is called when the form is submitted and validation passes
  const onSubmit = async (data: z.infer<typeof LoginFormSchema>) => {
    try {
      // Call the login server action with the form data
      const response = await login(data);

      // If there are field-specific errors returned by the server action, set them in the form state
      if (response.errors.emailusername) {
        form.setError("emailusername", {
          message: response.errors.emailusername.join(", "),
        });
      }
      if (response.errors.password) {
        form.setError("password", {
          message: response.errors.password.join(", "),
        });
      }
    } catch (error) {
      // We leave this empty because the server action should handle all errors and return them in the response.
    }
  };

  return (
    /* ----------------------------- Outer Card ------------------------------ */
    // Glassmorphism container:
    // - max-w-xl keeps the login form from getting too wide on desktop
    // - rounded border + blur + gradient matches the site style
    <div className="relative w-full max-w-xl rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
      {/* ------------------------------ Header ------------------------------ */}
      <header className="relative border-b border-white/10">
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-md text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <ArrowLeft size={16} />
        </Link>
        {/* Title */}
        <h1 className="text-white text-center p-4 tracking-[0.2px] text-2xl font-semibold">
          Login
        </h1>
      </header>

      {/* ------------------------------ Content ----------------------------- */}
      <section className="p-4.5">
        {/* 
          Form:
          - onSubmit is handled by react-hook-form's handleSubmit which runs validation and then calls our onSubmit function
          - space-y-4 adds vertical spacing between sections
        */}
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {/* --------------------- Email/Username Field ---------------------- */}
          <div className="space-y-2">
            {/* Label */}
            <label
              htmlFor="emailusername"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Email/Username
            </label>

            {/* Input:
                - name must match what the server action expects (emailusername)
                - id matches label htmlFor for accessibility
                - type="text is a standard text input
                - {...form.register("emailusername")} connects this input to react-hook-form
            */}
            <Input
              id="emailusername"
              type="text"
              placeholder="yourname@gmail.com"
              aria-invalid={!!form.formState.errors.emailusername}
              {...form.register("emailusername")}
            />

            {/* Validation error:
                - Only show errors when NOT pending (prevents flashing while submitting)
                - Reads field-specific error from formState.errors.emailusername
            */}
            {!form.formState.isSubmitting &&
              form.formState.errors.emailusername && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.emailusername.message}
                </p>
              )}
          </div>

          {/* ------------------------- Password Field ------------------------- */}
          <div className="space-y-2">
            {/* Label */}
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Password
            </label>
            {/* Input:
                - name must match what the server action expects (password)
                - type password hides characters
                - {...form.register("password")} connects this input to react-hook-form
            */}
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            {/* Validation error:
                - Only show errors when NOT pending (prevents flashing while submitting)
                - Reads field-specific error from formState.errors.password
            */}
            {!form.formState.isSubmitting && form.formState.errors.password && (
              <p className="text-sm text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* -------------------------- Submit Button ------------------------- */}
          {/* Submit triggers the server action (login) */}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Login
          </Button>

          {/* -------------------------- Signup Link --------------------------- */}
          {/* Link navigates to /signup, but the button is type="button" so it doesn't submit */}
          <Link href="/signup">
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            >
              Sign up
            </Button>
          </Link>
        </form>
      </section>
    </div>
  );
}
