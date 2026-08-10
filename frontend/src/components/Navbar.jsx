import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cloud, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel" style={{ 
      margin: '20px', 
      padding: '15px 30px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 'bold' }}>
        <Cloud color="var(--primary-color)" size={28} />
        CloudVault
      </Link>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || 'User'}&background=random`} 
              alt="Avatar" 
              style={{ width: '36px', height: '36px', borderRadius: '50%' }}
            />
            <span style={{ fontWeight: '500' }}>{user.user_metadata?.full_name || user.email}</span>
          </div>
          <button onClick={logout} className="btn btn-outline" style={{ padding: '8px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
