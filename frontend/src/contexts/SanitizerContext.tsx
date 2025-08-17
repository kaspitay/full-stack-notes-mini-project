import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SanitizerContextType {
  isSanitizerEnabled: boolean;
  toggleSanitizer: () => void;
}

const SanitizerContext = createContext<SanitizerContextType | undefined>(undefined);

export const useSanitizer = () => {
  const context = useContext(SanitizerContext);
  if (!context) {
    throw new Error('useSanitizer must be used within a SanitizerProvider');
  }
  return context;
};

interface SanitizerProviderProps {
  children: ReactNode;
}

export const SanitizerProvider: React.FC<SanitizerProviderProps> = ({ children }) => {
  const [isSanitizerEnabled, setIsSanitizerEnabled] = useState(true); // Default to ON for security

  const toggleSanitizer = () => {
    setIsSanitizerEnabled(prev => !prev);
  };

  return (
    <SanitizerContext.Provider value={{ isSanitizerEnabled, toggleSanitizer }}>
      {children}
    </SanitizerContext.Provider>
  );
};
