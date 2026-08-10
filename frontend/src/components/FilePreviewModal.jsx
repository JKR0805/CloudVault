import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../api/client';

const FilePreviewModal = ({ file, onClose }) => {
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await apiClient.get(`/files/${file.id}/download`);
        if (res.data.data.downloadUrl) {
          setDownloadUrl(res.data.data.downloadUrl);
        } else {
          setError('Could not generate preview URL');
        }
      } catch (err) {
        console.error('Preview error', err);
        setError('Failed to load preview');
      } finally {
        setLoading(false);
      }
    };
    fetchUrl();
  }, [file.id]);

  const renderPreview = () => {
    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>Loading preview...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

    const mime = file.mime_type;
    if (mime.startsWith('image/')) {
      return <img src={downloadUrl} alt={file.original_name} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />;
    } else if (mime.startsWith('video/')) {
      return <video src={downloadUrl} controls style={{ maxWidth: '100%', maxHeight: '70vh' }} />;
    } else if (mime.startsWith('audio/')) {
      return <audio src={downloadUrl} controls style={{ width: '100%' }} />;
    } else if (mime.startsWith('text/') || mime === 'application/pdf') {
      return <iframe src={downloadUrl} title="preview" style={{ width: '100%', height: '70vh', border: 'none', backgroundColor: 'white' }} />;
    } else {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
          <p style={{ marginBottom: '20px' }}>Preview not available for this file type.</p>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Download File</a>
        </div>
      );
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      padding: '20px'
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '900px', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', color: 'white' }}>
          <h3 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
            {file.original_name}
          </h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '10px' }}>
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
