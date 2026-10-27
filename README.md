# Agri-Tech: smart farm management (MERN)

Farmers manage farms, crops and soil health, see weather forecasts with pest advice, buy farm supplies, and ask the community or experts. Admins manage users, orders, the shop catalogue and pest alerts.

## Run it
Needs Node 16+ and MongoDB (local or Atlas).

```bash
# 1. API
cd server && npm install
cp .env.example .env        # set MONGO_URI and JWT_SECRET
npm run seed                # creates admin (see .env) and sample shop items
npm run dev                 # http://localhost:5000

# 2. Web app (new terminal)
cd client && npm install
cp .env.example .env
npm start                   # http://localhost:3000
```
Live weather: put a free OpenWeatherMap key in `OPENWEATHER_KEY`. Without it, sample data is shown.

## How it maps to the brief
| Brief | Where |
|---|---|
| Collections: Users, Farms, Crops, Orders, Weather Data | `server/models/index.js` (plus Resource, PestAlert, Post) |
| JWT + roles + bcrypt | `middleware/auth.js`, `routes/auth.js` (bcryptjs, 12 rounds) |
| CRUD, validation | `utils/crud.js`, express-validator, Mongoose validators |
| Soil analysis, weather, pest alerts | `utils/soil.js`, `routes/weather.js`, `routes/alerts.js` |
| Orders and tracking | `routes/orders.js` (stock check, cancel, admin approval) |
| Community and expert help | `routes/posts.js` |
| Logging and error handling | morgan, `middleware/error.js` |
| Multilingual UI (English, Hindi) | `client/src/i18n.js` |
| Lazy loading, charts, Axios | `client/src/App.js`, Recharts, `api.js` |

## API (all under /api, Bearer token except auth)
`POST /auth/register|login`, `GET /auth/me` · `/farms`, `/crops` (GET, POST, PUT/:id, DELETE/:id), `GET /crops/:id/analysis` · `GET /weather?city=` · `/alerts`, `/resources` (read: all, write: admin) · `/orders` (+ `PATCH /:id/cancel`, admin `PATCH /:id/status`) · `/posts` (+ `POST /:id/reply`) · admin: `GET /admin/stats|users`, `PATCH /admin/users/:id/role`, `DELETE /admin/users/:id`

Test with Postman: register, copy the token, send it as `Authorization: Bearer <token>`.
