# KTU BizConnect - Local Development Setup Guide (Windows)

## Prerequisites

### 1. Install Node.js
- Download Node.js (v18 or higher) from [nodejs.org](https://nodejs.org/)
- Choose the LTS version for Windows
- Verify installation: Open Command Prompt and run:
  ```bash
  node --version
  npm --version
  ```

### 2. Install PostgreSQL on Windows
- Download PostgreSQL from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
- Run the installer and follow these steps:
  - Choose installation directory (default is fine)
  - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
  - Set data directory (default is fine)
  - **Important**: Set a password for the postgres superuser (remember this!)
  - Set port (default 5432 is fine)
  - Choose locale (default is fine)
- After installation, PostgreSQL should start automatically

### 3. Install Git (if not already installed)
- Download from [git-scm.com](https://git-scm.com/download/win)
- Use default settings during installation

## Project Setup

### 1. Clone the Repository
Open Command Prompt or PowerShell and run:
```bash
git clone https://github.com/IsraelTech-Pro/Biz-connect-complete.git
cd Biz-connect-complete
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Create Local Database
1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to PostgreSQL using the password you set during installation
3. Right-click on "Databases" → "Create" → "Database..."
4. Name: `ktu_bizconnect_local`
5. Click "Save"

**Alternative: Using Command Line**
```bash
# Open Command Prompt as Administrator
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE ktu_bizconnect_local;
\q
```

### 4. Environment Configuration

Create a `.env` file in the project root with your local database settings:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/ktu_bizconnect_local
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=YOUR_POSTGRES_PASSWORD
PGDATABASE=ktu_bizconnect_local

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Development Environment
NODE_ENV=development
```

**Replace `YOUR_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation.**

### 5. Database Schema Setup

Run the database migrations to create tables:
```bash
npm run db:push
```

This will create all necessary tables in your local database.

### 6. Verify Database Connection

You can verify the database setup by checking if tables were created:
1. Open pgAdmin 4
2. Navigate to: Servers → PostgreSQL → Databases → ktu_bizconnect_local → Schemas → public → Tables
3. You should see tables like: users, products, businesses, sessions, etc.

## Running the Application

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Access the Application
- Open your browser and go to: `http://localhost:5000`
- You should see the KTU BizConnect homepage

### 3. Create Admin Account (Optional)
To access admin features, you'll need to create an admin account directly in the database:

1. Open pgAdmin 4
2. Navigate to your database → Schemas → public → Tables → users
3. Right-click on "users" → "View/Edit Data" → "All Rows"
4. Add a new row with admin role, or use SQL:

```sql
INSERT INTO users (email, password_hash, full_name, role, is_approved) 
VALUES ('admin@ktu.edu.gh', 'hashed_password', 'Admin User', 'admin', true);
```

## Development Workflow

### Project Structure
```
ktu-bizconnect/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── server/                 # Backend Express application
│   ├── db.ts              # Database configuration
│   ├── routes.ts          # API routes
│   └── storage.ts         # Database operations
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
└── uploads/               # File uploads directory
```

### Development Commands

```bash
# Start development server (runs both frontend and backend)
npm run dev

# Database commands
npm run db:push          # Push schema changes to database
npm run db:studio        # Open database studio (if available)

# Build for production
npm run build

# Type checking
npm run type-check
```

### Common Development Tasks

#### Adding New Features
1. Update database schema in `shared/schema.ts`
2. Run `npm run db:push` to update database
3. Add API routes in `server/routes.ts`
4. Create frontend components in `client/src/`
5. Test functionality

#### Database Changes
- Always update schema in `shared/schema.ts` first
- Use `npm run db:push` to apply changes
- Never manually edit database structure

#### File Uploads
- Images and files are stored in the `uploads/` directory
- Ensure this directory has proper write permissions

## Troubleshooting

### Common Issues

#### Port Already in Use
If you get "EADDRINUSE" error:
```bash
# Windows: Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

#### Database Connection Issues
1. Verify PostgreSQL is running:
   - Check Services: `services.msc` → Look for "postgresql-x64-xx"
   - Start if stopped
2. Check your .env file credentials
3. Ensure database exists in pgAdmin

#### Permission Issues
- Run Command Prompt as Administrator
- Ensure uploads directory has write permissions

#### Module Not Found Errors
```bash
# Clear node modules and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

### Database Reset
If you need to reset your database:
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE ktu_bizconnect_local;
CREATE DATABASE ktu_bizconnect_local;
\q

# Rerun migrations
npm run db:push
```

## Production Considerations

### Environment Variables
For production deployment, update:
- `DATABASE_URL`: Production database connection
- `SESSION_SECRET`: Strong, unique secret key
- `NODE_ENV=production`

### Security
- Change default passwords
- Use environment variables for sensitive data
- Enable HTTPS in production
- Set proper CORS policies

### Performance
- Enable database connection pooling
- Configure caching strategies
- Optimize images and assets
- Use CDN for static files

## Getting Help

### Documentation
- Main application guide: `KTU_BIZCONNECT_COMPLETE_GUIDE.md`
- Project overview: `replit.md`

### Database Management
- Use pgAdmin 4 for visual database management
- Command line: `psql -U postgres -d ktu_bizconnect_local`

### Logs and Debugging
- Server logs appear in the terminal where you ran `npm run dev`
- Browser console shows frontend errors
- Database logs in PostgreSQL log files

## Next Steps

1. **Set up the development environment** following the steps above
2. **Create test data** by registering users and businesses
3. **Explore the codebase** to understand the application structure
4. **Start developing** new features or modifications
5. **Test thoroughly** before deploying to production

Your local development environment should now be fully functional and ready for development!