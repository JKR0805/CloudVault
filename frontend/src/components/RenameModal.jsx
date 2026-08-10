import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const RenameModal = ({ currentName, onRename, onCancel, isLoading = false }) => {
  const [newName, setNewName] = useState(currentName || '');

  useEffect(() => {
    setNewName(currentName || '');
  }, [currentName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName && newName !== currentName) {
      onRename(newName);
    } else {
      onCancel();
    }
  };

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
        
        <h3 style={{ marginBottom: '20px' }}>Rename File</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>New Name (with extension)</label>
            <input 
              type="text" 
              className="glass-input" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} className="btn btn-outline" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading || !newName}>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;
