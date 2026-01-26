# Deploy ConfessUNI to Digital Ocean

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. Create Digital Ocean App

1. Go to [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Connect your GitHub account
4. Select the `confessuni` repository
5. It will auto-detect the Dockerfile

### 3. Configure Environment Variables

Add these environment variables in Digital Ocean App Settings:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | (Auto-filled if you add a database) |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-domain.com` |

### 4. Add PostgreSQL Database

1. In your App, click **Add Resource** → **Database**
2. Select **PostgreSQL** (Dev Database is $0/month for testing)
3. Digital Ocean will auto-inject `DATABASE_URL`

### 5. Deploy

Click **Deploy** and wait ~5 minutes.

### 6. Run Database Migrations

After first deploy, go to **Console** tab and run:
```bash
npx prisma db push
```

### 7. Connect Your Domain

1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `confessuni.com`)
3. Update your domain's DNS:
   - Add a CNAME record pointing to the DO app URL

---

## Estimated Costs

| Resource | Cost |
|----------|------|
| App (Basic) | $5/month |
| PostgreSQL (Dev) | $0/month (free tier) |
| **Total** | ~$5/month |

---

## Custom Domain Setup

After buying your domain:

1. In Digital Ocean: **Settings** → **Domains** → **Add Domain**
2. In your domain registrar, add DNS records:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: your-app-xxxxx.ondigitalocean.app
   ```

SSL certificate is automatic!

---

## Troubleshooting

**Build fails?**
- Check the build logs in Digital Ocean
- Make sure all env variables are set

**Database connection error?**
- Verify DATABASE_URL is set
- Run `npx prisma db push` in Console

**Auth not working?**
- Verify NEXTAUTH_URL matches your domain
- Verify NEXTAUTH_SECRET is set
