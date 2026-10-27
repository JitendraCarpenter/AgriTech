import { useEffect, useState } from 'react';
import api, { msg } from '../api';
import { useApp } from '../context';

export default function Shop() {
  const { t } = useApp();
  const [items, setItems] = useState([]), [orders, setOrders] = useState([]), [cart, setCart] = useState({}), [err, setErr] = useState('');
  const load = () => { api.get('/resources').then(r => setItems(r.data)); api.get('/orders').then(r => setOrders(r.data)); };
  useEffect(load, []);
  const lines = items.filter(i => cart[i._id] > 0), total = lines.reduce((s, i) => s + i.price * cart[i._id], 0);
  const place = async () => { setErr(''); try { await api.post('/orders', { items: lines.map(i => ({ resource: i._id, qty: cart[i._id] })) }); setCart({}); load(); } catch (e) { setErr(msg(e)); } };
  const cancel = id => api.patch(`/orders/${id}/cancel`).then(load).catch(e => setErr(msg(e)));
  return (<>
    <h2 className="mb-3">{t('shop')}</h2>
    {err && <div className="alert alert-danger">{err}</div>}
    <div className="panel table-responsive mb-3"><table className="table align-middle mb-0">
      <tbody>{items.map(i => (
        <tr key={i._id}><td>{i.name}<div className="small text-muted">{i.category} · {i.stock} in stock</div></td><td>₹{i.price}</td>
          <td style={{ width: 110 }}><input type="number" min="0" max={i.stock} className="form-control" aria-label={`Quantity of ${i.name}`} value={cart[i._id] || ''} onChange={e => setCart({ ...cart, [i._id]: Number(e.target.value) })} /></td></tr>))}
        {!items.length && <tr><td className="text-muted">The shop has no items yet. An admin can add them.</td></tr>}</tbody></table></div>
    <div className="d-flex align-items-center gap-3 mb-4"><strong>{t('cart')}: ₹{total}</strong><button className="btn btn-primary" disabled={!lines.length} onClick={place}>{t('order')}</button></div>
    <h3 className="h5">{t('orders')}</h3>
    <div className="panel">{orders.map(o => (
      <div key={o._id} className="d-flex justify-content-between border-bottom py-2">
        <span>{new Date(o.createdAt).toLocaleDateString()} · {o.items.map(l => `${l.qty}× ${l.name}`).join(', ')} · ₹{o.total}</span>
        <span><span className="badge text-bg-secondary me-2">{o.status}</span>{o.status === 'pending' && <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(o._id)}>{t('cancel')}</button>}</span>
      </div>))}{!orders.length && <p className="text-muted mb-0">No orders yet.</p>}</div>
  </>);
}
