import React from "react";
import "./SlideMenubar.css";
import { FiUser } from "react-icons/fi";
import { CircleIconBox, SquareIconBox } from "../ui/IconBackground";

const Sidebar = () => {
    return (
        <aside className="sidebar">
            {/* Logo Box */}
            <div className="sidebar-logo">
                <SquareIconBox
                    className={"icon-box-40 backround-color-A9B5DF"}
                ></SquareIconBox>
            </div>

            {/* Menu Icons */}
            <div className="sidebar-menu ">
                <SquareIconBox
                    className={"icon-box-35 backround-color-A9B5DF-20"}
                ></SquareIconBox>
                <SquareIconBox
                    className={"icon-box-35 backround-color-A9B5DF-20"}
                ></SquareIconBox>
                <SquareIconBox
                    className={"icon-box-35 backround-color-A9B5DF-20"}
                ></SquareIconBox>
                <SquareIconBox
                    className={"icon-box-35 backround-color-A9B5DF-20"}
                ></SquareIconBox>
                <SquareIconBox
                    className={"icon-box-35 backround-color-A9B5DF-20"}
                ></SquareIconBox>
                <SquareIconBox
                    className={"icon-box-35 backround-color-A9B5DF-20"}
                ></SquareIconBox>
                <SquareIconBox
                    className={"icon-box-35 backround-color-A9B5DF-20"}
                ></SquareIconBox>
            </div>

            {/* Bottom User */}
            <div className="sidebar-user">
                <CircleIconBox
                    className={"icon-box-40 backround-color-A9B5DF-30"}
                    children={<FiUser size={18} />}
                ></CircleIconBox>
            </div>
        </aside>
    );
};

export default Sidebar;
