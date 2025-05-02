import { connect } from "react-redux";
import Sidebar from "../component/Common/SlideMenubar";
import FileExplore from "../component/FileExplorer/FileExplorer";
import FileTable from "../component/FileExplorer/FileTable";

const HomePage = () => {
    return (
        <div style={{ margin: "0px", padding: "0px", height: "var(--vh)" }}>
            <Sidebar></Sidebar>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    height: "100%",
                    backgroundColor: "#F5F5F5",
                    boxSizing: "border-box",
                }}
            >
                <FileTable></FileTable>
                <FileExplore> </FileExplore>
            </div>
        </div>
    );
};

// Mapping redux state to component props
const mapStateToProps = (state) => ({
    dirItems: state.dirItemsReducers.items,
});

// Mapping redux dispatch actions to component props
const mapDispatchToProps = (dispatch) => ({
    setInitDirItems: (items) => dispatch(fecthRootFolderData(items)),
});

// Connecting component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
