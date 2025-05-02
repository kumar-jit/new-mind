import { useEffect, useState } from "react";
import { convertDate } from "../../utils/dateConveter";
import clsx from "clsx";
import { connect } from "react-redux";
import {
    createNewFolder,
    deleteFile,
    deleteFolder,
    fetchFolderById,
    toggleFolderExpand,
    updateFileName,
    updateFolderDetails,
} from "../../redux/slices/FilesAndFoldersSlice";
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

export const TreeRowComponent = ({
    node,
    level = 0,
    toggleExpand,
    fetchFolderData,
    checkExpanded,
    children,
    createNewFolder,
    updateFolderDetails,
    updateFileName,
    deleteFolder,
    deleteFile
}) => {
    const [expanded, setExpanded] = useState(checkExpanded || false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu open/close

    const [createFormOpen, setCreateFormOpen] = useState(false); //create folder menu

    const [editFormOpen, setEditFormOpen] = useState(false); // update folder menu

    const [deleteFormOpen, setDeleteFormOpen] = useState(false); // detele form menu control

    const [editFileFormOpen, setEditeFileOpen] = useState(false);   // edite file name control

    const [deletFileFormOpen, setDeleteFileFormOpen] = useState(false);     // delete file control

    const [viewFile, setViewFile] = useState(false);     // delete file control

    const [uploadFile, setUploadFile] = useState(false);     // delete file control

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

    // on folder creation
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

    // on folder update
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

    // on folder delte
    const onFolderDelete = () => {
        deleteFolder({folderId: node._id});
        setDeleteFormOpen(false)
    };

    // on folder update
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

     // on file delte
     const onFileDelete = () => {
        deleteFile({fileId: node._id});
        setDeleteFileFormOpen(false)
    };

    // on file upload
    const onFileUpload = async (formRef, clientId="1234") => {
        if (!formRef.current) return;
    
        const formElement = formRef.current;
        const formData = new FormData();
    
        // Append all selected files
        const fileInput = formElement.querySelector('input[name="fileUpload"]');
        const files = fileInput.files;
    
        if (!files.length) {
            alert("Please select at least one file.");
            return;
        }
    
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]); 
        }
        // Add folderId and clientId to form data
        formData.append("folderId", node._id);
        formData.append("clientId", clientId); 
        const hostUrl = import.meta.env.VITE_HOST_URL || "http://localhost:8000";
        try {
            const response = await axios.post(`${hostUrl}/api/v1/file/upload?`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            console.log(response);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload file(s).");
        }
    };


    useEffect(() => {
        setExpanded(checkExpanded || false);
    }, [checkExpanded]);

    useEffect(() => {
        fetchFolderData(node._id); // Fetch folder data when the component mounts
    }, []);
    return (
        <>
            {/* create form modal  */}
            {createFormOpen && (
                <CreateFolder
                    isOponed={createFormOpen}
                    setIsOpened={setCreateFormOpen}
                    onCreate={onSubFolderCreation}
                ></CreateFolder>
            )}

            {/* edite form modal  for folder */}
            {editFormOpen && (
                <CreateFolder
                    isOponed={editFormOpen}
                    setIsOpened={setEditFormOpen}
                    onCreate={onFolderUpdate}
                    editFormDefaultData={{
                        folderName: node.name,
                        folderDesc: node.description,
                    }}
                ></CreateFolder>
            )}

            {/* Delete form modal  for folder */}
            {deleteFormOpen && (
                <ConfirmationForm
                    isOponed={deleteFormOpen}
                    setIsOpened={setDeleteFormOpen}
                    title={"Delete Folder"}
                    msg={`All subfolders and files under "${node.name}" will be deleted. Are you sure ?`}
                    confirmBtn={{onClick: onFolderDelete}}
                ></ConfirmationForm>
            )}

            {/* edite form modal for file  */}
            {editFileFormOpen && (
                <CreateFolder
                    isOponed={editFileFormOpen}
                    setIsOpened={setEditeFileOpen}
                    onCreate={onFileNameUpdate}
                    editFileDefaultData={{
                        fileName: node.name,
                    }}
                ></CreateFolder>
            )}

            {/* Delte form modal  for file */}
            {deletFileFormOpen && (
                <ConfirmationForm
                    isOponed={deletFileFormOpen}
                    setIsOpened={setDeleteFileFormOpen}
                    title={"Delete File"}
                    msg={`Are you want to delete the file "${node.name}" ?`}
                    confirmBtn={{onClick: onFileDelete}}
                ></ConfirmationForm>
            )}

            {/* upload file */}
            {uploadFile && (
                <UploadFile
                    isOponed={uploadFile}
                    setIsOpened={setUploadFile}
                    title={"Upload File"}
                    confirmBtn={{onClick: onFileUpload}}
                ></UploadFile>
            )}

            {/* view file modal */}
            {viewFile && node.type != "folder" && <FileViewModal isOpen={viewFile} onClose={() => setViewFile(false)} fileId={node._id}></FileViewModal>}
            <tr
                className={clsx(
                    `${expanded && level == 0 ? "backround-color-expand" : ""}`,
                    level === 0 ? "tree-row-spacing" : ""
                )}
                style={{ boxsizing: "border-box" }}
                
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
                        {node.type == "folder" ? (
                            <Button onClick={() => toggleExpand(node._id)}>
                                {" "}
                                {expanded ? (
                                    <FaCaretDown size={15} />
                                ) : (
                                    <FaCaretRight size={15} />
                                )}{" "}
                            </Button>
                        ) : (
                            <Button disabled> </Button>
                        )}

                        <div
                            className={clsx("flex justify-around")}
                            style={{ width: "80%" }}
                            onClick={() => {
                                if(node.type != "folder")
                                    setViewFile(true)
                            }}
                        >
                            {node.type == "folder" ? (
                                <FaRegFolder size={15} />
                            ) : (
                                <FaRegFile size={15} />
                            )}
                            {node.name}

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
                                node.type == "folder"
                                    ? actionMenusForFolder
                                    : actionMenusForFile
                            }
                            position="left"
                            setOpen={setIsMenuOpen}
                        ></ActionMenu>
                    )}
                </td>
            </tr>

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

const mapStateToProps = (state, ownProps) => {
    const { node } = ownProps;
    return {
        checkExpanded: state.dirItemsReducers.expandedFolders[node._id],
        children: state.dirItemsReducers.folderData[node._id] || [],
    };
};

const mapDispatchToProps = (dispatch) => ({
    toggleExpand: (folderId) => dispatch(toggleFolderExpand(folderId)),
    fetchFolderData: (folderId) => dispatch(fetchFolderById(folderId)),
    createNewFolder: (args) => dispatch(createNewFolder(args)),
    updateFolderDetails: (arg) => dispatch(updateFolderDetails(arg)),
    updateFileName: (arg) => dispatch(updateFileName(arg)),
    deleteFolder: (arg) => dispatch(deleteFolder(arg)),
    deleteFile: (arg) => dispatch(deleteFile(arg))
});

const ConnectedTreeRow = connect(
    mapStateToProps,
    mapDispatchToProps
)(TreeRowComponent);

export default ConnectedTreeRow;
