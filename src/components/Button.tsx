import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const Button = ({
  children,
  variant,
  size,
  full,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button className={button({ variant, size, full, className })} {...props}>
      {children}
    </button>
  );
};

const button = cva(
  "whitespace-nowrap flex items-center font-semibold gap-1 border border-gray-600 hover:border-gray-500 text-center rounded-md bg-gray-700 hover:bg-gray-600 active:bg-gray-700 text-gray-300 appearance-none select-none cursor-pointer active:transition-none transition-color",
  {
    variants: {
      variant: {
        default: "",
        invisible:
          "border-none bg-transparent active:bg-gray-700/60 hover:bg-gray-700",
        danger:
          "text-red-400 hover:bg-red-500 hover:text-gray-200 hover:border-red-400 active:text-white active:border-red-400 active:bg-red-600",
      },
      size: {
        xs: "px-3 py-[3px] text-xs h-7",
        sm: "px-4 py-2 text-sm h-8",
      },
      full: {
        true: "block w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;
