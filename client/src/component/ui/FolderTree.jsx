import clsx from "clsx";
import ConnectedTreeRow from "./FolderRow";
import { connect } from "react-redux";

export const TreeTable = ({ treeData, className, isShort, RowComponent }) => (
    <table
        cellPadding="5"
        style={{ width: "100%" }}
        className={clsx("tree-table", className)}
    >
        {!isShort && (
            <thead>
                <tr>
                    {/* <th></th> */}
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created Date</th>
                    <th>Updated Date</th>
                    <th></th>
                </tr>
            </thead>
        )}
        <tbody style={{ backgroundColor: "white" }}>
            {treeData.map((node) => (
                <RowComponent key={node._id} node={node} />
            ))}
        </tbody>
    </table>
);

const mapStateToProps = (state) => ({
    treeData: state.dirItemsReducers.items,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TreeTable);
