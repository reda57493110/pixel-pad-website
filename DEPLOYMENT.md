# Deployment Guide - COD Computer Shop

This guide provides step-by-step instructions for deploying the COD Computer Shop website to various hosting platforms.

## Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Application tested locally (`npm start`)
- [ ] Database initialized with sample data
- [ ] Admin credentials updated (if needed)
- [ ] Environment variables configured

## Local Testing

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Access the website:**
   - Open browser to `http://localhost:3000`
   - Test all features: browsing, cart, checkout, admin panel

3. **Test user journey:**
   - Browse products
   - Add items to cart
   - Complete checkout with COD
   - Login to admin panel
   - Update order status

## Deployment Options

### Option 1: Heroku (Recommended for beginners)

1. **Install Heroku CLI:**
   - Download from: https://devcenter.heroku.com/articles/heroku-cli

2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key-here
   heroku config:set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

5. **Open your app:**
   ```bash
   heroku open
   ```

### Option 2: DigitalOcean App Platform

1. **Create a new app:**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository

2. **Configure build settings:**
   - Build command: `npm install`
   - Run command: `npm start`
   - Environment: Node.js

3. **Set environment variables:**
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: production

4. **Deploy:**
   - Click "Create Resources"
   - Wait for deployment to complete

### Option 3: Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure environment variables:**
   - Go to Vercel dashboard
   - Add `JWT_SECRET` and `NODE_ENV`

### Option 4: AWS EC2

1. **Launch EC2 instance:**
   - Choose Ubuntu Server
   - Configure security groups (port 3000)

2. **Connect and setup:**
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```

3. **Deploy application:**
   ```bash
   git clone your-repo
   cd cod-computer-shop
   npm install
   npm start
   ```

4. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "cod-shop"
   pm2 startup
   pm2 save
   ```

### Option 5: Shared Hosting (cPanel)

1. **Upload files:**
   - Upload all project files to your hosting directory

2. **Install Node.js:**
   - Use cPanel's Node.js selector
   - Set Node.js version to 14+

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start application:**
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file for production:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

## Database Considerations

### SQLite (Current Setup)
- **Pros:** Simple, no external dependencies
- **Cons:** Not suitable for high-traffic production
- **Use case:** Small to medium websites

### Production Database Options

1. **PostgreSQL (Recommended):**
   ```bash
   npm install pg
   ```
   - Update database connection in `server.js`
   - Use connection pooling for better performance

2. **MySQL:**
   ```bash
   npm install mysql2
   ```
   - Popular choice for web applications
   - Good performance and reliability

3. **MongoDB:**
   ```bash
   npm install mongodb
   ```
   - NoSQL database
   - Good for flexible data structures

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backup strategy

## Performance Optimization

1. **Enable compression:**
   ```bash
   npm install compression
   ```

2. **Add caching headers:**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1d'
   }));
   ```

3. **Database indexing:**
   - Add indexes for frequently queried fields
   - Optimize database queries

4. **CDN Integration:**
   - Use CloudFlare or AWS CloudFront
   - Serve static assets from CDN

## Monitoring and Maintenance

1. **Health checks:**
   - Add `/health` endpoint
   - Monitor server uptime

2. **Logging:**
   ```bash
   npm install winston
   ```
   - Implement proper logging
   - Monitor error rates

3. **Backup strategy:**
   - Regular database backups
   - File system backups
   - Test restore procedures

## Custom Domain Setup

1. **Purchase domain:**
   - Choose a domain registrar
   - Select appropriate domain name

2. **DNS configuration:**
   - Point A record to your server IP
   - Add CNAME for www subdomain

3. **SSL certificate:**
   - Use Let's Encrypt (free)
   - Or purchase from domain registrar

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database connection errors:**
   - Check database file permissions
   - Verify database path

3. **Module not found errors:**
   ```bash
   npm install
   ```

4. **Permission errors:**
   ```bash
   chmod +x server.js
   ```

### Logs and Debugging

1. **Check application logs:**
   ```bash
   pm2 logs cod-shop
   ```

2. **Debug mode:**
   ```bash
   DEBUG=* npm start
   ```

## Post-Deployment Testing

1. **Functional testing:**
   - [ ] All pages load correctly
   - [ ] Product browsing works
   - [ ] Cart functionality
   - [ ] Checkout process
   - [ ] Admin panel access
   - [ ] Order management

2. **Performance testing:**
   - [ ] Page load times
   - [ ] Database response times
   - [ ] Mobile responsiveness

3. **Security testing:**
   - [ ] Admin authentication
   - [ ] Input validation
   - [ ] SQL injection protection

## Maintenance Schedule

- **Daily:** Monitor server uptime and error logs
- **Weekly:** Check database performance and backup
- **Monthly:** Update dependencies and security patches
- **Quarterly:** Review and optimize performance

## Support and Documentation

- Keep deployment documentation updated
- Document any custom configurations
- Maintain contact information for technical support
- Regular backup of configuration files

---

**Note:** Always test your deployment in a staging environment before going live with production data.

