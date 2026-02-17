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
  - useActionState(signup, initialState) to run the server action `signup`
  - `pending` to disable buttons and avoid flashing errors while submitting
  - `state?.errors` to show field-specific validation errors from the server action
*/

import Input from "../components/Input"; // Custom styled input component
import Button from "../components/Button"; // Custom styled button component
import { useActionState } from "react"; // React hook for Server Actions (form actions) with state tracking
import { signup } from "@/lib/actions/auth"; // Server action that performs signup + returns validation state
import Link from "next/link"; // Next.js client navigation

export default function SignUp() {
  /* ---------------------------- Form Action State -------------------------- */
  // useActionState returns:
  // - state: whatever your server action returns (commonly success/errors)
  // - action: the function you put on the <form action={...}>
  // - pending: true while the server action is running (form submitting)
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    /* ----------------------------- Outer Card ------------------------------ */
    // Glassmorphism container:
    // - max-w-xl keeps the signup form from getting too wide on desktop
    // - rounded border + blur + gradient matches your site style
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
          - action={action} wires this form to the server action returned by useActionState
          - space-y-4 adds vertical spacing between sections
        */}
        <form className="space-y-4" action={action}>
          {/* ----------------------------- Email ----------------------------- */}
          <div className="space-y-2">
            {/* Label */}
            <label htmlFor="email" className="text-sm font-medium text-[#e8eefc]">
              Email
            </label>

            {/* Input:
                - name must match what your server action expects (email)
                - type="email" enables basic email keyboard/autofill on mobile
            */}
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="yourname@gmail.com"
            />

            {/* Validation error:
                - Only show errors when NOT pending (prevents flashing while submitting)
                - Reads field-specific error from state.errors.email
            */}
            {!pending && state?.errors?.email && (
              <p className="text-sm text-red-600">{state.errors.email}</p>
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
                - name must match what your server action expects (username)
            */}
            <Input id="username" name="username" type="text" placeholder="yourname" />

            {/* Validation error:
                - Only show errors when NOT pending
                - Reads field-specific error from state.errors.username
            */}
            {!pending && state?.errors?.username && (
              <p className="text-sm text-red-600">{state.errors.username}</p>
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
                - name must match what your server action expects (password)
                - type="password" hides characters
            */}
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
            />

            {/* Validation error:
                - Only show errors when NOT pending
                - Reads field-specific error from state.errors.password
            */}
            {!pending && state?.errors?.password && (
              <p className="text-sm text-red-600">{state.errors.password}</p>
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
                - name must match what your server action expects (confirmPassword)
                - used to confirm user typed the intended password
            */}
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
            />

            {/* Validation error:
                - Only show errors when NOT pending
                - Reads field-specific error from state.errors.confirmPassword
            */}
            {!pending && state?.errors?.confirmPassword && (
              <p className="text-sm text-red-600">
                {state.errors.confirmPassword}
              </p>
            )}
          </div>

          {/* -------------------------- Submit Button ------------------------- */}
          {/* Submit triggers the server action (signup) */}
          <Button type="submit" disabled={pending}>
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
