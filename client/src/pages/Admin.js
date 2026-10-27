import { useEffect, useState } from 'react';
import Crud from '../components/Crud';
import api, { msg } from '../api';
import { useApp } from '../context';

const TABS = ['overview', 'users', 'orders', 'resources', 'pest alerts'];

export default function Admin() {
  const { t, user } = useApp();
  const [tab, setTab] = useState('overview'), [stats, setStats] = useState({}), [users, setUsers] = useState([]), [orders, setOrders] = useState([]), [err, setErr] = useState('');
  const load = () => { api.get('/admin/stats').then(r => setStats(r.data)); api.get('/admin/users').then(r => setUsers(r.data)); api.get('/orders').then(r => setOrders(r.data)); };
  useEffect(load, []);
  const run = p => p.then(load).catch(e => setErr(msg(e)));
  return (<>
    <h2 className="mb-3">{t('admin')}</h2>
    <div className="btn-group mb-3 flex-wrap">{TABS.map(x => <button key={x} className={`btn btn-${tab === x ? 'primary' : 'outline-primary'}`} onClick={() => setTab(x)}>{x}</button>)}</div>
    {err && <div className="alert alert-danger">{err}</div>}
    {tab === 'overview' && <div className="row g-3">{Object.entries(stats).map(([k, v]) => <div className="col-6 col-md-4" key={k}><div className="panel"><div className="h2 mb-0">{v}</div>{k}</div></div>)}</div>}
    {tab === 'users' && <div className="panel table-responsive"><table className="table align-middle mb-0"><tbody>{users.map(u => (
      <tr key={u._id}><td>{u.name}<div className="small text-muted">{u.email}</div></td>
        <td><select className="form-select form-select-sm" disabled={u._id === user.id} value={u.role} onChange={e => run(api.patch(`/admin/users/${u._id}/role`, { role: e.target.value }))}><option>farmer</option><option>admin</option></select></td>
        <td className="text-end">{u._id !== user.id && <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm(`Delete ${u.name}?`) && run(api.delete(`/admin/users/${u._id}`))}>{t('delete')}</button>}</td></tr>))}</tbody></table></div>}
    {tab === 'orders' && <div className="panel table-responsive"><table className="table align-middle mb-0"><tbody>{orders.map(o => (
      <tr key={o._id}><td>{o.user?.name}<div className="small text-muted">{o.items.map(l => `${l.qty}× ${l.name}`).join(', ')}</div></td><td>₹{o.total}</td>
        <td><select className="form-select form-select-sm" value={o.status} onChange={e => run(api.patch(`/orders/${o._id}/status`, { status: e.target.value }))}>
          {['pending', 'approved', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s}>{s}</option>)}</select></td></tr>))}</tbody></table></div>}
    {tab === 'resources' && <Crud endpoint="/resources" fields={[{ name: 'name', label: t('name'), required: true }, { name: 'category', label: 'Category', options: ['seed', 'fertilizer', 'pesticide', 'tool'], required: true },
      { name: 'price', label: 'Price ₹', type: 'number', required: true }, { name: 'stock', label: 'Stock', type: 'number' }]} />}
    {tab === 'pest alerts' && <Crud endpoint="/alerts" fields={[{ name: 'region', label: t('region'), required: true }, { name: 'pest', label: 'Pest or disease', required: true },
      { name: 'crop', label: t('crop') }, { name: 'severity', label: 'Severity', options: ['low', 'medium', 'high'] }, { name: 'message', label: t('message') }]} />}
  </>);
}
