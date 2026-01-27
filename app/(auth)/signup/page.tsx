"use client";

import Input from "../components/Input";
import Button from "../components/Button";
import { useActionState } from "react";
import { signup } from "@/lib/actions/auth";
import Link from "next/link";

export default function SignUp() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="text-2xl text-center font-semibold">Sign Up</h1>

      <form className="space-y-4" action={action}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="yourname@gmail.com"
          />
          {!pending && state?.errors?.email && (
            <p className="text-sm text-red-600">{state.errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="yourname"
          />
          {!pending && state?.errors?.username && (
            <p className="text-sm text-red-600">{state.errors.username}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
          />
          {!pending && state?.errors?.password && (
            <p className="text-sm text-red-600">{state.errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
          />
          {!pending && state?.errors?.confirmPassword && (
            <p className="text-sm text-red-600">
              {state.errors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" disabled={pending}>
          Sign Up
        </Button>
        <Link href="/login">
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-200"
          >
            Login
          </Button>
        </Link>
      </form>
    </div>
  );
}
