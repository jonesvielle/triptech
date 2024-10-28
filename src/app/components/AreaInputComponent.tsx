// @ts-nocheck

import React, { InputHTMLAttributes, ReactNode } from "react";
// import { IconType } from "react-icons";
// import {
//   IoCalendar,
//   IoCalendarClearOutline,
//   IoCalendarOutline,
// } from "react-icons/io5";

interface AreaInputComponentProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder: string;
  inputColor?: string;
  Icon?: ReactNode;
  required?: boolean;
}
const AreaInputComponent = ({
  label,
  placeholder,
  inputColor,
  Icon,
  required = false,
  ...rest
}: AreaInputComponentProps) => {
  return (
    <>
      <label className="text-black font-bold">{label}</label>
      <div className="border-[1.5px] flex flex-row items-center px-3 py-3 rounded-md mt-2">
        {Icon && <div className="mr-2">{Icon}</div>}
        <textarea
          required={required}
          rows={5}
          className=" outline-none rounded-lg  w-full md:w-full text-primary-dark mt-1"
          //   type={type}
          placeholder={placeholder}
          color={inputColor}
          {...rest}
        />
      </div>
    </>
  );
};

export default AreaInputComponent;
