import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import FileCard from '../components/FileCard';
import UploadModal from '../components/UploadModal';
import ConfirmModal from '../components/ConfirmModal';
import RenameModal from '../components/RenameModal';
import FilePreviewModal from '../components/FilePreviewModal';
import ShareModal from '../components/ShareModal';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const { user, fetchMe } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  
  const [fileToDelete, setFileToDelete] = useState(null);
  const [fileToRename, setFileToRename] = useState(null);
  const [fileToPreview, setFileToPreview] = useState(null);
  const [fileToShare, setFileToShare] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

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

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/files/${fileToDelete.id}`);
      setFileToDelete(null);
      fetchFiles();
      fetchMe();
    } catch (error) {
      console.error('Delete failed', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameConfirm = async (newName) => {
    if (!fileToRename) return;
    setIsRenaming(true);
    try {
      await apiClient.patch(`/files/${fileToRename.id}`, { name: newName });
      setFileToRename(null);
      fetchFiles();
    } catch (error) {
      console.error('Rename failed', error);
    } finally {
      setIsRenaming(false);
    }
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
    <>
      <div className="animate-fade-in" style={{ padding: '0 20px' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2>My Vault</h2>
          <p>Manage your files securely in the cloud</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn btn-primary dashboard-upload-btn">
          <Plus size={20} /> Upload File
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="storage-stats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: '500' }}>Storage Usage</span>
            <span className="storage-stats-text" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatSize(storageUsed)} / {formatSize(storageLimit)}</span>
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
        <div className="file-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
          {files.map(file => (
            <FileCard 
              key={file.id} 
              file={file} 
              onRefresh={() => { fetchFiles(); fetchMe(); }} 
              onDeleteRequest={(f) => setFileToDelete(f)}
              onRenameRequest={(f) => setFileToRename(f)}
              onPreviewRequest={(f) => setFileToPreview(f)}
              onShareRequest={(f) => setFileToShare(f)}
            />
          ))}
        </div>
      )}
    </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploadSuccess={handleUploadSuccess} />}
      
      {fileToDelete && (
        <ConfirmModal 
          title="Delete File" 
          message={`Are you sure you want to delete "${fileToDelete.original_name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setFileToDelete(null)}
          confirmText="Delete"
          isDanger={true}
          isLoading={isDeleting}
        />
      )}
      
      {fileToRename && (
        <RenameModal
          currentName={fileToRename.original_name}
          onRename={handleRenameConfirm}
          onCancel={() => setFileToRename(null)}
          isLoading={isRenaming}
        />
      )}

      {fileToPreview && (
        <FilePreviewModal
          file={fileToPreview}
          onClose={() => setFileToPreview(null)}
        />
      )}

      {fileToShare && (
        <ShareModal
          file={fileToShare}
          onClose={() => setFileToShare(null)}
        />
      )}
    </>
  );
};

export default Dashboard;
