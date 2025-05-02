import { TotalFoldersFilesInfo } from "./TotalFoldersFilesInfo";
import SidebarFolder from "./SidebarFolder";
import { toggleFileTableShow } from "../../redux/slices/LayoutSlice";
import { connect } from "react-redux";
import { ButtonCircle } from "../ui/Button";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useEffect } from "react";
import { getTotalStats } from "../../redux/slices/FilesAndFoldersSlice";

const FileTable = (props) => {
    const {
        fileTableShow,
        fileTableWidth,
        toggleFileTableShow,
        totalStats,
        getTotalStats,
    } = props;
    useEffect(() => {
        getTotalStats();
    }, []);
    return (
        <div
            style={{
                position: "relative",
                width: `${fileTableWidth}px`,
                marginLeft: "70px",
                borderRight: "3px solid rgba(77, 77, 77, 0.4)",
                height: "var(--avh)",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{ position: "absolute", right: "-15px", top: "10px" }}
                onClick={toggleFileTableShow}
            >
                <ButtonCircle style={{ padding: "5px 8px" }}>
                    {fileTableShow ? (
                        <MdArrowBackIos size={15} />
                    ) : (
                        <MdArrowForwardIos size={15} />
                    )}
                </ButtonCircle>
            </div>
            {fileTableShow && (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#FFFFFF",
                        boxSizing: "border-box",
                    }}
                >
                    <TotalFoldersFilesInfo {...totalStats} />
                    <hr></hr>
                    <SidebarFolder></SidebarFolder>
                </div>
            )}
        </div>
    );
};

// Mapping redux state to component props
const mapStateToProps = (state) => ({
    fileTableShow: state.layoutReducer.fileTableShow,
    fileTableWidth: state.layoutReducer.fileTableWidth,
    totalStats: state.dirItemsReducers.totalStats,
});

// Mapping redux dispatch actions to component props
const mapDispatchToProps = (dispatch) => ({
    toggleFileTableShow: () => dispatch(toggleFileTableShow()),
    getTotalStats: () => dispatch(getTotalStats()),
});

// Connecting component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(FileTable);
