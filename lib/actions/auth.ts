"use server";

/* -------------------------------------------------------------------------- */
/*                                  auth.ts                                   */
/* -------------------------------------------------------------------------- */
/*
  This file defines Server Actions for authentication:
  - login: signs the user in using Supabase Auth
    - supports logging in with either:
      1) email
      2) username (resolved to email through the profiles table)
  - signup: creates a new Supabase Auth user and inserts a profile row

  Inputs:
  - state: FormState (used by useActionState on the client)
  - formData: the submitted form fields

  Outputs:
  - On validation/auth errors: returns { errors: ... } in a consistent structure
  - On success: redirects (does not return a value)
*/

import { FormState, LoginFormSchema, SignupFormSchema } from "@/lib/schemas"; // Zod schemas + shared form state type
import { createClient } from "../supabase/server"; // Supabase server client (session/cookies aware)
import { redirect } from "next/navigation"; // Next.js redirect helper (server-side)

/* -------------------------------------------------------------------------- */
/*                                   login                                    */
/* -------------------------------------------------------------------------- */
/*
  Logs a user in using:
  - Email + password
  OR
  - Username + password (username is resolved into an email via profiles table)

  Validation:
  - Done with LoginFormSchema.safeParse(...)
  - Returns fieldErrors if validation fails

  Authentication:
  - Uses supabase.auth.signInWithPassword(...)
  - Returns a generic error message if sign-in fails
*/
export async function login(state: FormState, formData: FormData) {
  /* ----------------------------- Validate Form ---------------------------- */

  // Validate the incoming form fields using Zod schema
  const validatedFields = LoginFormSchema.safeParse({
    emailusername: formData.get("emailusername"), // Field name from the Login form
    password: formData.get("password"), // Field name from the Login form
  });

  // If validation fails, return the Zod field errors back to the client
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors, // { fieldName: ["error message"] }
    };
  }

  // Extract validated and typed values
  const { emailusername, password } = validatedFields.data;

  /* -------------------------- Create Supabase Client ---------------------- */

  // Server-side Supabase client (can read/write auth session cookies)
  const supabase = await createClient();

  /* -------------------- Determine if email or username -------------------- */

  // Default "email" value is whatever the user typed
  // If user typed a username instead of email, we will replace this later
  let email = emailusername;

  // If it includes "@", treat it like an email
  const isEmail = emailusername.includes("@");

  /* -------------------------- Username -> Email --------------------------- */

  // If user typed a username (not an email), resolve it to an email
  if (!isEmail) {
    // Look up email by username in profiles table
    const { data: profile, error } = await supabase
      .from("profiles") // Where usernames/emails are stored
      .select("email") // Only need the email field
      .eq("username", emailusername.toLowerCase()) // Normalize username before matching
      .single(); // Expect one profile row

    // If username doesn't exist (or query failed), return a generic login error
    if (error || !profile) {
      return {
        errors: {
          emailusername: ["Invalid username or password."],
        },
      };
    }

    // Replace "email" with the resolved email from the profile row
    email = profile.email;
  }

  /* ----------------------------- Sign In --------------------------------- */

  // Attempt to sign in with Supabase Auth using email + password
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // If Supabase returns an auth error, return a generic login error
  if (loginError) {
    return {
      errors: {
        emailusername: ["Invalid email/username or password."],
      },
    };
  }

  /* ----------------------------- Success --------------------------------- */

  // On success, redirect user to the homepage (game page)
  redirect("/");
}

/* -------------------------------------------------------------------------- */
/*                                   signup                                   */
/* -------------------------------------------------------------------------- */
/*
  Creates a new user using Supabase Auth signUp, then inserts a row into profiles.

  Validation:
  - Done with SignupFormSchema.safeParse(...)
  - Returns fieldErrors if validation fails
  - Extra manual check for matching passwords

  Auth + Profile:
  - supabase.auth.signUp creates the auth user
  - supabase.from("profiles").insert creates a profile row
*/
export async function signup(state: FormState, formData: FormData) {
  /* ----------------------------- Validate Form ---------------------------- */

  // Validate the incoming form fields using Zod schema
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get("username"), // Field name from Signup form
    email: formData.get("email"), // Field name from Signup form
    password: formData.get("password"), // Field name from Signup form
    confirmPassword: formData.get("confirmPassword"), // Field name from Signup form
  });

  // If validation fails, return the Zod field errors back to the client
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors, // { fieldName: ["error message"] }
    };
  }

  // Extract validated and typed values
  const { username, email, password, confirmPassword } = validatedFields.data;

  /* ----------------------- Confirm Password Check ------------------------- */

  // If the confirmation password doesn't match, return a field error
  if (password !== confirmPassword) {
    return {
      errors: {
        confirmPassword: ["Passwords do not match."],
      },
    };
  }

  /* -------------------------- Create Supabase Client ---------------------- */

  // Server-side Supabase client
  const supabase = await createClient();

  /* ------------------------ Create Auth Account --------------------------- */

  // Create a Supabase Auth user
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // If Supabase signUp fails (email already used, invalid email, etc.),
  // return the error message mapped to the email field
  if (error)
    return {
      errors: {
        email: [error.message],
      },
    };

  /* --------------------------- Create Profile Row ------------------------- */

  // Only insert a profile if the auth user was created successfully
  if (authData.user) {
    // Insert profile data
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id, // Must match Supabase auth user id
      username: username.toLowerCase(), // Store normalized username
      email: email.toLowerCase(), // Store normalized email
    });

    // Debug log (safe to remove later if you don't want console output)
    console.log(profileError);

    // If profile insertion fails, return a "username taken" type error message
    // NOTE: This assumes your DB enforces unique usernames
    if (profileError)
      return {
        errors: {
          username: ["Username is already taken."],
        },
      };
  }

  /* ----------------------------- Success --------------------------------- */

  // After successful signup, send user to login page
  redirect("/login");
}
