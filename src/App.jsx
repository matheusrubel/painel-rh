import { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Carregando...</div>;
  }

  return (
    <div>
      {!session ? (
        <Login onLogin={() => setSession(true)} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;
