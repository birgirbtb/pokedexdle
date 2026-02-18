"use client";

import Input from "../components/Input";
import Button from "../components/Button";
import { useActionState, useEffect, useEffectEvent, useState } from "react";
import { login } from "@/lib/actions/auth";
import Link from "next/link";

export default function Login() {
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
    <div className="relative w-full max-w-xl rounded-[18px] overflow-hidden bg-linear-to-b from-white/6 to-white/3 border border-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.45)] backdrop-blur-[10px]">
      <header className="border-b border-white/10">
        <h1 className="text-white text-center p-4 tracking-[0.2px] text-2xl font-semibold">
          Login
        </h1>
      </header>

      <section className="p-4.5">
        <form className="space-y-4" action={action}>
          <div className="space-y-2">
            <label
              htmlFor="emailusername"
              className="text-sm font-medium text-[#e8eefc]"
            >
              Email/Username
            </label>
            <Input
              id="emailusername"
              name="emailusername"
              type="text"
              placeholder="yourname@gmail.com"
              onChange={clearErrors}
            />
            {!pending && errors?.emailusername && (
              <p className="text-sm text-red-600">{errors.emailusername}</p>
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

          <Button type="submit" disabled={pending}>
            Login
          </Button>
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
