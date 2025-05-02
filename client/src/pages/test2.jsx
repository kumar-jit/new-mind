import axios from "axios";
import { useEffect, useState } from "react";

export const Test2 = () => {
    const [sseConnection, setSSEConnection] = useState(null);
    const [file, setFile] = useState(null);

    const clientId = "user-123"; // Ideally a user ID or session token

    const eventSource = new EventSource(
        `http://localhost:8000/file/events?clientId=${clientId}`
    );

    eventSource.addEventListener("uploadProgress", (e) => {
        const data = JSON.parse(e.data);
        console.log(`${data.filename}: ${data.progress}%`);
    });

    eventSource.addEventListener("uploadComplete", (e) => {
        const data = JSON.parse(e.data);
        console.log(`Upload done for: ${data.filename}`);
    });

    
    const handleFileChange = (e) => {
        setFile(e.target.files);
    };
    
    const handleUpload = async () => {
        if(file){
            const formData = new FormData();
            formData.append('file', file);
            try{
                await axios.post(`http://localhost:8000/file/upload/${clientId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            }
            catch(err){
                console.error(err)
            }
        }
        
    };

    useEffect(() => {
        // eventSource();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>File Upload with SSE Progress</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={() => handleUpload()}>Upload</button>

            <div style={{ marginTop: "20px" }}>
                <h3>Upload Progress</h3>
                <h5></h5>
            </div>
        </div>
    );
};
