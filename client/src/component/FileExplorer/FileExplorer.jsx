
import clsx from "clsx";
import FileExploreHead from "./FileExploreHead";
import { connect } from "react-redux";
import { useEffect } from "react";
import FileExploreBody from "./FileExploreBody";
import { fetchRootFolderData } from "../../redux/slices/FilesAndFoldersSlice";

const FileExplore = ({
    className,
    ref,
    fileExploreWitdh,
    loadRootFolder,
    treeData,
    rootFolderInfo,
}) => {
    useEffect(() => {
        loadRootFolder({ path: "/root", top: 0, skip: 0 });
    }, [loadRootFolder]);

    return (
        <div
            ref={ref}
            className={clsx("flex flex-col", className)}
            style={{
                width: `${fileExploreWitdh}px`,
            }}
        >
            <div style={{ height: "var(--flhvh)", width: "100%" }}>
                <FileExploreHead />
            </div>

            <div
                style={{
                    height: "var(--flcvh)",
                    width: "100%",
                    backgroundColor: "#e2ecf8",
                }}
            >
                <FileExploreBody treeData={treeData} />
            </div>
        </div>
    );
};

// Mapping redux state to component props
const mapStateToProps = (state) => {
    const rootId = state.dirItemsReducers.rootFolderId;

    return {
        fileExploreWitdh: state.layoutReducer.fileExploreWitdh,
        rootFolderInfo: rootId
            ? state.dirItemsReducers.folderEntities[rootId]
            : null,
        treeData: rootId
            ? (
                  state.dirItemsReducers.folderEntities[rootId]?.children || []
              ).map((childId) => state.dirItemsReducers.folderEntities[childId])
            : [],
    };
};

// Mapping redux dispatch actions to component props
const mapDispatchToProps = (dispatch) => ({
    loadRootFolder: (args) => dispatch(fetchRootFolderData(args)),
});

// Connecting component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(FileExplore);
