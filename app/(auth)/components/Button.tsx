import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        "flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white cursor-pointer transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200",
        className,
      )}
    >
      {children}
    </button>
  );
}
