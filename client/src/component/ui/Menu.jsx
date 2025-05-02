import React, { useEffect, useRef } from "react";


export const ActionMenu = ({
  items = [],
  className = "",
  position = "bottom", // "left" | "bottom"
  setOpen
}) => {

    const menuRef = useRef(null);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && setOpen) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  return (
    <div
      className={`action-menu-container ${
        position === "left" ? "menu-left" : "menu-bottom"
      } ${className}`}
      ref={menuRef}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="action-menu-item"
          onClick={ item?.onClick}
        >
          <span className="action-menu-icon">{item.icon}</span>
          <span className="action-menu-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
