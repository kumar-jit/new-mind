import clsx from "clsx";
import { ButtonPrimary } from "../ui/Button";
import { FolderPathDisplay } from "../ui/FolderPathDisplay";
import { FaFilter, FaFolderPlus } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { useState } from "react";
import { ActionMenu } from "../ui/Menu";
import { ImFolderUpload } from "react-icons/im";
import FilterForm from "./Forms/FilterForm";
import CreateFolder from "./Forms/CreateFolderForm";
import { createNewFolder } from "../../redux/slices/FilesAndFoldersSlice";
import { connect } from "react-redux";

export const FileExploreHead = ({ className, children, ref, rootFolderInfo, createNewFolder }) => {
    const [mneuOpen, setMenuOpen] = useState(false);
    const [filterIsOpen, setFilterIsOpen] = useState(false);
    const [createFormOpen, setCreateFormOpen] = useState(false);

    const onFolderCreateUnderRoot = (formRef) => {
        if(formRef.current){
            const formData = new FormData(formRef.current);
            const folderName = formData.get("folderName");
            const folderDesc = formData.get("folderDesc");
            createNewFolder({ name: folderName, parentId: rootFolderInfo._id, description : folderDesc });
        }
        // createNewFolder({ folderName, parentId: rootFolderInfo._id });
    }

    const menus = [
        {
            label: "Add Folder",
            icon: <FaFolderPlus size={15} />,
            onClick: () => {
                setMenuOpen(false);
                setCreateFormOpen(true);
            },
        },
        {
            label: "Add File",
            icon: <ImFolderUpload size={15} />,
            onClick: () => {},
        },
    ];
    return (
        <>
            <div
                ref={ref}
                className={clsx(
                    "flex justify-space-between items-center",
                    className
                )}
                style={{
                    width: "100%",
                    padding: "10px 40px",
                    boxSizing: "border-box",
                    height: "parent",
                }}
            >
                <FolderPathDisplay
                    paths={["NSM", "Folders & Documents"]}
                ></FolderPathDisplay>


                <div className="flex justify-start gap-2 items-center">

                    <ButtonPrimary
                        onClick={() => setFilterIsOpen(!filterIsOpen)}
                    >
                        <FaFilter color="white" size={15} />
                    </ButtonPrimary>
                    {filterIsOpen && (
                        <FilterForm
                            isOponed={filterIsOpen}
                            setIsOpened={setFilterIsOpen}
                        ></FilterForm>
                    )}

                    <ButtonPrimary onClick={() => setMenuOpen(!mneuOpen)}>
                        <IoMdAdd color="white" size={15} />
                    </ButtonPrimary>
                    {mneuOpen && (
                        <ActionMenu
                            items={menus}
                            position="buttom"
                        ></ActionMenu>
                    )}
                </div>
            </div>

            {createFormOpen && <CreateFolder isOponed={createFormOpen} setIsOpened={setCreateFormOpen} onCreate={onFolderCreateUnderRoot}></CreateFolder>}
        </>
    );
};


// Mapping redux state to component props
const mapStateToProps = (state) => {
    return {
        rootFolderInfo: state.dirItemsReducers.rootFolderInfo,
    };
};

// Mapping redux dispatch actions to component props
const mapDispatchToProps = (dispatch) => ({
    createNewFolder: (args) => dispatch(createNewFolder(args)),
});

// Connecting component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(FileExploreHead);
