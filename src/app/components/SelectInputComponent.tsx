import React, {
  DetailedHTMLProps,
  HTMLInputTypeAttribute,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

interface SelectInputComponentProps
  extends DetailedHTMLProps<
    SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  > {
  label: string;
  type?: HTMLInputTypeAttribute | undefined;
  placeholder: string;
  inputColor?: string;
  Icon?: ReactNode;
  name: string;
  required?: boolean;
}
{
  /* <IoCalendar className="mr-2 text-[30px] text-primary-gray" />; */
}
const SelectInputComponent = ({
  required = false,
  label,
  placeholder,
  inputColor,
  Icon,
  name,
  ...rest
}: SelectInputComponentProps) => {
  return (
    <>
      <label className="text-black font-bold">{label}</label>
      <div className="border-[1.5px] flex flex-row items-center px-3 py-3 rounded-md mt-2">
        {Icon && <div className="mr-2">{Icon}</div>}
        <select
          required={required}
          name={name}
          {...rest}
          className="outline-none rounded-lg  w-full md:w-full text-black mt-1"
          color={inputColor}
        >
          <option value={""} disabled>
            {placeholder}
          </option>
          <option value={"Solar Installation"}>Solar Installation</option>
          <option value={"CCTV Installation"}>CCTV installation</option>
          <option value={"3D Printing Services"}>3D Printing Service</option>
        </select>
        {/* <IoChevronDown className="text-primary-gray text-[20px]" /> */}
      </div>
    </>
  );
};

export default SelectInputComponent;
