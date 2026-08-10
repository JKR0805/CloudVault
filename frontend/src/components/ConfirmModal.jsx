import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false, isLoading = false }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '400px', padding: '30px', position: 'relative' }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          {isDanger && <AlertTriangle size={28} color="var(--danger)" />}
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        
        <p style={{ marginBottom: '25px', lineHeight: '1.5' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-outline" disabled={isLoading}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
