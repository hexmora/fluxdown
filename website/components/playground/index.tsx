import { useLocale } from '../hooks';
import { Editor } from './components';

export const Playground = () => {
  const { lang } = useLocale();

  return <Editor key={lang} lang={lang} />;
};
