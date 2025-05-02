// React and utility imports
import { useEffect, useState } from "react";
import { convertDate } from "../../utils/dateConveter";
import clsx from "clsx";
import { connect } from "react-redux";

// Redux actions
import {
    createNewFolder,
    deleteFile,
    deleteFolder,
    fetchFolderById,
    toggleFolderExpand,
    updateFileName,
    updateFolderDetails,
} from "../../redux/slices/FilesAndFoldersSlice";

// UI components and icons
import { Button } from "./Button";
import {
    FaCaretDown,
    FaCaretRight,
    FaFolderPlus,
    FaRegFile,
    FaRegFolder,
} from "react-icons/fa";
import { ActionMenu } from "./Menu";
import { ImFolderUpload } from "react-icons/im";
import { MdDelete, MdEdit } from "react-icons/md";
import CreateFolder from "../FileExplorer/Forms/CreateFolderForm";
import ConfirmationForm from "../FileExplorer/Forms/ConfiramtionForm";
import { FileViewModal } from "./FileViewModal";
import UploadFile from "../FileExplorer/Forms/UploadFilesForms";
import axios from "axios";

// Main Tree Row component
export const TreeRowComponent = ({
    node, // current file/folder node
    level = 0, // tree level depth
    toggleExpand, // toggles folder open/closed
    fetchFolderData, // fetch children for a folder
    checkExpanded, // check if folder is expanded
    children, // children nodes
    createNewFolder,
    updateFolderDetails,
    updateFileName,
    deleteFolder,
    deleteFile,
}) => {
    // Local UI state
    const [expanded, setExpanded] = useState(checkExpanded || false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [createFormOpen, setCreateFormOpen] = useState(false);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [deleteFormOpen, setDeleteFormOpen] = useState(false);
    const [editFileFormOpen, setEditeFileOpen] = useState(false);
    const [deletFileFormOpen, setDeleteFileFormOpen] = useState(false);
    const [viewFile, setViewFile] = useState(false);
    const [uploadFile, setUploadFile] = useState(false);

    // Folder-specific action menu
    const actionMenusForFolder = [
        {
            label: "Edit",
            icon: <MdEdit size={15} />,
            onClick: () => {
                setIsMenuOpen(false);
                setEditFormOpen(true);
            },
        },
        {
            label: "Delete",
            icon: <MdDelete size={15} />,
            onClick: () => {
                setIsMenuOpen(false);
                setDeleteFormOpen(true);
            },
        },
        {
            label: "Create Folder",
            icon: <FaFolderPlus size={15} />,
            onClick: () => {
                setIsMenuOpen(false);
                setCreateFormOpen(true);
            },
        },
        {
            label: "Upload Document",
            icon: <ImFolderUpload size={15} />,
            onClick: () => {
                setIsMenuOpen(false);
                setUploadFile(true);
            },
        },
    ];

    // File-specific action menu
    const actionMenusForFile = [
        {
            label: "Edit",
            icon: <MdEdit size={15} />,
            onClick: () => {
                setIsMenuOpen(false);
                setEditeFileOpen(true);
            },
        },
        {
            label: "Delete",
            icon: <MdDelete size={15} />,
            onClick: () => {
                setIsMenuOpen(false);
                setDeleteFileFormOpen(true);
            },
        },
    ];

    // Create new subfolder
    const onSubFolderCreation = (formRef) => {
        if (formRef.current) {
            const formData = new FormData(formRef.current);
            const folderName = formData.get("folderName");
            const folderDesc = formData.get("folderDesc");
            createNewFolder({
                name: folderName,
                parentId: node._id,
                description: folderDesc,
            });
        }
    };

    // Update existing folder
    const onFolderUpdate = (formRef) => {
        if (formRef.current) {
            const formData = new FormData(formRef.current);
            const folderName = formData.get("folderName");
            const folderDesc = formData.get("folderDesc");
            updateFolderDetails({
                name: folderName,
                folderId: node._id,
                description: folderDesc,
            });
        }
    };

    // Delete folder
    const onFolderDelete = () => {
        deleteFolder({ folderId: node._id });
        setDeleteFormOpen(false);
    };

    // Update file name
    const onFileNameUpdate = (formRef) => {
        if (formRef.current) {
            const formData = new FormData(formRef.current);
            const folderName = formData.get("fileName");
            updateFileName({
                newName: folderName,
                fileId: node._id,
            });
        }
    };

    // Delete file
    const onFileDelete = () => {
        deleteFile({ fileId: node._id });
        setDeleteFileFormOpen(false);
    };

    // Upload file(s) to folder
    const onFileUpload = async (formRef, clientId = "1234") => {
        if (!formRef.current) return;

        const formElement = formRef.current;
        const formData = new FormData();
        const fileInput = formElement.querySelector('input[name="fileUpload"]');
        const files = fileInput.files;

        if (!files.length) {
            alert("Please select at least one file.");
            return;
        }

        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        formData.append("folderId", node._id);
        formData.append("clientId", clientId);

        const hostUrl =
            import.meta.env.VITE_HOST_URL || "http://localhost:8000";

        try {
            const response = await axios.post(
                `${hostUrl}/api/v1/file/upload?`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            console.log(response);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload file(s).");
        }
    };

    // Sync local expanded state with Redux
    useEffect(() => {
        setExpanded(checkExpanded || false);
    }, [checkExpanded]);

    // Fetch folder contents on mount
    useEffect(() => {
        fetchFolderData(node._id);
    }, []);

    return (
        <>
            {/* Modal components */}
            {createFormOpen && (
                <CreateFolder
                    isOponed={createFormOpen}
                    setIsOpened={setCreateFormOpen}
                    onCreate={onSubFolderCreation}
                />
            )}

            {editFormOpen && (
                <CreateFolder
                    isOponed={editFormOpen}
                    setIsOpened={setEditFormOpen}
                    onCreate={onFolderUpdate}
                    editFormDefaultData={{
                        folderName: node.name,
                        folderDesc: node.description,
                    }}
                />
            )}

            {deleteFormOpen && (
                <ConfirmationForm
                    isOponed={deleteFormOpen}
                    setIsOpened={setDeleteFormOpen}
                    title="Delete Folder"
                    msg={`All subfolders and files under "${node.name}" will be deleted. Are you sure ?`}
                    confirmBtn={{ onClick: onFolderDelete }}
                />
            )}

            {editFileFormOpen && (
                <CreateFolder
                    isOponed={editFileFormOpen}
                    setIsOpened={setEditeFileOpen}
                    onCreate={onFileNameUpdate}
                    editFileDefaultData={{ fileName: node.name }}
                />
            )}

            {deletFileFormOpen && (
                <ConfirmationForm
                    isOponed={deletFileFormOpen}
                    setIsOpened={setDeleteFileFormOpen}
                    title="Delete File"
                    msg={`Are you want to delete the file "${node.name}" ?`}
                    confirmBtn={{ onClick: onFileDelete }}
                />
            )}

            {uploadFile && (
                <UploadFile
                    isOponed={uploadFile}
                    setIsOpened={setUploadFile}
                    title="Upload File"
                    confirmBtn={{ onClick: onFileUpload }}
                />
            )}

            {viewFile && node.type !== "folder" && (
                <FileViewModal
                    isOpen={viewFile}
                    onClose={() => setViewFile(false)}
                    fileId={node._id}
                />
            )}

            {/* Table row for file/folder */}
            <tr
                className={clsx(
                    `${expanded && level == 0 ? "backround-color-expand" : ""}`,
                    level === 0 ? "tree-row-spacing" : ""
                )}
                style={{ boxSizing: "border-box" }}
            >
                <td
                    align="center"
                    className={clsx(
                        "td-tree-row td-tree-padding",
                        level > 0 ? "td-row-border" : ""
                    )}
                    style={{ paddingLeft: `${level * 20}px` }}
                >
                    <div className="flex justify-space-between">
                        {node.type === "folder" ? (
                            <Button onClick={() => toggleExpand(node._id)}>
                                {expanded ? (
                                    <FaCaretDown size={15} />
                                ) : (
                                    <FaCaretRight size={15} />
                                )}
                            </Button>
                        ) : (
                            <Button disabled />
                        )}
                        <div
                            className="flex justify-around"
                            style={{ width: "80%" }}
                            onClick={() =>
                                node.type !== "folder" && setViewFile(true)
                            }
                        >
                            {node.type === "folder" ? (
                                <FaRegFolder size={15} />
                            ) : (
                                <FaRegFile size={15} />
                            )}
                            {node.name}{node.type == "file" && node.extenstion && `.${node.extenstion}`}
                        </div>
                    </div>
                </td>
                <td
                    align="center"
                    className={clsx(
                        "td-tree-row td-tree-padding",
                        level > 0 ? "td-row-border" : ""
                    )}
                >
                    {node.description}
                </td>
                <td
                    align="center"
                    className={clsx(
                        "td-tree-row td-tree-padding",
                        level > 0 ? "td-row-border" : ""
                    )}
                >
                    {convertDate(node.createdAt, "24")}
                </td>
                <td
                    align="center"
                    className={clsx(
                        "td-tree-row td-tree-padding",
                        level > 0 ? "td-row-border" : ""
                    )}
                >
                    {convertDate(node.updatedAt, "24")}
                </td>
                <td
                    align="center"
                    className={clsx(
                        "td-tree-row td-border-radius-right-top td-border-radius-right-bottom td-tree-padding",
                        level > 0 ? "td-row-border" : ""
                    )}
                >
                    <Button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        ⋮
                    </Button>
                    {isMenuOpen && (
                        <ActionMenu
                            items={
                                node.type === "folder"
                                    ? actionMenusForFolder
                                    : actionMenusForFile
                            }
                            position="left"
                            setOpen={setIsMenuOpen}
                        />
                    )}
                </td>
            </tr>

            {/* Render children recursively */}
            {expanded &&
                children?.map((child) => (
                    <ConnectedTreeRow
                        key={child._id}
                        node={child}
                        level={level + 1}
                    />
                ))}
        </>
    );
};

// Redux state mapping
const mapStateToProps = (state, ownProps) => {
    const { node } = ownProps;
    return {
        checkExpanded: state.dirItemsReducers.expandedFolders[node._id],
        children: state.dirItemsReducers.folderData[node._id] || [],
    };
};

// Redux action mapping
const mapDispatchToProps = (dispatch) => ({
    toggleExpand: (folderId) => dispatch(toggleFolderExpand(folderId)),
    fetchFolderData: (folderId) => dispatch(fetchFolderById(folderId)),
    createNewFolder: (args) => dispatch(createNewFolder(args)),
    updateFolderDetails: (arg) => dispatch(updateFolderDetails(arg)),
    updateFileName: (arg) => dispatch(updateFileName(arg)),
    deleteFolder: (arg) => dispatch(deleteFolder(arg)),
    deleteFile: (arg) => dispatch(deleteFile(arg)),
});

// Connect component to Redux
const ConnectedTreeRow = connect(
    mapStateToProps,
    mapDispatchToProps
)(TreeRowComponent);

export default ConnectedTreeRow;
