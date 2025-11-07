import { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SEMPRE fazer logout quando a página carregar
    const inicializar = async () => {
      // Fazer logout primeiro
      await supabase.auth.signOut();
      
      // Limpar storage
      localStorage.clear();
      
      // Definir sessão como null
      setSession(null);
      setLoading(false);
    };

    inicializar();

    // Escutar mudanças de autenticação (quando o usuário fizer login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading state com design moderno
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)',
        gap: '1rem'
      }}>
        {/* Spinner animado */}
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #334155',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        
        {/* Texto */}
        <p style={{
          color: '#cbd5e1',
          fontSize: '1rem',
          fontWeight: 500
        }}>
          Carregando...
        </p>
      </div>
    );
  }

  // Renderizar Login ou Dashboard
  return session ? <Dashboard /> : <Login />;
}

export default App;