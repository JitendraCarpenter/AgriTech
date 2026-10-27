const r = require('express').Router(), axios = require('axios');
const { WeatherData } = require('../models'), { protect } = require('../middleware/auth'), { h } = require('../utils/crud');
const avg = a => Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10;

const sample = () => Array.from({ length: 5 }, (_, i) => {
  const d = new Date(Date.now() + i * 864e5).toISOString().slice(0, 10);
  return { date: d, tempC: 27 + ((i * 3) % 7), humidity: 58 + i * 7, rainfallMm: i === 3 ? 24 : 0, condition: i === 3 ? 'Rain' : 'Clear' };
});

// Turn forecast numbers into plain-language farm advice
const advise = days => days.flatMap(d => {
  const a = [], tag = x => a.push(`${d.date}: ${x}`);
  if (d.humidity > 80 && d.tempC >= 22 && d.tempC <= 32) tag('Warm and humid. Watch for fungal disease such as blight or rust.');
  if (d.rainfallMm > 20) tag('Heavy rain expected. Hold off on spraying and check field drainage.');
  if (d.tempC > 38) tag('Heat stress risk. Irrigate in the evening.');
  if (d.tempC < 8) tag('Frost risk. Cover young plants.');
  return a;
});

r.get('/', protect, h(async (q, s) => {
  const city = q.query.city || q.user.region || 'Bhopal';
  let days, source = 'sample';
  if (process.env.OPENWEATHER_KEY) {
    try {
      const { data } = await axios.get('https://api.openweathermap.org/data/2.5/forecast', { params: { q: city, units: 'metric', appid: process.env.OPENWEATHER_KEY } });
      const by = {};
      data.list.forEach(i => (by[i.dt_txt.slice(0, 10)] ||= []).push(i));
      days = Object.entries(by).map(([date, a]) => ({
        date, tempC: avg(a.map(i => i.main.temp)), humidity: avg(a.map(i => i.main.humidity)),
        rainfallMm: a.reduce((t, i) => t + (i.rain?.['3h'] || 0), 0), condition: a[0].weather[0].main,
      }));
      source = 'openweathermap';
    } catch (e) {
      if (e.response?.status === 404) return s.status(404).json({ message: `Could not find "${city}". Check the spelling.` });
      throw e;
    }
  } else days = sample();
  await WeatherData.bulkWrite(days.map(d => ({ updateOne: { filter: { region: city, date: d.date }, update: { $set: d }, upsert: true } })));
  s.json({ city, source, days, advisories: advise(days) });
}));
module.exports = r;
