# Backend Setup Guide

## Prerequisites
- Python 3.10 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)

## Installation Steps

### 1. Create Virtual Environment
```powershell
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment
```powershell
# Windows PowerShell
.\venv\Scripts\activate

# Windows CMD
venv\Scripts\activate.bat

# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database

#### Option A: Using psql
```sql
CREATE DATABASE hoistcrane_db;
CREATE USER hoistcrane_user WITH PASSWORD 'your_password';
ALTER ROLE hoistcrane_user SET client_encoding TO 'utf8';
ALTER ROLE hoistcrane_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE hoistcrane_user SET timezone TO 'Asia/Jerusalem';
GRANT ALL PRIVILEGES ON DATABASE hoistcrane_db TO hoistcrane_user;
```

#### Option B: Using pgAdmin
1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name: `hoistcrane_db`
4. Create user with appropriate permissions

### 5. Configure Environment Variables
```powershell
copy .env.example .env
```

Edit `.env` file with your settings:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=hoistcrane_db
DB_USER=hoistcrane_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### 6. Run Migrations
```powershell
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser
```powershell
python manage.py createsuperuser
```
Follow prompts to create admin account.

### 8. Load Initial Data (Optional)
```powershell
# If you have fixtures
python manage.py loaddata initial_data.json
```

### 9. Run Development Server
```powershell
python manage.py runserver
```

Server will be available at: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin`

## Testing API

### Using Browser
Navigate to: `http://localhost:8000/api/`
You'll see DRF browsable API.

### Using curl
```powershell
# Get token
curl -X POST http://localhost:8000/api/token/ -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"yourpassword\"}"

# Use token
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:8000/api/equipment/
```

## Common Issues

### Issue: `ModuleNotFoundError: No module named 'psycopg2'`
**Solution:**
```powershell
pip install psycopg2-binary
```

### Issue: Database connection error
**Solution:**
1. Check PostgreSQL is running
2. Verify database credentials in `.env`
3. Check PostgreSQL is listening on correct port (default: 5432)

### Issue: `django.db.migrations.exceptions.InconsistentMigrationHistory`
**Solution:**
```powershell
python manage.py migrate --fake-initial
```

### Issue: Static files not loading
**Solution:**
```powershell
python manage.py collectstatic
```

## Useful Commands

### Create New App
```powershell
python manage.py startapp appname
```

### Make Migrations
```powershell
python manage.py makemigrations
python manage.py migrate
```

### Create Admin User
```powershell
python manage.py createsuperuser
```

### Run Tests
```powershell
python manage.py test
```

### Django Shell
```powershell
python manage.py shell
```

### Check Database
```powershell
python manage.py dbshell
```

## Production Deployment

### 1. Update settings for production
- Set `DEBUG=False`
- Update `ALLOWED_HOSTS`
- Use environment variables for secrets

### 2. Collect static files
```powershell
python manage.py collectstatic --noinput
```

### 3. Use production-grade server
```powershell
pip install gunicorn
gunicorn hoistcraneproject.wsgi:application --bind 0.0.0.0:8000
```

### 4. Setup PostgreSQL backup
```powershell
pg_dump hoistcrane_db > backup.sql
```

## Security Checklist
- [ ] Change SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Use HTTPS
- [ ] Enable CSRF protection
- [ ] Set secure cookie flags
- [ ] Regular security updates
