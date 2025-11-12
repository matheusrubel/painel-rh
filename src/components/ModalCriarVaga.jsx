import { useState } from 'react';
import { supabase } from '../config/supabase';
import { vagaSchema } from '../schemas/vagaSchema'; // ✅ NOVO
import { showSuccess, showError } from '../utils/toast'; // ✅ NOVO
import { handleError } from '../utils/errorHandler'; // ✅ NOVO

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
      // ✅ NOVO: Validar dados com Zod
      const dadosValidados = vagaSchema.parse(formData);

      const { error } = await supabase.from('vagas').insert([{
        ...dadosValidados,
        ativa: true
      }]);

      if (error) throw error;

      showSuccess('✅ Vaga criada com sucesso!'); // ✅ MUDOU

      // Limpar formulário
      setFormData({
        titulo: '',
        descricao: '',
        atribuicoes: '',
        beneficios: '',
        requisitos: '',
        local: ''
      });

      if (onVagaCriada) {
        onVagaCriada();
      }

      onClose();
    } catch (err) {
      // ✅ NOVO: Tratamento especial para erros Zod
      if (err.name === 'ZodError') {
        const primeiroErro = err.errors[0];
        showError(primeiroErro.message);
      } else {
        handleError(err, 'Erro ao criar vaga');
      }
    } finally {
      setCarregando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #475569',
        margin: '20px 0'
      }}>
        <h2 style={{ color: '#f8fafc', marginBottom: '20px' }}>
          📝 Criar Nova Vaga
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
              Título da Vaga *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              placeholder="Ex: Desenvolvedor Full Stack Sênior"
              style={{
                width: '100%',
                padding: '10px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px'
              }}
            />
          </div>

          {/* Local */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
              Local *
            </label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              required
              placeholder="Ex: São Paulo - SP (Híbrido)"
              style={{
                width: '100%',
                padding: '10px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px'
              }}
            />
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
              Descrição da Vaga
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva brevemente a vaga e o contexto da empresa..."
              style={{
                width: '100%',
                padding: '10px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Atribuições */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
              Atribuições e Responsabilidades * (uma por linha)
            </label>
            <textarea
              name="atribuicoes"
              value={formData.atribuicoes}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Desenvolver aplicações web&#10;Participar de code reviews&#10;Trabalhar em equipe ágil..."
              style={{
                width: '100%',
                padding: '10px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#94a3b8', fontSize: '12px' }}>
              Cada linha será convertida em um item da lista
            </small>
          </div>

          {/* Requisitos */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
              Requisitos e Qualificações * (uma por linha)
            </label>
            <textarea
              name="requisitos"
              value={formData.requisitos}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Experiência com React&#10;Conhecimento em Node.js&#10;Inglês intermediário..."
              style={{
                width: '100%',
                padding: '10px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Benefícios */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
              Benefícios (uma por linha)
            </label>
            <textarea
              name="beneficios"
              value={formData.beneficios}
              onChange={handleChange}
              rows={4}
              placeholder="Vale refeição&#10;Plano de saúde&#10;Home office flexível..."
              style={{
                width: '100%',
                padding: '10px',
                background: '#334155',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '6px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={carregando}
              style={{
                padding: '12px 24px',
                background: '#475569',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '6px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                opacity: carregando ? 0.6 : 1
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              style={{
                padding: '12px 24px',
                background: carregando ? '#334155' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {carregando ? '⏳ Criando...' : '✅ Criar Vaga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
