import { useState, useRef, useCallback } from 'react';
import { uploadDocument } from '../services/api';
import './Upload.css';

export default function Upload({ onUploadComplete, onUploadingChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(Array.from(files));
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(Array.from(files));
    }
    e.target.value = '';
  }, []);

  const handleFiles = async (files) => {
    for (const file of files) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError(`Unsupported format: ${file.type || file.name}. Use JPG, PNG, or PDF.`);
        continue;
      }

      setIsProcessing(true);
      setError(null);
      if (onUploadingChange) onUploadingChange(true);

      try {
        await uploadDocument(file);
        setUploadedCount(prev => prev + 1);
      } catch (err) {
        console.error('Upload failed:', err);
        setError(err.message || 'Upload failed. Please try again.');
      } finally {
        setIsProcessing(false);
        if (onUploadingChange) onUploadingChange(false);
      }
    }

    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1 className="upload-title">Upload Medical Documents</h1>
        <p className="upload-subtitle">
          Upload your prescriptions, lab reports, or discharge summaries to build your unified health timeline.
          {uploadedCount > 0 && (
            <span className="upload-count"> {uploadedCount} document{uploadedCount !== 1 ? 's' : ''} uploaded this session.</span>
          )}
        </p>
      </div>

      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && inputRef.current?.click()}
      >
        {isProcessing ? (
          <div className="processing-state">
            <div className="processing-pulse">
              <div className="spinner" />
            </div>
            <p className="processing-title">Processing document...</p>
            <p className="processing-desc">Extracting medications and organizing into your timeline</p>
          </div>
        ) : (
          <>
            <div className="upload-zone-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h2 className="upload-zone-title">Drop documents here</h2>
            <p className="upload-zone-text">or click to browse files</p>
            <span className="upload-zone-hint">Supports JPG, PNG, and PDF</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileInput}
              multiple
              className="file-input"
            />
          </>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      <div className="upload-tips">
        <h3>Tips for best results:</h3>
        <ul>
          <li>Upload <strong>all four</strong> demo documents (2 prescriptions + 2 lab reports) in sequence</li>
          <li>Clear, printed documents give the best extraction accuracy</li>
          <li>Each document is processed independently and added to your timeline</li>
        </ul>
      </div>
    </div>
  );
}
