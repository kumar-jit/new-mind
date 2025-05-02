import clsx from "clsx";

export const Button = ({ className, children, ref, style, ...props }) => {
    return (
        <button
            ref={ref}
            className={clsx("btn", className)}
            style={{ ...style }}
            {...props}
        >
            {children}
        </button>
    );
};

export const ButtonPrimary = ({ className, children, ref, style, ...props }) => {
    return (
        <button
            ref={ref}
            className={clsx("btn btn-primary", className)}
            style={{ ...style }}
            {...props}
        >
            {children}
        </button>
    );
};
export const ButtonSecondary = ({ className, children, ref, style }) => {
    return (
        <button
            ref={ref}
            className={clsx("btn btn-secondary", className)}
            style={{ ...style }}
        >
            {children}
        </button>
    );
};

export const ButtonCircle = ({ className, children, ref, style, ...props }) => {
    return (
        <button
            ref={ref}
            className={clsx("btn btn-circle", className)}
            style={{ ...style }}
            {...props}
        >
            {children}
        </button>
    );
};
