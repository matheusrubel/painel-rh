import { useState } from 'react';
import { supabase } from '../config/supabase';

export default function ModalCriarVaga({ isOpen, onClose, onVagaCriada }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    atribuicoes: '',
    beneficios: '',
    requisitos: '',
    local: ''
  });
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const vagaData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        atribuicoes: formData.atribuicoes.split('\n').filter(a => a.trim()),
        beneficios: formData.beneficios.split('\n').filter(b => b.trim()),
        requisitos: formData.requisitos.split('\n').filter(r => r.trim()),
        local: formData.local,
        ativa: true
      };

      const { error } = await supabase.from('vagas').insert([vagaData]);

      if (error) {
        alert('Erro ao criar vaga: ' + error.message);
      } else {
        alert('Vaga criada com sucesso!');
        setFormData({
          titulo: '',
          descricao: '',
          atribuicoes: '',
          beneficios: '',
          requisitos: '',
          local: ''
        });
        onVagaCriada();
        onClose();
      }
    } catch (err) {
      alert('Erro: ' + err.message);
    }
    setCarregando(false);
  };

  if (!isOpen) return null;

  const labelStyle = { color: '#333', display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', boxSizing: 'border-box', borderRadius: '4px' };

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
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxHeight: '90vh',
        overflowY: 'auto',
        margin: '20px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Criar Nova Vaga</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Título da Vaga *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Analista de Dados"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição geral da vaga..."
              style={{ ...inputStyle, minHeight: '80px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Atribuições (uma por linha)</label>
            <textarea
              name="atribuicoes"
              value={formData.atribuicoes}
              onChange={handleChange}
              placeholder="Análise de dados&#10;Automações&#10;Integração de sistemas"
              style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Benefícios (um por linha)</label>
            <textarea
              name="beneficios"
              value={formData.beneficios}
              onChange={handleChange}
              placeholder="Plano de carreira&#10;Unimed&#10;VR e VT"
              style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Requisitos (um por linha)</label>
            <textarea
              name="requisitos"
              value={formData.requisitos}
              onChange={handleChange}
              placeholder="Ensino superior completo&#10;Experiência com Python&#10;Conhecimento em SQL"
              style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Local</label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              placeholder="Ex: São Paulo - Híbrido"
              style={inputStyle}
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
              {carregando ? 'Criando...' : 'Criar Vaga'}
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
