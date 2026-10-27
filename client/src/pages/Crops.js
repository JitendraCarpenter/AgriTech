import { useState } from 'react';
import Crud from '../components/Crud';
import api, { msg } from '../api';
import { useApp } from '../context';

export default function Crops() {
  const { t } = useApp();
  const [tips, setTips] = useState(null), [err, setErr] = useState('');
  const analyse = r => api.get(`/crops/${r._id}/analysis`).then(x => setTips({ name: r.name, list: x.data })).catch(e => setErr(msg(e)));
  return (<>
    <h2 className="mb-3">{t('crops')}</h2>
    {err && <div className="alert alert-danger">{err}</div>}
    {tips && (
      <div className="panel mb-4"><h3 className="h5">{tips.name}</h3>
        {tips.list.map((x, i) => <p key={i} className={`mb-2 tip-${x.level}`}>{x.text}</p>)}</div>
    )}
    <Crud endpoint="/crops" actions={r => <button className="btn btn-sm btn-success" onClick={() => analyse(r)}>{t('analyse')}</button>} fields={[
      { name: 'name', label: t('crop'), required: true },
      { name: 'farm', label: t('farm'), from: '/farms', required: true, show: r => r.farm?.name },
      { name: 'sownOn', label: t('sownOn'), type: 'date' },
      { name: 'status', label: t('status'), options: ['planned', 'growing', 'harvested'] },
      { name: 'soil.ph', label: 'pH', type: 'number' }, { name: 'soil.nitrogen', label: 'N (kg/ha)', type: 'number' },
      { name: 'soil.phosphorus', label: 'P (kg/ha)', type: 'number' }, { name: 'soil.potassium', label: 'K (kg/ha)', type: 'number' },
      { name: 'soil.moisture', label: 'Moisture %', type: 'number' },
    ]} />
  </>);
}
