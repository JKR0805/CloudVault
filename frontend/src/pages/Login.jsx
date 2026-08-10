import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const { login, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      if (isResetMode) {
        await resetPassword(email);
        setMessage('Password reset email sent! Check your inbox.');
        setIsResetMode(false);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || (isResetMode ? 'Failed to send reset email' : 'Failed to login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="glass-panel login-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px', margin: '0 20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          {isResetMode ? 'Reset Password' : 'Welcome Back'}
        </h2>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email</label>
            <input 
              type="email" 
              className="glass-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {!isResetMode && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: 'var(--text-muted)' }}>Password</label>
                <button 
                  type="button" 
                  onClick={() => { setIsResetMode(true); setError(''); setMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <input 
                type="password" 
                className="glass-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isResetMode}
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px' }} disabled={loading}>
            {loading ? (isResetMode ? 'Sending...' : 'Signing in...') : (isResetMode ? 'Send Reset Email' : 'Sign In')}
          </button>
          
          {isResetMode && (
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ padding: '12px', marginTop: '10px' }} 
              onClick={() => { setIsResetMode(false); setError(''); }}
              disabled={loading}
            >
              Back to Login
            </button>
          )}
        </form>
        
        {!isResetMode && (
          <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
