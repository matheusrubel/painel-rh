import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Tentar recuperar tema salvo
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // dark como padrão
  });

  useEffect(() => {
    // Aplicar tema ao documento
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Salvar preferência
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
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