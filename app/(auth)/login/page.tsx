"use client";

import Input from "../components/Input";
import Button from "../components/Button";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import Link from "next/link";

export default function Login() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="text-2xl text-center font-semibold">Login</h1>

      <form className="space-y-4" action={action}>
        <div className="space-y-2">
          <label htmlFor="emailusername" className="text-sm font-medium">
            Email/Username
          </label>
          <Input
            id="emailusername"
            name="emailusername"
            type="text"
            placeholder="yourname@gmail.com"
          />
          {!pending && state?.errors?.emailusername && (
            <p className="text-sm text-red-600">{state.errors.emailusername}</p>
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

        <Button type="submit" disabled={pending}>
          Login
        </Button>
        <Link href="/signup">
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-200"
          >
            Sign up
          </Button>
        </Link>
      </form>
    </div>
  );
}
