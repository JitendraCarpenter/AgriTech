import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api, { msg } from '../api';
import { useApp } from '../context';

export default function Weather() {
  const { t, user } = useApp();
  const [city, setCity] = useState(user.region || ''), [w, setW] = useState(null), [alerts, setAlerts] = useState([]), [err, setErr] = useState('');
  const fetchWeather = () => { setErr(''); api.get('/weather', { params: { city } }).then(r => setW(r.data)).catch(e => setErr(msg(e))); };
  useEffect(() => { fetchWeather(); api.get('/alerts').then(r => setAlerts(r.data)); /* eslint-disable-next-line */ }, []);
  return (<>
    <h2 className="mb-3">{t('weather')}</h2>
    <form className="d-flex gap-2 mb-3" onSubmit={e => { e.preventDefault(); fetchWeather(); }}>
      <input className="form-control" placeholder={t('city')} value={city} onChange={e => setCity(e.target.value)} aria-label={t('city')} />
      <button className="btn btn-primary text-nowrap">{t('search')}</button>
    </form>
    {err && <div className="alert alert-danger">{err}</div>}
    {w && <>
      {w.source === 'sample' && <div className="alert alert-warning">Showing sample data. Add OPENWEATHER_KEY to server/.env for live forecasts.</div>}
      <div className="panel mb-4" style={{ height: 300 }}>
        <ResponsiveContainer><LineChart data={w.days}><XAxis dataKey="date" tickFormatter={d => d.slice(5)} /><YAxis /><Tooltip /><Legend />
          <Line dataKey="tempC" name="Temp °C" stroke="#c0392b" /><Line dataKey="humidity" name="Humidity %" stroke="#2f6b3a" /><Line dataKey="rainfallMm" name="Rain mm" stroke="#2c7fb8" /></LineChart></ResponsiveContainer>
      </div>
      <div className="panel mb-4"><h3 className="h5">{t('advisories')}</h3>
        {w.advisories.length ? w.advisories.map((a, i) => <p key={i} className="mb-2 tip-warn">{a}</p>) : <p className="mb-0 tip-ok">No weather risks flagged for this period.</p>}</div>
    </>}
    <div className="panel"><h3 className="h5">Pest alerts</h3>
      {alerts.filter(a => !city || a.region.toLowerCase() === city.toLowerCase()).map(a => (
        <p key={a._id} className="mb-2"><span className={`sev-${a.severity}`}>{a.severity}</span> · {a.pest}{a.crop && ` on ${a.crop}`} in {a.region}. {a.message}</p>
      ))}
      {!alerts.some(a => !city || a.region.toLowerCase() === city.toLowerCase()) && <p className="text-muted mb-0">No pest alerts for {city || 'your area'}.</p>}</div>
  </>);
}
