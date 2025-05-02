import clsx from "clsx";

export const SquareIconBox = ({ className, children, ref, ...props }) => {
    return (
        <div
            ref={ref}
            className={clsx(
                "flex items-center justify-center rounded-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CircleIconBox = ({ className, children, ref, ...props }) => {
    return (
        <div
            ref={ref}
            className={clsx(
                "flex items-center justify-center rounded-full",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
