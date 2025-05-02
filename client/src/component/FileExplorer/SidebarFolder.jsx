import TreeTable from "../ui/FolderTree";
import ConnectedShortTreeRow from "../ui/FolderRowShort";

export default function SidebarFolder({ treeData }) {
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                overflowY: "scroll",
                backgroundColor: "#ffff",
                padding: "10px",
                boxSizing: "border-box",
            }}
        >
            <TreeTable
                className={"sidebar-tree-table"}
                data={treeData}
                RowComponent={ConnectedShortTreeRow}
                isShort={true}
            />
        </div>
    );
}
