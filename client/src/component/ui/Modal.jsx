import { useEffect, useRef } from "react";
import clsx from "clsx";
import ReactDOM from "react-dom";

export const Modal = ({ children, setOpen, className, ...props }) => {
  const modalRef = useRef(null);

  // Close modal on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (modalRef.current && !modalRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [setOpen]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  let modalContent =  (
    <div className="modal-overlay">
      <div
        ref={modalRef}
        className={clsx(
          "modal-content",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};
