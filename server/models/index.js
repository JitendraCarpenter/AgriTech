const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const { Schema, model } = mongoose, ref = n => ({ type: Schema.Types.ObjectId, ref: n, required: true });

const userSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  region: String,
}, { timestamps: true });
userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.matches = function (p) { return bcrypt.compare(p, this.password); };

const farmSchema = new Schema({
  owner: ref('User'), name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  areaAcres: { type: Number, min: 0 },
  soilType: { type: String, enum: ['Black', 'Red', 'Alluvial', 'Sandy', 'Loamy'] },
}, { timestamps: true });
farmSchema.post('findOneAndDelete', d => d && model('Crop').deleteMany({ farm: d._id }));

const cropSchema = new Schema({
  owner: ref('User'), farm: ref('Farm'), name: { type: String, required: true, trim: true },
  sownOn: Date, expectedHarvest: Date,
  status: { type: String, enum: ['planned', 'growing', 'harvested'], default: 'planned' },
  soil: { ph: { type: Number, min: 0, max: 14 }, nitrogen: Number, phosphorus: Number, potassium: Number, moisture: { type: Number, min: 0, max: 100 } },
  logs: [{ date: { type: Date, default: Date.now }, note: String }],
}, { timestamps: true });

const resourceSchema = new Schema({
  name: { type: String, required: true }, category: { type: String, enum: ['seed', 'fertilizer', 'pesticide', 'tool'], required: true },
  price: { type: Number, required: true, min: 0 }, stock: { type: Number, default: 0, min: 0 }, description: String,
}, { timestamps: true });

const orderSchema = new Schema({
  user: ref('User'),
  items: [{ resource: Schema.Types.ObjectId, name: String, qty: Number, price: Number }],
  total: Number,
  status: { type: String, enum: ['pending', 'approved', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
}, { timestamps: true });

const weatherSchema = new Schema({
  region: String, date: String, tempC: Number, humidity: Number, rainfallMm: Number, condition: String,
}, { timestamps: true });
weatherSchema.index({ region: 1, date: 1 }, { unique: true });

const alertSchema = new Schema({
  region: { type: String, required: true }, crop: String, pest: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, message: String,
}, { timestamps: true });

const postSchema = new Schema({
  author: ref('User'), title: { type: String, required: true, trim: true }, body: { type: String, required: true },
  type: { type: String, enum: ['forum', 'consultation'], default: 'forum' },
  replies: [{ author: { type: Schema.Types.ObjectId, ref: 'User' }, body: String, createdAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

module.exports = {
  User: model('User', userSchema), Farm: model('Farm', farmSchema), Crop: model('Crop', cropSchema),
  Resource: model('Resource', resourceSchema), Order: model('Order', orderSchema),
  WeatherData: model('WeatherData', weatherSchema), PestAlert: model('PestAlert', alertSchema), Post: model('Post', postSchema),
};
