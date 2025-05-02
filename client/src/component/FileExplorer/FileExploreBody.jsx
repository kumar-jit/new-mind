import TreeTable from "../ui/FolderTree";
import ConnectedTreeRow from "../ui/FolderRow";
export default function FileExploreBody({ treeData }) {
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                overflowY: "scroll",
                backgroundColor: "#e2ecf8",
                padding: "10px",
                boxSizing: "border-box",
            }}
        >
            <TreeTable data={treeData} RowComponent={ConnectedTreeRow} />
        </div>
    );
}
