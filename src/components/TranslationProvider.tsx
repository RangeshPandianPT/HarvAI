import React from 'react';
import { TranslationContext, useTranslationState } from '@/hooks/useTranslation';
import { Language } from '@/i18n/translations';

interface TranslationProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  initialLanguage = 'english' 
}) => {
  const translationState = useTranslationState(initialLanguage);

  return (
    <TranslationContext.Provider value={translationState}>
      {children}
    </TranslationContext.Provider>
  );
};