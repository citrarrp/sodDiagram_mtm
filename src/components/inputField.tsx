import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const InputField = ({
  type,
  placeholder,
  value,
  dark,
  onChange,
  Icon,
  ...rest
}: {
  type: string;
  placeholder: string;
  value?: string;
  dark?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="relative w-full">
      {Icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {Icon}
        </span>
      )}
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className={`w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 rounded-lg outline-none ${
          dark ? "bg-white" : "bg-none"
        }`}
        required
        {...rest}
      />
      <div>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
