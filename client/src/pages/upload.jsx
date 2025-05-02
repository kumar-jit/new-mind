import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

function Upload() {
  const [files, setFiles] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [clientId] = useState(uuidv4());

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:4000/events/${clientId}`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgressMap(prev => ({
        ...prev,
        [data.filename]: data.progress
      }));
    };
    return () => {
      eventSource.close();
    };
  }, [clientId]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(`http://localhost:4000/upload/${clientId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>File Upload with SSE Progress</h2>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      <div style={{ marginTop: '20px' }}>
        <h3>Upload Progress</h3>
        {files.map(file => (
          <div key={file.name}>
            {file.name} — {progressMap[file.name] || 0}%
          </div>
        ))}
      </div>
    </div>
  );
}

export default Upload;
