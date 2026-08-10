import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Cloud, AlertCircle, FileIcon } from 'lucide-react';
import apiClient from '../api/client';

const SharedDownload = () => {
  const { shortCode } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const res = await apiClient.get(`/share/${shortCode}`);
        setFileData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch shared file:', err);
        setError('Invalid or expired share link. This file may have been deleted or the link is no longer active.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedFile();
  }, [shortCode]);

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (fileData?.downloadUrl) {
      window.open(fileData.downloadUrl, '_blank');
    }
  };

  const renderPreview = () => {
    const mime = fileData.file.mime_type;
    const downloadUrl = fileData.downloadUrl;
    
    if (mime.startsWith('image/')) {
      return <img src={downloadUrl} alt={fileData.file.original_name} style={{ maxWidth: '100%', maxHeight: '40vh', objectFit: 'contain', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }} />;
    } else if (mime.startsWith('video/')) {
      return <video src={downloadUrl} controls style={{ maxWidth: '100%', maxHeight: '40vh', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }} />;
    } else if (mime.startsWith('audio/')) {
      return <audio src={downloadUrl} controls style={{ width: '100%' }} />;
    } else if (mime.startsWith('text/') || mime === 'application/pdf') {
      return <iframe src={downloadUrl} title="preview" style={{ width: '100%', height: '40vh', border: 'none', backgroundColor: 'white', borderRadius: '8px' }} />;
    } else {
      return (
        <div style={{ display: 'inline-flex', padding: '20px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '24px' }}>
          <FileIcon size={48} color="var(--primary-color)" />
        </div>
      );
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '60px 20px 20px 20px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '40px 30px', textAlign: 'center' }}>
          
          {loading ? (
            <div style={{ padding: '40px 0' }}>
              <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Loading file details...</p>
            </div>
          ) : error ? (
            <div>
              <div style={{ display: 'inline-flex', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', marginBottom: '20px' }}>
                <AlertCircle size={40} color="var(--danger)" />
              </div>
              <h3 style={{ marginBottom: '15px' }}>Link Unavailable</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: 1.5 }}>
                {error}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                {renderPreview()}
              </div>
              
              <h3 style={{ marginBottom: '10px', wordBreak: 'break-all' }}>{fileData.file.original_name}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                Size: {formatSize(fileData.file.size)}
              </p>
              
              <button onClick={handleDownload} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Download size={20} /> Download File
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default SharedDownload;
