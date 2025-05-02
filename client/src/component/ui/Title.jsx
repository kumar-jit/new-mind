import clsx from "clsx";

export const TitleH1 = ({ children, className }) => {
    return (
        <span className={clsx("text-4xl font-semibold", className)}>
            {children}
        </span>
    );
};

export const TitleH2 = ({ children, className }) => {
    return (
        <span className={clsx("text-3xl font-semibold", className)}>
            {children}
        </span>
    );
};
export const TitleH3 = ({ children, className }) => {
    return (
        <span className={clsx("text-2xl font-semibold", className)}>
            {children}
        </span>
    );
};
export const TitleH4 = ({ children, className }) => {
    return (
        <span className={clsx("text-1x025 font-semibold", className)}>
            {children}
        </span>
    );
};
export const TitleH5 = ({ children, className }) => {
    return (
        <span className={clsx("text-1x02 font-semibold", className)}>
            {children}
        </span>
    );
};
export const TitleH6 = ({ children, className }) => {
    return (
        <span className={clsx("text-1x01 font-semibold", className)}>
            {children}
        </span>
    );
};
export const TitleH7 = ({ children, className }) => {
    return (
        <span className={clsx("text-xl font-semibold", className)}>
            {children}
        </span>
    );
};
