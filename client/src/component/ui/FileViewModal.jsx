import ReactDOM from "react-dom";
import React from "react";
import { MdClose } from "react-icons/md";

export const FileViewModal = ({ isOpen, onClose, fileId, description }) => {
    if (!isOpen || !fileId) return null;
    const API_BASE_URL = "http://localhost:8000";
    const pdfUrl = API_BASE_URL + `/api/v1/file/view/${fileId}`;

    const modalContent = (
        <div className="fileView-overlay">
            <div className="fileView-modal">
                <button className="fileView-close" onClick={onClose}>
                    <MdClose size={30} />
                </button>
                <div className="fileView-body">
                    <iframe
                        className="fileView-iframe"
                        src={pdfUrl}
                        title="File Viewer"
                    />
                    {description && (
                        <p className="fileView-description">{description}</p>
                    )}
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};
