import React, {
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { IconType } from "react-icons";
import {
  IoCalendar,
  IoCalendarClearOutline,
  IoCalendarOutline,
} from "react-icons/io5";

interface InputComponentProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  type?: HTMLInputTypeAttribute | undefined;
  placeholder: string;
  inputColor?: string;
  Icon?: ReactNode;
  required?: boolean;
  name?: string;
}
{
  /* <IoCalendar className="mr-2 text-[30px] text-primary-gray" />; */
}
const InputComponent = ({
  label,
  type,
  placeholder,
  inputColor,
  Icon,
  required = false,
  name = "",
  ...rest
}: InputComponentProps) => {
  return (
    <>
      <label className="text-black font-bold">{label}</label>
      <div className="border-[1.5px] flex flex-row items-center px-3 py-3 rounded-md mt-2">
        {Icon && <div className="mr-2">{Icon}</div>}
        <input
          required={required}
          className=" outline-none rounded-lg  w-full md:w-full text-primary-dark mt-1"
          type={type}
          placeholder={placeholder}
          name={name}
          {...rest}
        />
      </div>
    </>
  );
};

export default InputComponent;
