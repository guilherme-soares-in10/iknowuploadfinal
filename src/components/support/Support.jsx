import React, { useEffect, useRef, useState } from 'react';
import './Support.css';

const Support = ({ onClose }) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const iframeElement = iframeRef.current;
    if (iframeElement) {
      iframeElement.onload = () => {
        setLoading(false);
      };
    }
  }, []);

  return (
    <div className="iframe-container">
      <img 
        className="closeButton" 
        src="/images/deleteIcon.svg" 
        alt="Close" 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          cursor: 'pointer',
          width: '40px',
          height: '40px'
        }}
      />
      {loading && <div className="spinner">Loading...</div>}
      <iframe
        ref={iframeRef}
        src="https://forms.monday.com/forms/embed/89398b68abccc3ff2f27c3f4fc70b134?r=use1"
        width="100%"
        height="100%"
        style={{
          border: '0',
          boxShadow: '5px 5px 56px 0px rgba(0,0,0,0.25)',
        }}
        title="Support Form"
      />
    </div>
  );
};

export default Support;
