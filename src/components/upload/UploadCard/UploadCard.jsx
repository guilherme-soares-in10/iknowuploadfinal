import React, { useState, useRef } from "react";
import Button from "../../common/Button/Button";
import { uploadData } from '@aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import './UploadCard.css';
    
const UploadCard = ({ text, onClick, cardId, fileFormat, companyId }) => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleDelete = (event) => {
        event.stopPropagation();
        setFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(droppedFile);
                fileInputRef.current.files = dataTransfer.files;
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            // Check authentication status
            const user = await getCurrentUser();
            console.log('Current user:', user);

            if (!user) {
                throw new Error('Not authenticated');
            }

            setIsUploading(true);
            const fileName = `${Date.now()}-${file.name}`;
            const key = `${companyId}/${cardId}/${fileName}`;
            
            console.log('Uploading to S3:', {
                key,
                fileSize: file.size,
                user: user
            });

            const result = await uploadData({
                key: key,
                data: file,
                options: {
                    onProgress: ({ transferredBytes, totalBytes }) => {
                        const progress = (transferredBytes / totalBytes) * 100;
                        setUploadProgress(progress);
                    }
                }
            });

            console.log('Upload result:', result);
            setFile(null);
            setUploadProgress(0);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="uploadCardContainer">
            <div>
                <p>{text}</p>
            </div>
            <div 
                className={`browseContainer ${isDragging ? 'hover' : ''}`}
                id="dropZone"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div>
                    <img className="icon" src="images/icon.svg" alt="icon" />              
                    <p>Drag n Drop here<br />
                    or<br /></p>
                    <input 
                        type="file" 
                        id={cardId}
                        ref={fileInputRef}
                        style={{ display: "none" }} 
                        onChange={handleFileChange} 
                        accept={fileFormat}
                    />
                    <label htmlFor={cardId}>
                        Browse
                    </label>  
                </div>          
                <div className="fileNameContainer">
                    {file && 
                    <div>  
                        <p><em>Selected file: {file.name}</em></p>
                        <img className="deleteIcon" src="/images/deleteIcon.svg" alt="delete" onClick={handleDelete}/>
                    </div>      
                    }
                </div>
            </div>
            {isUploading && (
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}
            <Button 
                text={isUploading ? 'Uploading...' : 'Upload now'} 
                onClick={handleUpload}
                disabled={!file || isUploading}
            ></Button>
        </div>
    );
};

export default UploadCard;