"use client";

import Input from "../components/Input";
import Button from "../components/Button";
import { useActionState, useEffect, useEffectEvent, useState } from "react";
import { signup } from "@/lib/actions/auth";
import Link from "next/link";

export default function SignUp() {
  const [state, action, pending] = useActionState(signup, undefined);
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
    <div className="relative w-full max-w-xl rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
      <header className="border-b border-white/10">
        <h1 className="text-white text-center p-4 tracking-[0.2px] text-2xl font-semibold">
          Sign Up
        </h1>
      </header>

      <section className="p-4.5">
        <form className="space-y-4" action={action}>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="yourname@gmail.com"
              onChange={clearErrors}
            />
            {!pending && errors?.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="yourname"
              onChange={clearErrors}
            />
            {!pending && errors?.username && (
              <p className="text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={clearErrors}
            />
            {!pending && errors?.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              onChange={clearErrors}
            />
            {!pending && errors?.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" disabled={pending}>
            Sign Up
          </Button>
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
