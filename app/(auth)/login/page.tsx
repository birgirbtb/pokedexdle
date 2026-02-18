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
  - useActionState(login, initialState) to run the server action `login`
  - `pending` to disable buttons and hide error messages while submitting
  - `state?.errors` to show field-specific validation errors from the server action
*/

import Input from "../components/Input"; // Custom styled input component
import Button from "../components/Button"; // Custom styled button component
import { useActionState, useState, useEffectEvent, useEffect } from "react"; // React hook for Server Actions (form actions) with state tracking
import { login } from "@/lib/actions/auth"; // Server action that performs login + returns validation state
import Link from "next/link"; // Next.js client navigation

export default function Login() {
  /* ---------------------------- Form Action State -------------------------- */
  // useActionState returns:
  // - state: whatever your server action returns (commonly success/errors)
  // - action: the function you put on the <form action={...}>
  // - pending: true while the server action is running (form submitting)
  const [state, action, pending] = useActionState(login, undefined);
  const [errors, setErrors] = useState(state?.errors);

  const updateErrors = useEffectEvent((state: typeof errors) => {
    setErrors(state);
  });

  useEffect(() => {
    if (state) {
      updateErrors(state.errors);
    }
  }, [state]);

  const clearErrors = () => setErrors(undefined);

  return (
    /* ----------------------------- Outer Card ------------------------------ */
    // Glassmorphism container:
    // - max-w-xl keeps the login form from getting too wide on desktop
    // - rounded border + blur + gradient matches your site style
    <div className="relative w-full max-w-xl rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
      {/* ------------------------------ Header ------------------------------ */}
      <header className="border-b border-white/10">
        {/* Title */}
        <h1 className="text-white text-center p-4 tracking-[0.2px] text-2xl font-semibold">
          Login
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
                - name must match what your server action expects (emailusername)
                - id matches label htmlFor for accessibility
            */}
            <Input
              id="emailusername"
              name="emailusername"
              type="text"
              placeholder="yourname@gmail.com"
              onChange={clearErrors}
            />

            {/* Validation error:
                - Only show errors when NOT pending (prevents flashing while submitting)
                - Reads field-specific error from state.errors.emailusername
            */}
            {!pending && errors?.emailusername && (
              <p className="text-sm text-red-600">{errors.emailusername}</p>
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
                - name must match what your server action expects (password)
                - type password hides characters
            */}
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={clearErrors}
            />
            {/* Validation error:
                - Only show errors when NOT pending
                - Reads field-specific error from state.errors.password
            */}
            {!pending && errors?.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* -------------------------- Submit Button ------------------------- */}
          {/* Submit triggers the server action (login) */}
          <Button type="submit" disabled={pending}>
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
