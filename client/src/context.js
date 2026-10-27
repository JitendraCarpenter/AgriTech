import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
import { D } from './i18n';

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);

  const auth = async (path, body) => {
    const { data } = await api.post(`/auth/${path}`, body);
    localStorage.setItem('token', data.token); setUser(data.user);
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  const changeLang = l => { setLang(l); localStorage.setItem('lang', l); };
  const t = k => D[lang]?.[k] || D.en[k] || k;

  return <Ctx.Provider value={{ user, ready, auth, logout, lang, changeLang, t }}>{children}</Ctx.Provider>;
}
