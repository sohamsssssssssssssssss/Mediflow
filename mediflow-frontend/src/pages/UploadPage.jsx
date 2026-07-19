import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Upload from '../components/Upload';
import './UploadPage.css';

export default function UploadPage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const handleUploadComplete = () => {
    navigate('/timeline');
  };

  return (
    <div className="upload-page">
      <Header />
      <main className="upload-page-main">
        <Upload
          onUploadComplete={handleUploadComplete}
          onUploadingChange={setUploading}
        />
      </main>
    </div>
  );
}
