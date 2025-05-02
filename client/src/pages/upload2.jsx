import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
// Create this file for basic styling

const API_BASE_URL = 'http://localhost:5001'; 

function Upload2() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    // State to track progress of all uploads
    // Structure: { uploadId: { file, percentage, status, error, fileId }, ... }
    const [uploadProgress, setUploadProgress] = useState({});
    const eventSourcesRef = useRef({}); // Store active EventSource connections { uploadId: eventSource }

    const handleFileChange = (event) => {
        setSelectedFiles([...event.target.files]);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            alert('Please select files to upload first.');
            return;
        }

        const currentUploads = {};

        selectedFiles.forEach(file => {
            const uploadId = uuidv4();
            currentUploads[uploadId] = {
                file: file,
                percentage: 0,
                status: 'pending', // Initial status
                error: null,
                fileId: null,
            };

            // Setup SSE Connection BEFORE starting the upload
            setupSSE(uploadId, file.name);

            // Start the upload process for this file
            startFileUpload(uploadId, file);
        });

        // Update the state with the new uploads starting
        setUploadProgress(prev => ({ ...prev, ...currentUploads }));
        setSelectedFiles([]); // Clear selection after starting uploads
        // Optionally clear the file input value if needed
        // document.getElementById('fileInput').value = null;
    };

    const setupSSE = (uploadId, fileName) => {
        console.log(`Setting up SSE for ${uploadId} (${fileName})`);
        const eventSource = new EventSource(`${API_BASE_URL}/progress/${uploadId}`);
        eventSourcesRef.current[uploadId] = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('SSE Message Received:', data);

                setUploadProgress(prev => {
                    // Ensure the entry exists before updating
                    if (!prev[data.uploadId]) {
                        console.warn(`Received progress for unknown uploadId: ${data.uploadId}`);
                        // Optionally initialize if somehow missed
                        // return {
                        //     ...prev,
                        //     [data.uploadId]: { file: { name: data.fileName || 'Unknown File' }, percentage: data.percentage, status: data.status, error: data.message || null, fileId: data.fileId || null }
                        // };
                        return prev;
                    }

                    const newProgress = {
                        ...prev,
                        [data.uploadId]: {
                            ...prev[data.uploadId], // Keep existing file info
                            percentage: data.percentage !== undefined ? data.percentage : prev[data.uploadId].percentage,
                            status: data.status || prev[data.uploadId].status,
                            error: data.status === 'error' ? data.message : null,
                            fileId: data.fileId || prev[data.uploadId].fileId,
                        }
                    };
                    // Optional: Clean up completed/error states from active tracking after a delay?
                    return newProgress;
                });

                 // Close connection if completed or errored on the server side
                 if (data.status === 'completed' || data.status === 'error') {
                    closeSSEConnection(data.uploadId);
                 }

            } catch (error) {
                console.error('Error parsing SSE data:', error, 'Data:', event.data);
            }
        };

        eventSource.onerror = (error) => {
            console.error(`SSE Error for ${uploadId}:`, error);
            setUploadProgress(prev => ({
                ...prev,
                [uploadId]: {
                    ...prev[uploadId],
                    status: 'error',
                    error: 'Connection error with progress server.',
                }
            }));
            closeSSEConnection(uploadId); // Close on error
        };

        eventSource.onopen = () => {
            console.log(`SSE Connection Opened for ${uploadId}`);
            // Update status to 'connecting' or 'waiting' if needed
             setUploadProgress(prev => ({
                ...prev,
                [uploadId]: {
                    ...prev[uploadId],
                    status: 'waiting', // Waiting for upload to start pushing data
                }
            }));
        };
    };

     const closeSSEConnection = (uploadId) => {
        if (eventSourcesRef.current[uploadId]) {
            eventSourcesRef.current[uploadId].close();
            delete eventSourcesRef.current[uploadId];
            console.log(`SSE Connection Closed for ${uploadId}`);
        }
    };

    const startFileUpload = async (uploadId, file) => {
        const formData = new FormData();
        formData.append('file', file); // 'file' must match backend multer field name

        try {
             // Update status right before POST
            setUploadProgress(prev => ({
                ...prev,
                [uploadId]: { ...prev[uploadId], status: 'uploading' }
            }));

            const response = await axios.post(`${API_BASE_URL}/upload/${uploadId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Send filename in header as fallback for backend SSE message init
                    'X-File-Name': file.name
                },
                // Note: Axios progress events are for the *request* upload, not file processing on server.
                // We rely on SSE for server-side processing progress.
                // onUploadProgress: (progressEvent) => {
                //     const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     // console.log(`Axios Progress for ${uploadId}: ${percentage}%`);
                //     // Avoid overwriting SSE progress, maybe use for initial burst?
                // }
            });

            console.log(`File ${file.name} (uploadId: ${uploadId}) POST success:`, response.data);
            // Final status update might come via SSE, but we can mark Axios request as done.
            // setUploadProgress(prev => ({
            //     ...prev,
            //     [uploadId]: { ...prev[uploadId], status: 'processing' } // Or wait for final SSE
            // }));

        } catch (error) {
            console.error(`Error uploading file ${file.name} (uploadId: ${uploadId}):`, error.response?.data || error.message);
            setUploadProgress(prev => ({
                ...prev,
                [uploadId]: {
                    ...prev[uploadId],
                    status: 'error',
                    error: error.response?.data?.message || 'Network or server error during upload.',
                }
            }));
             // Ensure SSE connection is closed if the POST itself fails
             closeSSEConnection(uploadId);
        }
    };

     // Cleanup SSE connections on component unmount
     useEffect(() => {
        return () => {
            console.log("Cleaning up SSE connections on unmount...");
            Object.keys(eventSourcesRef.current).forEach(uploadId => {
                 closeSSEConnection(uploadId);
            });
        };
    }, []); // Empty dependency array ensures this runs only on unmount


    return (
        <div className="App">
            <h1>Large File Upload to MongoDB</h1>
            <div className="upload-section">
                <input
                    id="fileInput"
                    type="file"
                    multiple // Allow multiple file selection
                    onChange={handleFileChange}
                />
                 <button onClick={handleUpload} disabled={selectedFiles.length === 0}>
                    Upload Selected Files
                </button>
                 {selectedFiles.length > 0 && (
                    <div className="selected-files">
                        <h4>Files ready for upload:</h4>
                        <ul>
                            {selectedFiles.map((file, index) => (
                                <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Progress Display Section */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="progress-section">
                    <h2>Upload Progress</h2>
                    {Object.entries(uploadProgress).map(([id, progress]) => (
                        <div key={id} className={`progress-item status-${progress.status}`}>
                            <span className="file-name">{progress.file?.name || 'Unknown File'}</span>
                             <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${progress.percentage || 0}%` }}
                                >
                                    {progress.percentage || 0}%
                                </div>
                            </div>
                            <span className="status">Status: {progress.status}</span>
                             {progress.status === 'completed' && <span className="file-id"> (ID: {progress.fileId})</span>}
                             {progress.error && <span className="error-message">Error: {progress.error}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Upload2;