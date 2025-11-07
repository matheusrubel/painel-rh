import { useState } from 'react';
import { supabase } from '../config/supabase';


export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    
    if (error) {
      setErro('Credenciais inválidas');
      setCarregando(false);
    } else {
      onLogin();
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '20px', 
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <h2>Painel RH</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
            disabled={carregando}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Senha:</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
            disabled={carregando}
          />
        </div>
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <button 
          type="submit"
          style={{ 
            width: '100%', 
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
