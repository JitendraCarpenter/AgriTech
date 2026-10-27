import { useEffect, useState } from 'react';
import api, { msg } from '../api';
import { useApp } from '../context';

export default function Community() {
  const { t, user } = useApp();
  const [posts, setPosts] = useState([]), [f, setF] = useState({ title: '', body: '', type: 'forum' }), [rep, setRep] = useState({}), [err, setErr] = useState('');
  const load = () => api.get('/posts').then(r => setPosts(r.data));
  useEffect(() => { load(); }, []);
  const run = fn => async e => { e?.preventDefault(); setErr(''); try { await fn(); load(); } catch (x) { setErr(msg(x)); } };
  return (<>
    <h2 className="mb-3">{t('community')}</h2>
    <form className="panel mb-4" onSubmit={run(async () => { await api.post('/posts', f); setF({ title: '', body: '', type: 'forum' }); })}>
      <div className="row g-2">
        <div className="col-md-8"><input className="form-control" placeholder={t('title')} required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
        <div className="col-md-4"><select className="form-select" value={f.type} onChange={e => setF({ ...f, type: e.target.value })}><option value="forum">Discussion</option><option value="consultation">Ask an expert</option></select></div>
        <div className="col-12"><textarea className="form-control" rows="2" placeholder={t('message')} required value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /></div>
      </div>
      {err && <div className="alert alert-danger mt-2 mb-0">{err}</div>}
      <button className="btn btn-primary mt-3">{t('post')}</button>
    </form>
    {posts.map(p => (
      <div className="panel mb-3" key={p._id}>
        <div className="d-flex justify-content-between"><h3 className="h5">{p.title} {p.type === 'consultation' && <span className="badge text-bg-warning">Expert</span>}</h3>
          {(user.role === 'admin' || p.author?._id === user.id) && <button className="btn btn-sm btn-outline-danger" onClick={run(() => api.delete(`/posts/${p._id}`))}>{t('delete')}</button>}</div>
        <p className="mb-1">{p.body}</p><div className="small text-muted mb-2">{p.author?.name} · {new Date(p.createdAt).toLocaleDateString()}</div>
        {p.replies.map(r => <p key={r._id} className="ms-3 mb-1 tip-ok"><strong>{r.author?.name}{r.author?.role === 'admin' && ' (expert)'}:</strong> {r.body}</p>)}
        <form className="d-flex gap-2 mt-2" onSubmit={run(async () => { await api.post(`/posts/${p._id}/reply`, { body: rep[p._id] }); setRep({ ...rep, [p._id]: '' }); })}>
          <input className="form-control form-control-sm" placeholder={t('reply')} value={rep[p._id] || ''} onChange={e => setRep({ ...rep, [p._id]: e.target.value })} /><button className="btn btn-sm btn-outline-primary">{t('reply')}</button>
        </form>
      </div>))}
    {!posts.length && <p className="text-muted">No posts yet. Ask the first question.</p>}
  </>);
}
