import React, { HTMLInputTypeAttribute, ReactNode } from "react";
// import { IconType } from "react-icons";
// import {
//   IoCalendar,
//   IoCalendarClearOutline,
//   IoCalendarOutline,
// } from "react-icons/io5";

interface DateInputComponentProps {
  label: string;
  type?: HTMLInputTypeAttribute | undefined;
  placeholder: string;
  inputColor?: string;
  Icon?: ReactNode;
  value: string;
}
{
  /* <IoCalendar className="mr-2 text-[30px] text-primary-gray" />; */
}
const DateInputComponent = ({
  label,
  placeholder,
  inputColor,
}: DateInputComponentProps) => {
  return (
    <>
      <label className="text-black font-bold">{label}</label>
      <div className="border-[1.5px] flex flex-row items-center px-3 py-3 rounded-md mt-2">
        {Icon && <div className="mr-2">{Icon}</div>}
        <input
          disabled
          className=" outline-none rounded-lg bg-white  w-full md:w-full text-primary-gray mt-1"
          placeholder={placeholder}
          color={inputColor}
        />
      </div>
    </>
  );
};

export default DateInputComponent;
