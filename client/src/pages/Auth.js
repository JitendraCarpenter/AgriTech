import { useState } from 'react';
import { useApp } from '../context';
import { msg } from '../api';

export default function Auth() {
  const { auth, t, lang, changeLang } = useApp();
  const [mode, setMode] = useState('login'), [f, setF] = useState({ name: '', email: '', password: '', region: '' }), [err, setErr] = useState('');
  const on = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setErr('');
    try { await auth(mode, mode === 'login' ? { email: f.email, password: f.password } : { ...f, language: lang }); }
    catch (x) { setErr(msg(x)); }
  };
  return (
    <div className="auth-wrap">
      <form className="panel" style={{ width: 380 }} onSubmit={submit}>
        <h1 className="h3 fw-bold mb-3">Agri-Tech</h1>
        {mode === 'register' && <>
          <label className="form-label">{t('name')}</label><input className="form-control mb-3" required value={f.name} onChange={on('name')} />
          <label className="form-label">{t('region')}</label><input className="form-control mb-3" value={f.region} onChange={on('region')} />
        </>}
        <label className="form-label">{t('email')}</label><input className="form-control mb-3" type="email" required value={f.email} onChange={on('email')} />
        <label className="form-label">{t('password')}</label><input className="form-control mb-3" type="password" minLength={6} required value={f.password} onChange={on('password')} />
        {err && <div className="alert alert-danger">{err}</div>}
        <button className="btn btn-primary w-100">{t(mode)}</button>
        <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? t('noAccount') : t('haveAccount')}
        </button>
        <select className="form-select form-select-sm mt-2" value={lang} onChange={e => changeLang(e.target.value)} aria-label={t('language')}>
          <option value="en">English</option><option value="hi">हिन्दी</option>
        </select>
      </form>
    </div>
  );
}
