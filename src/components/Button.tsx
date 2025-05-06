import { ReactNode } from "react";

const Button = ({
  children,
  onClick,
  type,
  disabled,
  classes,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  classes?: string;
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled ? disabled : false}
      className={`w-full ${
        classes ? classes : "bg-emerald-500/80 text-white"
      } hover:bg-emerald-500 font-semibold py-2 rounded-lg shadow-md transition-all cursor-pointer duration-300`}
    >
      {children}
    </button>
  );
};

export default Button;
