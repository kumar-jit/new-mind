import { clsx } from "clsx";

export const ShortThumbIcon = ({ children, className, ref, ...props }) => {
    return (
        <span
            ref={ref}
            className={clsx("flex items-center justify-center", className)}
            {...props}
        >
            {children}
        </span>
    );
};

export const ShortThumbSubHead = ({ children, className, ref, ...props }) => {
    return (
        <span
            ref={ref}
            className={clsx("text-xl font-normal", className)}
            {...props}
        >
            {children}
        </span>
    );
};

export const ShortThumbHead = ({ children, className, ref, ...props }) => {
    return (
        <span
            ref={ref}
            className={clsx("text-2xl font-semibold", className)}
            {...props}
        >
            {children}
        </span>
    );
};

export const ShortThumbnail = ({
    children,
    className,
    ref,
    icon,
    head,
    subhead,
}) => {
    return (
        <div
            ref={ref}
            className={clsx("flex flex-col items-center ", className)}
        >
            <ShortThumbIcon className={"margine-bottom-2"}>
                {icon}
            </ShortThumbIcon>
            <ShortThumbSubHead className={"margine-bottom-0125"}>
                {subhead}
            </ShortThumbSubHead>
            <ShortThumbHead>{head}</ShortThumbHead>
        </div>
    );
};
