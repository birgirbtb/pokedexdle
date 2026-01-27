"use server";

import { FormState, LoginFormSchema, SignupFormSchema } from "@/lib/schemas";
import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";

export async function login(state: FormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    emailusername: formData.get("emailusername"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { emailusername, password } = validatedFields.data;

  const supabase = await createClient();

  let email = emailusername;
  const isEmail = emailusername.includes("@");

  if (!isEmail) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", emailusername.toLowerCase())
      .single();

    if (error || !profile) {
      return {
        errors: {
          emailusername: ["Invalid username or password."],
        },
      };
    }

    email = profile.email;
  }

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    return {
      errors: {
        emailusername: ["Invalid email/username or password."],
      },
    };
  }

  redirect("/");
}

export async function signup(state: FormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, email, password, confirmPassword } = validatedFields.data;

  if (password !== confirmPassword) {
    return {
      errors: {
        confirmPassword: ["Passwords do not match."],
      },
    };
  }

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error)
    return {
      errors: {
        email: [error.message],
      },
    };

  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
    });

    console.log(profileError);

    if (profileError)
      return {
        errors: {
          username: ["Username is already taken."],
        },
      };
  }

  redirect("/login");
}
