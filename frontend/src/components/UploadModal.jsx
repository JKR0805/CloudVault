import { useState, useRef } from 'react';
import apiClient from '../api/client';
import { UploadCloud, X } from 'lucide-react';

const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      onUploadSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '400px', padding: '30px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} disabled={uploading}>
          <X size={24} />
        </button>
        
        <h3 style={{ marginBottom: '20px' }}>Upload File</h3>
        
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--glass-border)',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            background: file ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files && setFile(e.target.files[0])} 
            style={{ display: 'none' }} 
            disabled={uploading}
          />
          <UploadCloud size={48} color={file ? 'var(--primary-color)' : 'var(--text-muted)'} style={{ marginBottom: '10px' }} />
          
          {file ? (
            <div>
              <p style={{ color: 'var(--text-main)', fontWeight: '500', wordBreak: 'break-all' }}>{file.name}</p>
              <p style={{ fontSize: '0.8rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <p>Drag and drop a file here, or click to browse</p>
          )}
        </div>
        
        {uploading && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.2s ease' }}></div>
            </div>
          </div>
        )}
        
        {error && <p style={{ color: 'var(--danger)', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}
        
        <button 
          onClick={handleUpload} 
          disabled={!file || uploading} 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '12px' }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default UploadModal;
