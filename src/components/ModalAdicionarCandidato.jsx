import { useState } from 'react';
import { supabase } from '../config/supabase';

export default function ModalAdicionarCandidato({ isOpen, onClose, onCandidatoAdicionado }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    Email: '',
    telefone: '',
    cargo_pretendido: '',
    mensagem: ''
  });
  const [arquivo, setArquivo] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivo(file);
      setNomeArquivo(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      let curriculo_url = '';

      if (arquivo) {
        const nomeUnico = `${Date.now()}_${arquivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('curriculos')
          .upload(nomeUnico, arquivo);

        if (uploadError) {
          alert('Erro ao enviar currículo: ' + uploadError.message);
          setCarregando(false);
          return;
        }
        curriculo_url = nomeUnico;
      }

      const { error } = await supabase.from('candidatos').insert([{
        ...formData,
        curriculo_url
      }]);

      if (error) {
        alert('Erro ao adicionar candidato: ' + error.message);
      } else {
        alert('Candidato adicionado com sucesso!');
        setFormData({
          nome_completo: '',
          Email: '',
          telefone: '',
          cargo_pretendido: '',
          mensagem: ''
        });
        setArquivo(null);
        setNomeArquivo('');
        onCandidatoAdicionado();
        onClose();
      }
    } catch (err) {
      alert('Erro: ' + err.message);
    }
    setCarregando(false);
  };

  if (!isOpen) return null;

  const labelStyle = { color: '#333', display: 'block', marginBottom: '5px', fontWeight: 'bold' };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Adicionar Candidato</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Nome Completo *</label>
            <input
              type="text"
              name="nome_completo"
              value={formData.nome_completo}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', boxSizing: 'border-box', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', boxSizing: 'border-box', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Telefone</label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', boxSizing: 'border-box', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Cargo Pretendido *</label>
            <input
              type="text"
              name="cargo_pretendido"
              value={formData.cargo_pretendido}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', boxSizing: 'border-box', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Currículo</label>
            <div style={{
              padding: '10px',
              border: '2px dashed #28a745',
              borderRadius: '4px',
              backgroundColor: '#f0f0f0',
              cursor: 'pointer',
              textAlign: 'center'
            }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="fileInput"
              />
              <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'block', color: '#333' }}>
                {nomeArquivo ? `✅ ${nomeArquivo}` : '📁 Clique para selecionar arquivo (PDF, DOC, DOCX)'}
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Comentário (opcional)</label>
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              placeholder="Observações sobre o candidato..."
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', boxSizing: 'border-box', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={carregando}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1,
                fontWeight: 'bold'
              }}
            >
              {carregando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
