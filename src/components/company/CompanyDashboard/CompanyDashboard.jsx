import React from 'react';
import UploadCard from '../../upload/UploadCard/UploadCard';
import './CompanyDashboard.css';

const CompanyDashboard = ({ companyData }) => {
    const handleUpload = (file) => {
        console.log('File to upload:', file);
        // We'll implement the actual upload later
    };

    return (
        <div className="companyDashboard">
            <h2>Upload Files</h2>
            <div className="uploadCardsContainer">
                {companyData?.categories?.map((category, index) => (
                    <UploadCard 
                        key={index}
                        text={category.text}
                        onClick={handleUpload}
                        cardId={category.category}
                        fileFormat=".pdf,.doc,.docx"
                        companyId={companyData.ID}
                    />
                ))}
            </div>
        </div>
    );
};

export default CompanyDashboard;
