import React, { useState, useRef } from "react";
import Button from "../../common/Button/Buton";
import './UploadCard.css';
    
const UploadCard = ({ text, onClick, cardId, fileFormat}) => {
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleDelete = (event) => {
        event.stopPropagation();
        setFile(null);
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

    const handleUpload = () => {
        onClick(file);
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
                    <img src="./src/images/icon.svg" alt="icon" />              
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
                        <img className="deleteIcon" src="./src/images/deleteIcon.svg" alt="delete" onClick={handleDelete}/>
                    </div>      
                    }
                </div>
            </div>
            <Button text={'Upload now'} onClick={handleUpload}></Button>
        </div>
    );
};

export default UploadCard;