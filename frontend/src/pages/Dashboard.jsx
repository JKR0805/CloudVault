import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import FileCard from '../components/FileCard';
import UploadModal from '../components/UploadModal';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const { user, fetchMe } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/files');
      setFiles(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchFiles();
    fetchMe(); // Refresh storage quota
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Safe defaults if user object is not fully populated yet
  const storageUsed = user?.storage_used || 0;
  const storageLimit = user?.storage_limit || 1073741824; // 1GB default
  const usagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <div className="animate-fade-in" style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2>My Vault</h2>
          <p>Manage your files securely in the cloud</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn btn-primary">
          <Plus size={20} /> Upload File
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '500' }}>Storage Usage</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatSize(storageUsed)} / {formatSize(storageLimit)}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${usagePercent}%`, height: '100%', background: usagePercent > 90 ? 'var(--danger)' : 'var(--primary-color)', transition: 'width 0.5s ease' }}></div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading files...</div>
      ) : files.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ marginBottom: '10px' }}>No files yet</h3>
          <p style={{ marginBottom: '20px' }}>Upload your first file to get started.</p>
          <button onClick={() => setShowUpload(true)} className="btn btn-outline">
            Upload File
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {files.map(file => (
            <FileCard key={file.id} file={file} onRefresh={() => { fetchFiles(); fetchMe(); }} />
          ))}
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploadSuccess={handleUploadSuccess} />}
    </div>
  );
};

export default Dashboard;
