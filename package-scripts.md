# Package Scripts Reference

## Available NPM Scripts

### Development
```bash
npm run dev          # Start development server (frontend + backend)
npm start           # Same as npm run dev
```

### Database
```bash
npm run db:push     # Push schema changes to database
npm run db:generate # Generate migration files (if needed)
```

### Build & Production
```bash
npm run build       # Build for production
npm run preview     # Preview production build
```

### Type Checking
```bash
npm run type-check  # Check TypeScript types
```

## Local Development Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   copy .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

3. **Create database:**
   - Open pgAdmin 4
   - Create database: `ktu_bizconnect_local`

4. **Setup database schema:**
   ```bash
   npm run db:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Access application:**
   - Open browser to: http://localhost:5000

## Environment Variables Required

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ktu_bizconnect_local
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=ktu_bizconnect_local
SESSION_SECRET=your-secret-key
NODE_ENV=development
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process
taskkill /PID <PID> /F
```

### Database Connection Issues
- Ensure PostgreSQL service is running
- Check credentials in .env file
- Verify database exists
- Test connection in pgAdmin

### Module Issues
```bash
# Clear and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```