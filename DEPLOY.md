# CutKing — VPS deploy

Ikki qism: **cut-king** (Express API + `/admin` EJS panel, PM2 ostida) va
**cutking-react** (statik build, Nginx beradi). Baza — MongoDB Atlas.

Tavsiya etilgan tuzilma:

| Manzil | Nima |
| --- | --- |
| `https://cutking.uz` | React SPA (`/var/www/cutking`) |
| `https://api.cutking.uz` | Backend API, `/admin` panel, `/uploads` rasmlar → `127.0.0.1:3009` |

Domen bo'lmasa: frontend `http://<IP>` da, backend `http://<IP>:3009` da ishlaydi
(portni `ufw allow 3009` bilan oching). Bir xil IP da portlar farq qilsa ham cookie ishlaydi.

---

## 1. Serverni tayyorlash (Ubuntu 22.04/24.04, bir marta)

```bash
sudo apt update && sudo apt install -y git nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2 yarn
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

MongoDB Atlas → **Network Access** → VPS IP manzilini qo'shing.

## 2. Backend

```bash
cd ~ && git clone https://github.com/jmukhammadsodikh-cloud/cut-king.git
cd cut-king && git checkout develop      # yoki master (merge qilingandan keyin)
cp .env.example .env && nano .env        # MONGO_URL, SECRET'lar, CLIENT_URL
npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save && pm2 startup                  # chiqqan buyruqni ishga tushiring
```

Mavjud rasmlarni kompyuterdan VPS ga ko'chiring (`uploads/` gitda yo'q):

```bash
# Mac'dan:
rsync -avz ~/Desktop/MIT-projects/cut-king/uploads/ user@<IP>:~/cut-king/uploads/
```

## 3. Frontend

```bash
cd ~ && git clone <cutking-react repo URL> && cd cutking-react
echo "REACT_APP_API_URL=https://api.cutking.uz" > .env.production
yarn install --frozen-lockfile && yarn build
sudo mkdir -p /var/www/cutking && sudo cp -r build/* /var/www/cutking/
```

## 4. Nginx + SSL

```bash
sudo cp ~/cut-king/deploy/nginx.conf /etc/nginx/sites-available/cutking
sudo nano /etc/nginx/sites-available/cutking        # domenlarni almashtiring
sudo ln -s /etc/nginx/sites-available/cutking /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cutking.uz -d www.cutking.uz -d api.cutking.uz
```

SSL dan keyin backend `.env` da `COOKIE_SECURE=true` qiling va `pm2 restart cut-king`.

## 5. Yangilash (keyingi deploylar)

```bash
cd ~/cut-king && git pull && npm ci && npm run build && pm2 restart cut-king
cd ~/cutking-react && git pull && yarn install --frozen-lockfile && yarn build \
  && sudo cp -r build/* /var/www/cutking/
```

Loglar: `pm2 logs cut-king`

## `.env` o'zgaruvchilari

| Kalit | Izoh |
| --- | --- |
| `PORT` | 3009 (nginx shu portga proxy qiladi) |
| `MONGO_URL` | Atlas connection string |
| `SESSION_SECRET`, `SECRET_TOKEN` | `openssl rand -hex 32` bilan yarating |
| `CLIENT_URL` | Frontend manzili, CORS uchun (`https://cutking.uz`) |
| `COOKIE_SECURE` | HTTPS bo'lganda `true` |
| `COOKIE_SAMESITE` | Odatda `lax`; frontend va API butunlay boshqa domenda bo'lsa `none` |
