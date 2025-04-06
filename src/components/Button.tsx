import { ReactNode } from "react";

const Button = ({
  children,
  onClick,
  type,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-emerald-500/80 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg shadow-md transition-all cursor-pointer duration-300"
    >
      {children}
    </button>
  );
};

export default Button;
