// Simple rule-based soil health advice (thresholds follow typical Indian soil-health-card ranges).
module.exports = ({ ph, nitrogen, phosphorus, potassium, moisture } = {}) => {
  const tips = [], add = (level, text) => tips.push({ level, text });
  if (ph != null) ph < 6 ? add('warn', `Soil is acidic (pH ${ph}). Apply agricultural lime.`)
    : ph > 7.8 ? add('warn', `Soil is alkaline (pH ${ph}). Add gypsum or compost.`) : add('ok', `pH ${ph} is in a healthy range.`);
  [['Nitrogen', nitrogen, 280, 'urea or farmyard manure'], ['Phosphorus', phosphorus, 11, 'DAP or single super phosphate'], ['Potassium', potassium, 120, 'muriate of potash']]
    .forEach(([n, v, min, fix]) => { if (v != null) v < min ? add('warn', `${n} is low (${v} kg/ha). Add ${fix}.`) : add('ok', `${n} is sufficient.`); });
  if (moisture != null) moisture < 20 ? add('warn', `Moisture is ${moisture}%. Irrigate soon.`)
    : moisture > 60 ? add('warn', `Moisture is ${moisture}%. Improve drainage.`) : add('ok', `Moisture ${moisture}% is good.`);
  return tips.length ? tips : [{ level: 'info', text: 'Add soil readings to this crop to get advice.' }];
};
