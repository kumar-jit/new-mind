import { FaRegFile, FaRegFolder } from "react-icons/fa";
import { ShortThumbnail } from "../ui/ThumbNail";
import { TitleH5 } from "../ui/Title";
import VerticalLine from "../ui/VerticalLine";
import clsx from "clsx";

export const TotalFoldersFilesInfo = ({
    totalFiles,
    totalFolders,
    className,
}) => {
    return (
        <div
            className={clsx(className)}
            style={{ padding: "10px 20px", boxSizing: "border-box" }}
        >
            <div className="margine-bottom-4">
                <TitleH5>Folders & Documents</TitleH5>
            </div>

            <div className="flex ">
                <ShortThumbnail
                    icon={<FaRegFolder size={25} />}
                    head={totalFolders + "+"}
                    subhead={"Folders"}
                ></ShortThumbnail>
                <VerticalLine size="45px"></VerticalLine>
                <ShortThumbnail
                    icon={<FaRegFile size={25} />}
                    head={totalFiles + "+"}
                    subhead={"Documents"}
                ></ShortThumbnail>
            </div>
        </div>
    );
};
