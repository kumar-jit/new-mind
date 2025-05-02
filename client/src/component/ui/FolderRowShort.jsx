import { useEffect, useState } from "react";
import clsx from "clsx";
import { connect } from "react-redux";
import {
    fetchFolderById,
    toggleFolderExpand,
} from "../../redux/slices/FilesAndFoldersSlice";
import { FaRegFile, FaRegFolder } from "react-icons/fa";
import { Button, ButtonCircle } from "./Button";

export const TreeShortRowComponent = ({
    node,
    level = 0,
    toggleExpand,
    fetchFolderData,
    checkExpanded,
    children,
}) => {
    const [expanded, setExpanded] = useState(checkExpanded || false);
    useEffect(() => {
        setExpanded(checkExpanded || false);
    }, [checkExpanded]);

    useEffect(() => {
        fetchFolderData(node._id); // Fetch folder data when the component mounts
    }, []);
    return (
        <>
            <tr className={clsx(`${expanded ? "backround-color-expand" : ""}`)}>
                <td
                    align="left"
                    className={clsx(
                        `td-tree-row td-tree-padding-5 td-tree-border-buttom `
                    )}
                    style={{ paddingLeft: `${level * 10}px` }}
                >
                    {node.type == "folder" ? (
                        <FaRegFolder size={20} />
                    ) : (
                        <FaRegFile size={20} />
                    )}{" "}
                    {node.name}{node.type == "file" && node.extenstion && `.${node.extenstion}`}
                </td>
                <td
                    align="right"
                    className={clsx(
                        "td-tree-row td-tree-padding-5 td-tree-border-buttom"
                    )}
                >
                    {node.type == "folder" ? (
                        <ButtonCircle
                            className={
                                expanded ? "backround-color-A9B5DF-yellow" : ""
                            }
                            onClick={() => toggleExpand(node._id)}
                        >
                            {" "}
                            {expanded ? "-" : "+"}
                        </ButtonCircle>
                    ) : (
                        <Button></Button>
                    )}
                </td>
            </tr>

            {expanded &&
                children?.map((child) => (
                    <ConnectedShortTreeRow
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
});

const ConnectedShortTreeRow = connect(
    mapStateToProps,
    mapDispatchToProps
)(TreeShortRowComponent);

export default ConnectedShortTreeRow;
