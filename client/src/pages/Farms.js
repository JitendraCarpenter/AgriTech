import Crud from '../components/Crud';
import { useApp } from '../context';

export default function Farms() {
  const { t } = useApp();
  return (<><h2 className="mb-3">{t('farms')}</h2>
    <Crud endpoint="/farms" fields={[
      { name: 'name', label: t('name'), required: true }, { name: 'location', label: t('location'), required: true },
      { name: 'areaAcres', label: t('area'), type: 'number' }, { name: 'soilType', label: t('soilType'), options: ['Black', 'Red', 'Alluvial', 'Sandy', 'Loamy'] },
    ]} /></>);
}
