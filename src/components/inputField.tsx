import React from "react";

const InputField = ({
  type,
  placeholder,
  value,
  onChange,
  Icon,
  ...rest
}: {
  type: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {Icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 rounded-lg outline-none"
        required
        {...rest}
      />
    </div>
  );
};

export default InputField;
