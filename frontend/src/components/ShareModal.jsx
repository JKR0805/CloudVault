import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import apiClient from '../api/client';

const ShareModal = ({ file, onClose }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await apiClient.get(`/files/${file.id}/download`);
        if (res.data.data.downloadUrl) {
          setShareUrl(res.data.data.downloadUrl);
        } else {
          setError('Could not generate share link');
        }
      } catch (err) {
        console.error('Share error', err);
        setError('Failed to load share link');
      } finally {
        setLoading(false);
      }
    };
    fetchUrl();
  }, [file.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '450px', padding: '30px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <h3 style={{ marginBottom: '20px' }}>Share File</h3>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Generating secure link...</p>
        ) : error ? (
          <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>
        ) : (
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Anyone with this link can securely view and download this file. 
            </p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="glass-input" 
                value={shareUrl}
                readOnly
                style={{ flex: 1 }}
                onClick={(e) => e.target.select()}
              />
              <button 
                onClick={handleCopy} 
                className={`btn ${copied ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0 15px' }}
                title="Copy Link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
