import { useEffect, useRef } from "react";
import clsx from "clsx";
import ReactDOM from "react-dom";

export const Modal = ({ children, setOpen, className, ...props }) => {
    const modalRef = useRef(null);
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    let modalContent = (
        <div className="modal-overlay">
            <div ref={modalRef} className={clsx("modal-content", className)}>
                {children}
            </div>
        </div>
    );
    return ReactDOM.createPortal(modalContent, document.body);
};
