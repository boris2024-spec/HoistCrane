# Hoist & Crane Equipment Management System

מערכת ניהול ציוד הרמה - SaaS מודרני בסגנון Datwise

## 🚀 Overview

מערכת מקיפה לניהול ציוד הרמה (מנופים, מעליות, מלגזות וכו') עם:
- ניהול ציוד מלא (Equipment Management)
- תסקירי בדיקה (Inspection Reports) עם יצירת PDF
- ניהול מסמכים (Documents)
- מעקב תקלות (Issues/Incidents)
- Dashboard ודוחות
- הרשאות משתמשים (RBAC)

## 🛠️ Tech Stack

### Backend
- **Django 4.2** + **Django REST Framework**
- **PostgreSQL** - Database
- **JWT Authentication** - Simple JWT
- **WeasyPrint** - PDF Generation
- **Python 3.10+**

### Frontend
- **React 18** + **React Router**
- **Material-UI (MUI)** - Datwise-style UI
- **Axios** - API Client
- **DataGrid** - Tables

## 📁 Project Structure

```
Hoist&Crane/
├── backend/                    # Django Backend
│   ├── hoistcraneproject/     # Main Django project
│   │   ├── settings.py        # Django settings with PostgreSQL
│   │   ├── urls.py            # Main URL routing
│   │   └── ...
│   ├── equipment/             # Equipment app
│   │   ├── models.py          # Equipment, EquipmentSpecification
│   │   ├── serializers.py     # DRF Serializers
│   │   ├── views.py           # ViewSets with filtering
│   │   └── urls.py
│   ├── inspections/           # Inspections app
│   │   ├── models.py          # InspectionReport, InspectionReportItem, Inspection
│   │   ├── serializers.py
│   │   ├── views.py           # With PDF generation endpoint
│   │   └── urls.py
│   ├── documents/             # Documents app
│   │   ├── models.py          # Document model with file upload
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── issues/                # Issues/Problems app
│   │   ├── models.py          # Issue, IssueComment
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── users/                 # Users app
│   │   ├── models.py          # CustomUser with roles
│   │   └── ...
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                   # React Frontend
    ├── public/
    │   └── index.html         # RTL Hebrew support
    ├── src/
    │   ├── components/        # Reusable components
    │   │   └── Layout/
    │   │       └── Layout.js  # Sidebar + AppBar
    │   ├── context/
    │   │   └── AuthContext.js # Authentication context
    │   ├── pages/             # Page components
    │   │   ├── Dashboard.js   # Main dashboard with stats
    │   │   ├── Login.js       # Login page
    │   │   ├── Equipment/     # Equipment pages
    │   │   ├── Inspections/   # Inspection pages
    │   │   ├── Documents/     # Documents pages
    │   │   └── Issues/        # Issues pages
    │   ├── services/
    │   │   └── api.js         # Axios API client
    │   ├── App.js             # Main App with routing
    │   └── index.js
    └── package.json
```

## 🔧 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. **Create virtual environment:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

2. **Install dependencies:**
```powershell
pip install -r requirements.txt
```

3. **Create PostgreSQL database:**
```sql
CREATE DATABASE hoistcrane_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE hoistcrane_db TO postgres;
```

4. **Configure environment:**
```powershell
copy .env.example .env
# Edit .env with your database credentials
```

5. **Run migrations:**
```powershell
python manage.py makemigrations
python manage.py migrate
```

6. **Create superuser:**
```powershell
python manage.py createsuperuser
```

7. **Run development server:**
```powershell
python manage.py runserver
```

Backend will run on: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin`

### Frontend Setup

1. **Install dependencies:**
```powershell
cd frontend
npm install
```

2. **Run development server:**
```powershell
npm start
```

Frontend will run on: `http://localhost:3000`

## 📊 Database Models

### Equipment
- Equipment details (manufacturer, model, serial number)
- Technical specifications (capacity, height, pressure)
- Location and ownership
- Inspection dates
- Status tracking

### InspectionReport
- Full inspection report (תסקיר בדיקה)
- Report items table
- JSON data storage for flexibility
- PDF generation support
- Status workflow (draft → pending → approved → final)

### Document
- File upload with categorization
- Multiple document types (manuals, certificates, photos)
- Expiry date tracking
- Equipment association

### Issue
- Problem/incident tracking
- Priority and status management
- Assignment workflow
- Comments and resolution notes

### Users
- Custom user model with roles
- RBAC (Admin, Manager, Technician, Viewer)

## 🔌 API Endpoints

### Authentication
- `POST /api/token/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh token
- `GET /api/users/me/` - Get current user

### Equipment
- `GET /api/equipment/` - List equipment (with filters)
- `POST /api/equipment/` - Create equipment
- `GET /api/equipment/{id}/` - Get equipment details
- `PATCH /api/equipment/{id}/` - Update equipment
- `DELETE /api/equipment/{id}/` - Delete equipment
- `GET /api/equipment/stats/` - Get statistics

### Inspections
- `GET /api/inspections/reports/` - List reports
- `POST /api/inspections/reports/` - Create report
- `GET /api/inspections/reports/{id}/` - Get report
- `POST /api/inspections/reports/{id}/generate_pdf/` - Generate PDF
- `POST /api/inspections/reports/{id}/finalize/` - Finalize report
- `POST /api/inspections/reports/{id}/approve/` - Approve report

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Upload document
- `GET /api/documents/{id}/` - Get document
- `DELETE /api/documents/{id}/` - Delete document

### Issues
- `GET /api/issues/` - List issues
- `POST /api/issues/` - Create issue
- `GET /api/issues/{id}/` - Get issue
- `POST /api/issues/{id}/add_comment/` - Add comment
- `POST /api/issues/{id}/resolve/` - Resolve issue
- `POST /api/issues/{id}/close/` - Close issue

## 🎨 Features

### ✅ Implemented
- Full CRUD for Equipment
- User authentication (JWT)
- Equipment list with DataGrid
- Equipment detail view with tabs
- Equipment form (create/edit)
- Dashboard with statistics
- Responsive layout with MUI
- RTL support for Hebrew
- API filtering and search
- Role-based access control

### 🚧 Next Phase
- Inspection report form (one-to-one replica)
- PDF generation with WeasyPrint
- Document upload interface
- Issue tracking interface
- Advanced filtering
- Export to Excel
- Email notifications
- Audit logs

## 🔐 Default Credentials

After creating superuser, use those credentials to login.

## 📝 Notes

- RTL (Right-to-Left) support for Hebrew is built-in
- All dates are in Israel timezone (Asia/Jerusalem)
- File uploads go to `backend/media/` directory
- API uses JWT for authentication
- CORS is configured for localhost:3000

## 🐛 Troubleshooting

### Backend Issues
- Make sure PostgreSQL is running
- Check database credentials in `.env`
- Run migrations if models changed

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check proxy settings in package.json
- Ensure backend is running on port 8000

## 📞 Support

For questions or issues, please check the documentation or contact the development team.

---

**Built with ❤️ for lifting equipment management**
