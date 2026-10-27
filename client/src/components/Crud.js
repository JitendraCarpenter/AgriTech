import { useEffect, useState } from 'react';
import api, { msg } from '../api';
import { useApp } from '../context';

const get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const set = (o, p, v) => { const c = structuredClone(o), ks = p.split('.'); let x = c; ks.slice(0, -1).forEach(k => (x = x[k] ||= {})); x[ks.at(-1)] = v; return c; };

// fields: [{ name ('soil.ph' allowed), label, type, options[], from ('/farms'), required, show(row) }]
export default function Crud({ endpoint, fields, actions }) {
  const { t } = useApp();
  const [rows, setRows] = useState([]), [opts, setOpts] = useState({}), [form, setForm] = useState({}), [editing, setEditing] = useState(null), [err, setErr] = useState('');

  const load = () => api.get(endpoint).then(r => setRows(r.data)).catch(e => setErr(msg(e)));
  useEffect(() => {
    load();
    fields.filter(f => f.from).forEach(f => api.get(f.from).then(r => setOpts(o => ({ ...o, [f.name]: r.data }))));
    // eslint-disable-next-line
  }, [endpoint]);

  const reset = () => { setForm({}); setEditing(null); };
  const save = async e => {
    e.preventDefault(); setErr('');
    const body = fields.reduce((b, f) => { const v = get(form, f.name); return v === undefined || v === '' ? b : set(b, f.name, f.type === 'number' ? Number(v) : v); }, {});
    try { editing ? await api.put(`${endpoint}/${editing}`, body) : await api.post(endpoint, body); reset(); load(); }
    catch (x) { setErr(msg(x)); }
  };
  const edit = r => {
    setEditing(r._id);
    setForm(fields.reduce((b, f) => { let v = get(r, f.name); if (f.from) v = v?._id || v; if (f.type === 'date' && v) v = v.slice(0, 10); return v == null ? b : set(b, f.name, v); }, {}));
  };
  const del = async r => { if (window.confirm('Delete this record?')) { await api.delete(`${endpoint}/${r._id}`).catch(x => setErr(msg(x))); load(); } };
  const cell = (r, f) => f.show ? f.show(r) : f.type === 'date' ? (get(r, f.name) || '').slice(0, 10) : get(r, f.name);

  return (
    <>
      <form className="panel mb-4" onSubmit={save}>
        <div className="row g-3">
          {fields.map(f => (
            <div className="col-md-4 col-sm-6" key={f.name}>
              <label className="form-label">{f.label}</label>
              {f.options || f.from ? (
                <select className="form-select" required={f.required} value={get(form, f.name) ?? ''} onChange={e => setForm(set(form, f.name, e.target.value))}>
                  <option value="">—</option>
                  {f.from ? (opts[f.name] || []).map(o => <option key={o._id} value={o._id}>{o.name}</option>) : f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input className="form-control" type={f.type || 'text'} step="any" required={f.required} value={get(form, f.name) ?? ''} onChange={e => setForm(set(form, f.name, e.target.value))} />
              )}
            </div>
          ))}
        </div>
        {err && <div className="alert alert-danger mt-3 mb-0">{err}</div>}
        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary">{t('save')}</button>
          {editing && <button type="button" className="btn btn-outline-secondary" onClick={reset}>{t('cancel')}</button>}
        </div>
      </form>
      <div className="panel table-responsive">
        <table className="table align-middle mb-0">
          <thead><tr>{fields.map(f => <th key={f.name}>{f.label}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id}>
                {fields.map(f => <td key={f.name}>{cell(r, f)}</td>)}
                <td className="text-end text-nowrap">
                  {actions?.(r)}
                  <button className="btn btn-sm btn-outline-primary ms-1" onClick={() => edit(r)}>{t('edit')}</button>
                  <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => del(r)}>{t('delete')}</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={fields.length + 1} className="text-muted">Nothing here yet. Use the form above to add the first record.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
