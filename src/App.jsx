import { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
// import './App.css';  // <-- Deixa comentado por enquanto

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
    return <div style={{ padding: '50px', textAlign: 'center' }}>Carregando...</div>;
  }

  return session ? <Dashboard /> : <Login />;
}

export default App;
