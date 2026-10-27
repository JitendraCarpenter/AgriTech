import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';
import { useApp } from '../context';

export default function Dashboard() {
  const { t, user } = useApp();
  const [farms, setFarms] = useState([]), [crops, setCrops] = useState([]), [w, setW] = useState(null);
  useEffect(() => {
    (async () => {
      const [f, c] = await Promise.all([api.get('/farms'), api.get('/crops')]);
      setFarms(f.data); setCrops(c.data);
      api.get('/weather', { params: { city: f.data[0]?.location } }).then(r => setW(r.data)).catch(() => {});
    })();
  }, []);
  const today = w?.days[0], latest = crops.find(c => c.soil?.ph != null), s = latest?.soil;
  const soil = s ? [['pH ×10', s.ph * 10], ['N', s.nitrogen], ['P', s.phosphorus], ['K', s.potassium], ['Moisture %', s.moisture]].filter(x => x[1] != null).map(([k, v]) => ({ k, v })) : [];
  return (<>
    <div className="field-report mb-4">
      <div><div className="temp">{today ? `${Math.round(today.tempC)}°` : '--'}</div><div>{w?.city} · {today?.condition}</div></div>
      <div className="flex-grow-1"><h1 className="h4">{t('dashboard')}, {user.name}</h1>
        <p className="mb-0">{w?.advisories[0] || (w ? 'No weather risks flagged today.' : 'Add a farm to see a local forecast.')}</p></div>
    </div>
    <div className="row g-3">
      <div className="col-md-4"><div className="panel"><div className="h2 mb-0">{farms.length}</div>{t('farms')}</div></div>
      <div className="col-md-4"><div className="panel"><div className="h2 mb-0">{crops.length}</div>{t('crops')}</div></div>
      <div className="col-md-4"><div className="panel"><div className="h2 mb-0">{crops.filter(c => c.status === 'growing').length}</div>Growing now</div></div>
      <div className="col-12"><div className="panel" style={{ height: 300 }}>
        <h3 className="h5">{latest ? `Soil readings: ${latest.name}` : 'Soil readings'}</h3>
        {soil.length ? <ResponsiveContainer width="100%" height="85%"><BarChart data={soil}><XAxis dataKey="k" /><YAxis /><Tooltip /><Bar dataKey="v" fill="#2f6b3a" /></BarChart></ResponsiveContainer>
          : <p className="text-muted">Add soil readings to a crop to see them charted here.</p>}</div></div>
    </div>
  </>);
}
