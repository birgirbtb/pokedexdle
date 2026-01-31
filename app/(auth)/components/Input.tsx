import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={cn(
        "w-full rounded-md border border-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-800",
        className,
      )}
    />
  );
}
