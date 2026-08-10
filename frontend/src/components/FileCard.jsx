import { FileIcon, FileText, Image, Film, FileMusic, Download, Trash2, Edit2, Eye, Share2 } from 'lucide-react';
import apiClient from '../api/client';

const FileCard = ({ file, onRefresh, onRenameRequest, onDeleteRequest, onPreviewRequest, onShareRequest }) => {
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image size={32} color="#8b5cf6" />;
    if (mimeType.startsWith('video/')) return <Film size={32} color="#f43f5e" />;
    if (mimeType.startsWith('audio/')) return <FileMusic size={32} color="#10b981" />;
    if (mimeType.startsWith('text/')) return <FileText size={32} color="#3b82f6" />;
    return <FileIcon size={32} color="#94a3b8" />;
  };

  const handleDownload = async () => {
    try {
      const res = await apiClient.get(`/files/${file.id}/download`);
      if (res.data.data.downloadUrl) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flexShrink: 0 }}>
          {getIcon(file.mime_type)}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <h4 style={{ margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={file.original_name}>
            {file.original_name}
          </h4>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {formatSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
        <button onClick={() => onPreviewRequest(file)} className="btn btn-primary" style={{ flex: 1, padding: '8px' }} title="Preview">
          <Eye size={16} />
        </button>
        <button onClick={handleDownload} className="btn btn-outline" style={{ padding: '8px' }} title="Download">
          <Download size={16} />
        </button>
        <button onClick={() => onShareRequest(file)} className="btn btn-outline" style={{ padding: '8px' }} title="Share">
          <Share2 size={16} />
        </button>
        <button onClick={() => onRenameRequest(file)} className="btn btn-outline" style={{ padding: '8px' }} title="Rename">
          <Edit2 size={16} />
        </button>
        <button onClick={() => onDeleteRequest(file)} className="btn btn-danger" style={{ padding: '8px' }} title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
