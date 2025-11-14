import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// ========== PALETA DE CORES PARA CADA TEMA ==========
const themes = {
  dark: {
    // Backgrounds
    bg: {
      primary: '#0f172a',      // Background principal
      secondary: '#1e293b',    // Background secundário
      tertiary: '#334155',     // Background terciário
      card: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
      hover: 'rgba(51, 65, 85, 0.6)',
    },
    
    // Textos
    text: {
      primary: '#f8fafc',      // Texto principal
      secondary: '#cbd5e1',    // Texto secundário
      tertiary: '#94a3b8',     // Texto terciário
      muted: '#64748b',        // Texto discreto
    },
    
    // Borders
    border: {
      primary: 'rgba(71, 85, 105, 0.6)',
      secondary: 'rgba(51, 65, 85, 0.4)',
      light: 'rgba(71, 85, 105, 0.3)',
    },
    
    // Cores de status (mesmas para ambos os temas)
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      purple: '#8b5cf6',
      cyan: '#06b6d4',
    },
    
    // Sombras
    shadow: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
      md: '0 4px 12px rgba(0, 0, 0, 0.3)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.4)',
    },
  },
  
  light: {
    // Backgrounds (tons bege/creme como no Pipeline)
    bg: {
      primary: '#fdfbf7',      // Background principal (bege muito claro)
      secondary: '#f5f3ef',    // Background secundário (bege claro)
      tertiary: '#ebe8e1',     // Background terciário (bege)
      card: 'linear-gradient(135deg, rgba(245, 243, 239, 0.9) 0%, rgba(235, 232, 225, 0.95) 100%)',
      hover: 'rgba(226, 220, 210, 0.6)',
      quaternary: '#e2ddd5',   // Bege médio
    },
    
    // Textos
    text: {
      primary: '#1a1511',      // Texto principal (marrom escuro)
      secondary: '#3d3530',    // Texto secundário (marrom médio)
      tertiary: '#5c5248',     // Texto terciário (marrom claro)
      muted: '#7a7065',        // Texto discreto (cinza-marrom)
    },
    
    // Borders
    border: {
      primary: 'rgba(203, 195, 180, 0.5)',
      secondary: 'rgba(226, 220, 210, 0.4)',
      light: 'rgba(235, 232, 225, 0.3)',
    },
    
    // Cores de status (mesmas para ambos os temas)
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      purple: '#8b5cf6',
      cyan: '#06b6d4',
    },
    
    // Sombras (mais suaves no tema claro)
    shadow: {
      sm: '0 2px 8px rgba(26, 21, 17, 0.06)',
      md: '0 4px 12px rgba(26, 21, 17, 0.08)',
      lg: '0 8px 24px rgba(26, 21, 17, 0.12)',
    },
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Tentar recuperar tema salvo
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // dark como padrão
  });

  // Selecionar o objeto de cores baseado no tema atual
  const colors = themes[isDark ? 'dark' : 'light'];

  useEffect(() => {
    // Aplicar tema ao documento
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Aplicar cor de fundo no body
    document.body.style.backgroundColor = colors.bg.primary;
    document.body.style.color = colors.text.primary;
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    // Salvar preferência
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark, colors]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}