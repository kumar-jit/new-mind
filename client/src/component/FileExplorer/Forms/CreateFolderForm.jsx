import { useEffect } from "react";
import { resetFolderCreationError } from "../../../redux/slices/FilesAndFoldersSlice";
import { FormCard } from "../../ui/Cards";
import { Modal } from "../../ui/Modal";
import { connect } from "react-redux";

function CreateFolder({
    setIsOpened,
    isOponed,
    onCreate,
    ref,
    error,
    resetFolderCreationError,
    editFormDefaultData,
    editFileDefaultData,
}) {
    const { folderName, folderDesc } = editFormDefaultData || {
        folderName: "",
        folderDesc: "",
    };
    const { fileName } = editFileDefaultData || { fileName: "" };
    const updateText = folderName || fileName ? "Update" : "Create";
    const typeName = fileName ? "File" : "Folder";
    useEffect(() => {
        return () => {
            resetFolderCreationError();
        };
    }, []);
    return (
        <Modal setOpen={setIsOpened}>
            <FormCard
                ref={ref}
                applyBtn={{ label: updateText, onClick: onCreate, show: true }}
                cancelBtn={{
                    label: "Cancel",
                    onClick: () => setIsOpened(false),
                    show: true,
                }}
                clearBtn={{
                    label: "X",
                    onClick: () => setIsOpened(false),
                    show: true,
                }}
                title={updateText + " " + typeName}
                errorMsg={{ show: error || false, msg: error }}
            >
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder={typeName + " Name"}
                        name={typeName == "File" ? "fileName" : "folderName"}
                        defaultValue={folderName || fileName}
                    />
                </div>

                {typeName == "Folder" && (
                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            placeholder="Description"
                            name="folderDesc"
                            defaultValue={folderDesc}
                        />
                    </div>
                )}
            </FormCard>
        </Modal>
    );
}

// Mapping redux state to component props
const mapStateToProps = (state) => {
    return {
        error: state.dirItemsReducers.folderCreationState.folderCreationError,
    };
};

// Mapping redux dispatch actions to component props
const mapDispatchToProps = (dispatch) => ({
    resetFolderCreationError: (args) =>
        dispatch(resetFolderCreationError(args)),
});

// Connecting component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(CreateFolder);
