import clsx from "clsx";
import { ShortThumbIcon, ShortThumbSubHead } from "./ThumbNail";
import { FaRegFolder, FaRegFile } from "react-icons/fa";

import { connect } from "react-redux"; // Import connect
import {
    fetchFolderById,
    toggleFolderExpand,
} from "../../redux/slices/FilesAndFoldersSlice";
import { use, useEffect } from "react";

const FolderItemShort = ({
    folderName,
    type = "folder",
    className,
    ref,
    level = 0,
    isExpanded = false, // New prop to control expand/collapse state
    children = [],
    folderId,
    toggleExpand,
    fetchFolderData,
    expandedFolders = {}, // Get expanded folders from props
}) => {
    const isFolder = type === "folder";

    useEffect(() => {
        fetchFolderData(folderId);
    }, [folderId]); // Fetch data when isExpanded changes

    return (
        <div
            ref={ref}
            className={clsx(
                "flex justify-space-between border-buttom border-color",
                className
            )}
            style={{
                marginLeft: `${level * 5}px`,
                padding: "10px 0px",
                boxSizing: "border-box",
            }}
        >
            <div className="flex justify-start gap-2 items-center">
                <ShortThumbIcon>
                    {isFolder ? (
                        <FaRegFolder size={20} />
                    ) : (
                        <FaRegFile size={18} />
                    )}
                </ShortThumbIcon>
                <ShortThumbSubHead>{folderName}</ShortThumbSubHead>
            </div>

            {/* Only show "+" button for folders */}
            {isFolder && !isExpanded && (
                <button onClick={() => toggleExpand(folderId)}> + </button>
            )}
            {isExpanded && (
                <div style={{ marginLeft: "20px" }}>
                    {/* Render children if folder is expanded */}
                    {children.map((child) => {
                        const isExpanded = expandedFolders[child._id];
                        return (
                            <FolderItemShort
                                key={child._id}
                                folderName={child.name}
                                type={child.type}
                                level={level + 1} // Indentation for children
                                folderId={child._id} // Pass folderId to child component
                                isExpanded={isExpanded} // Pass expand state to child component
                                toggleExpand={toggleExpand} // Pass toggle function to child component
                                fetchFolderData={fetchFolderData} // Fetch data when isExpanded changes
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Update to get children from state for rendering
const mapStateToProps = (state, ownProps) => {
    const { folderId } = ownProps;
    const folderData = state.dirItemsReducers.folderData[folderId] || [];
    return {
        children: folderData,
        expandedFolders: state.dirItemsReducers.expandedFolders,
    };
};

const mapDispatchToProps = (dispatch) => ({
    toggleExpand: (folderId) => dispatch(toggleFolderExpand(folderId)), // Dispatch to toggle expand
    fetchFolderData: (folderId) => dispatch(fetchFolderById(folderId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FolderItemShort);
