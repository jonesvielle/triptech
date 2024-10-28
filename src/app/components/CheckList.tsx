import React from "react";
import { IoCheckmark, IoCheckmarkSharp } from "react-icons/io5";
import { robotoFontBodyLight } from "../helpers/fonts";
import SlideUpComponent from "./SlideUpComponent";

interface CheckListProps {
  data: string[];
  containerStyle: React.CSSProperties | undefined;
  itemStyle: React.CSSProperties | undefined;
  itemContainerStyle: React.CSSProperties | undefined;
}

const CheckList = ({
  data = [],
  containerStyle,
  itemStyle,
  itemContainerStyle,
}: CheckListProps) => {
  return (
    <div style={containerStyle}>
      {data.length > 0 &&
        data.map((c, i) => (
          <SlideUpComponent>
            <div style={itemContainerStyle} key={i} className="flex flex-row">
              <IoCheckmarkSharp
                style={{ fontWeight: "bold" }}
                size={30}
                color={"green"}
              />
              <div
                style={itemStyle}
                className={`${robotoFontBodyLight.className} ml-2 md:text-[20px] text-[15px]`}
              >
                {c}
              </div>
            </div>
          </SlideUpComponent>
        ))}
    </div>
  );
};

export default CheckList;
