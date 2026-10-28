import messages from './en.json';

export const useTranslation = () => ({
  t: (key: string) => {
    const value = key.split('.').reduce<unknown>((current, part) => {
      return current && typeof current === 'object' ? (current as Record<string, unknown>)[part] : undefined;
    }, messages);
    return typeof value === 'string' ? value : key;
  },
});
