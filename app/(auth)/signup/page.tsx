"use client";

/* -------------------------------------------------------------------------- */
/*                                  SignUp                                    */
/* -------------------------------------------------------------------------- */
/*
  This is the Signup page/component.
  It renders:
  - A styled "glass" card container
  - A form with:
    - Email input
    - Username input
    - Password input
    - Confirm password input
    - Submit button (Sign Up)
    - Link button to Login

  It uses:
  - react-hook-form to manage form state and validation
  - Zod to define a validation schema for the form data
  - zodResolver to connect Zod validation with react-hook-form
  - the signup server action to handle form submission and return field-specific errors
*/

import Input from "../components/Input"; // Custom styled input component
import Button from "../components/Button"; // Custom styled button component
import Link from "next/link"; // Next.js client navigation
import { signup } from "@/lib/actions/auth"; // Server action for signing up
import { useForm } from "react-hook-form"; // Form handling library
import * as z from "zod"; // Zod for schema validation
import { zodResolver } from "@hookform/resolvers/zod"; // Connects Zod with react-hook-form
import { SignupFormSchema } from "@/lib/schemas"; // Zod schema for validating the signup form data

export default function SignUp() {
  // Initialize the form with react-hook-form and Zod validation
  const form = useForm<z.infer<typeof SignupFormSchema>>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // onSubmit is called when the form is submitted and validation passes
  const onSubmit = async (data: z.infer<typeof SignupFormSchema>) => {
    try {
      // Call the signup server action with the form data
      const response = await signup(data);

      // If there are field-specific errors returned by the server action, set them in the form state
      if (response.errors.username) {
        form.setError("username", {
          message: response.errors.username.join(", "),
        });
      }

      if (response.errors.email) {
        form.setError("email", {
          message: response.errors.email.join(", "),
        });
      }
      if (response.errors.password) {
        form.setError("password", {
          message: response.errors.password.join(", "),
        });
      }
      if (response.errors.confirmPassword) {
        form.setError("confirmPassword", {
          message: response.errors.confirmPassword.join(", "),
        });
      }
    } catch (error) {
      // We leave this empty because the server action should handle all errors and return them in the response.
    }
  };

  return (
    /* ----------------------------- Outer Card ------------------------------ */
    // Glassmorphism container:
    // - max-w-xl keeps the signup form from getting too wide on desktop
    // - rounded border + blur + gradient matches the site style
    <div className="relative w-full max-w-xl rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
      {/* ------------------------------ Header ------------------------------ */}
      <header className="border-b border-white/10">
        {/* Title */}
        <h1 className="text-white text-center p-4 tracking-[0.2px] text-2xl font-semibold">
          Sign Up
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
          {/* ----------------------------- Email ----------------------------- */}
          <div className="space-y-2">
            {/* Label */}
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Email
            </label>

            {/* Input:
                - name must match what the server action expects (email)
                - type="email" enables basic email keyboard/autofill on mobile
                - {...form.register("email")} connects this input to react-hook-form
            */}
            <Input
              id="email"
              type="email"
              placeholder="yourname@gmail.com"
              {...form.register("email")}
            />

            {/* Validation error:
                - Only show errors when NOT pending (prevents flashing while submitting)
                - Reads field-specific error from formState.errors.email
            */}
            {!form.formState.isSubmitting && form.formState.errors.email && (
              <p className="text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* --------------------------- Username ---------------------------- */}
          <div className="space-y-2">
            {/* Label */}
            <label
              htmlFor="username"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Username
            </label>

            {/* Input:
                - name must match what the server action expects (username)
                - type="text" is a standard text input
                - {...form.register("username")} connects this input to react-hook-form
            */}
            <Input
              id="username"
              type="text"
              placeholder="yourname"
              {...form.register("username")}
            />

            {!form.formState.errors.username && (
              <p className="text-xs text-white/70">
                Only letters and numbers are allowed.
              </p>
            )}

            {/* Validation error:
                - Only show errors when NOT pending (prevents flashing while submitting)
                - Reads field-specific error from formState.errors.username
            */}
            {!form.formState.isSubmitting && form.formState.errors.username && (
              <p className="text-xs text-red-600">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          {/* --------------------------- Password ---------------------------- */}
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
                - type="password" hides characters
                - {...form.register("password")} connects this input to react-hook-form
            */}
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
            />

            {!form.formState.errors.password && (
              <p className="text-xs text-white/70">
                Must be at least 6 characters and include a letter, number, and
                special character.
              </p>
            )}

            {/* Validation error:
                - Only show errors when NOT pending (prevents flashing while submitting)
                - Reads field-specific error from formState.errors.password
            */}
            {!form.formState.isSubmitting && form.formState.errors.password && (
              <p className="text-xs text-red-600">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* ---------------------- Confirm Password ------------------------- */}
          <div className="space-y-2">
            {/* Label */}
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Confirm Password
            </label>

            {/* Input:
                - name must match what the server action expects (confirmPassword)
                - used to confirm user typed the intended password
                - type="password" hides characters
                - {...form.register("confirmPassword")} connects this input to react-hook-form
            */}
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...form.register("confirmPassword")}
            />

            {/* Validation error:
                - Only show errors when NOT pending (prevents flashing while submitting)
                - Reads field-specific error from formState.errors.confirmPassword
            */}
            {!form.formState.isSubmitting &&
              form.formState.errors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
          </div>

          {/* -------------------------- Submit Button ------------------------- */}
          {/* Submit triggers the server action (signup) through react-hook-form's handleSubmit */}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Sign Up
          </Button>

          {/* ---------------------------- Login Link -------------------------- */}
          {/* Link navigates to /login, but the button is type="button" so it doesn't submit */}
          <Link href="/login">
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-200"
            >
              Login
            </Button>
          </Link>
        </form>
      </section>
    </div>
  );
}
