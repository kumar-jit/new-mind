import { useRef } from "react";

export const FormCard = ({
    className = "",
    title = "form title",
    clearBtn = {
        label: "Clear",
        onClick: () => {},
        show: false,
    },
    cancelBtn = {
        label: "Cancel",
        onClick: () => {},
        show: true,
    },
    applyBtn = {
        label: "Apply",
        onClick: () => {},
        show: true,
    },
    children,
    ref,
    errorMsg = {
        show: false,
        msg: "",
    },
    ...props
}) => {
    const formCardRef = useRef(null);
    return (
        <div ref={ref} className={`form-card ${className}`} {...props}>
            {/* Header */}
            <div className="form-card-header">
                <h2 className="form-title">{title}</h2>
                {clearBtn.show && (
                    <button className="form-clear" onClick={clearBtn.onClick}>
                        {clearBtn.label}
                    </button>
                )}
            </div>

            {/* Form content */}
            <form className="form-form-content" ref={formCardRef}>
                {children}
            </form>
            {errorMsg.show && (
                <span className="form-form-error-content"> {errorMsg.msg}</span>
            )}

            {/* Footer buttons */}
            <div className="form-actions">
                {cancelBtn.show && (
                    <button
                        className="form-btn form-btn-cancel"
                        onClick={cancelBtn.onClick}
                    >
                        {cancelBtn.label}
                    </button>
                )}
                {applyBtn.show && (
                    <button
                        className="form-btn form-btn-apply"
                        onClick={() => applyBtn.onClick(formCardRef)}
                    >
                        {applyBtn.label}
                    </button>
                )}
            </div>
        </div>
    );
};
