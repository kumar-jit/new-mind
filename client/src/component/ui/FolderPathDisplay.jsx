import clsx from "clsx";
import { MdArrowForwardIos } from "react-icons/md";

export const FolderPathDisplay = ({ className, ref, paths = [] }) => {
    return (
        <div
            ref={ref}
            className={clsx("flex justify-around items-center", className)}
        >
            {paths.map((path, index) => (
                <span key={index}>
                    {path} {index < paths.length - 1 && <MdArrowForwardIos />}
                </span>
            ))}
        </div>
    );
};
