import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function DashboardAnalytics() {
  const [periodo, setPeriodo] = useState('mes');
  const { 
    totalVagasAbertas,
    totalCandidatosAtivos,
    tempoMedioContratacao,
    taxaConversao,
    vagasPorStatus,
    candidatosPorEtapa,
    vagasPorCidade,
    evolucaoMensal,
    carregando,
    erro,
    refetch
  } = useAnalytics(periodo);

  // Cores do tema
  const CORES = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

  if (carregando) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #334155',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>Carregando analytics...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: '16px' }}>{erro}</p>
        <button
          onClick={refetch}
          style={{
            marginTop: '1rem',
            padding: '10px 20px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h2 style={{ color: '#f8fafc', margin: 0, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📊 Analytics & Métricas
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Visão geral do processo de recrutamento
          </p>
        </div>

        {/* Filtro de Período */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 'bold' }}>
            Período:
          </label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#334155',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mês</option>
            <option value="trimestre">Últimos 3 Meses</option>
            <option value="ano">Último Ano</option>
          </select>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <MetricCard
          titulo="Vagas Abertas"
          valor={totalVagasAbertas}
          icone="📋"
          cor="#3b82f6"
          sufixo=""
        />
        <MetricCard
          titulo="Candidatos Ativos"
          valor={totalCandidatosAtivos}
          icone="👥"
          cor="#10b981"
          sufixo=""
        />
        <MetricCard
          titulo="Tempo Médio"
          valor={tempoMedioContratacao}
          icone="⏱️"
          cor="#f59e0b"
          sufixo={tempoMedioContratacao === 1 ? " dia" : " dias"}
        />
        <MetricCard
          titulo="Taxa Conversão"
          valor={taxaConversao}
          icone="📈"
          cor="#8b5cf6"
          sufixo="%"
        />
      </div>

      {/* Gráficos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {/* Gráfico 1: Vagas por Status (Pizza) */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '20px', fontSize: '16px' }}>
            📊 Vagas por Status
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={vagasPorStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {vagasPorStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 2: Candidatos por Etapa (Funil) */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '20px', fontSize: '16px' }}>
            🎯 Pipeline de Candidatos
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={candidatosPorEtapa} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc'
                }}
              />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 3: Vagas por Cidade (Barras) */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '20px', fontSize: '16px' }}>
            📍 Vagas por Localização
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vagasPorCidade}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc'
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 4: Evolução Mensal (Linha) */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '20px', fontSize: '16px' }}>
            📈 Evolução Mensal
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#f8fafc'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#f8fafc' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="candidatos" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Candidatos"
                dot={{ fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="contratacoes" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Contratações"
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Animações */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Componente de Card de Métrica
function MetricCard({ titulo, valor, icone, cor, sufixo = '' }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${cor}15 0%, ${cor}05 100%)`,
      border: `1px solid ${cor}40`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 20px ${cor}30`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Header do Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
          {titulo}
        </span>
        <span style={{ fontSize: '24px' }}>{icone}</span>
      </div>

      {/* Valor */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{
          color: cor,
          fontSize: '32px',
          fontWeight: 'bold',
          lineHeight: 1
        }}>
          {valor}
        </span>
        {sufixo && (
          <span style={{
            color: '#94a3b8',
            fontSize: '16px',
            fontWeight: 600
          }}>
            {sufixo}
          </span>
        )}
      </div>
    </div>
  );
}