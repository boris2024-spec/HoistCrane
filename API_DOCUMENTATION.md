# API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

All endpoints (except `/token/`) require JWT authentication.

### Get Token (Login)
```http
POST /token/
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
```http
POST /token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Authorization Header
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Equipment Endpoints

### List Equipment
```http
GET /equipment/
Authorization: Bearer <token>

Query Parameters:
- equipment_type: crane|hoist|forklift|elevator|platform|other
- status: active|maintenance|inactive|retired
- manufacturer: string (case-insensitive)
- site_name: string (case-insensitive)
- next_inspection_from: YYYY-MM-DD
- next_inspection_to: YYYY-MM-DD
- search: string (searches number, serial, manufacturer, model)
- ordering: created_at|-created_at|equipment_number|-equipment_number

Response:
{
  "count": 100,
  "next": "http://...",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "equipment_number": "EQ-001",
      "equipment_type": "crane",
      "status": "active",
      "manufacturer": "Liebherr",
      "model": "LTM 1100",
      "serial_number": "123456",
      "site_name": "Site A",
      "next_inspection_date": "2024-12-31",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Equipment Details
```http
GET /equipment/{id}/
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "equipment_number": "EQ-001",
  "equipment_type": "crane",
  "status": "active",
  "manufacturer": "Liebherr",
  "model": "LTM 1100",
  "serial_number": "123456",
  "manufacture_year": 2020,
  "manufacture_date": "2020-05-15",
  "capacity": 100.00,
  "capacity_unit": "ton",
  "height": 50.00,
  "working_pressure": 300.00,
  "volume": 1000.00,
  "site_name": "Site A",
  "workplace_name": "Main Facility",
  "employer": "Company ABC",
  "department": "Construction",
  "location_details": "Building 3, Floor 2",
  "purchase_date": "2020-06-01",
  "installation_date": "2020-07-01",
  "last_inspection_date": "2024-01-15",
  "next_inspection_date": "2025-01-15",
  "description": "Heavy duty crane",
  "notes": "Requires special maintenance",
  "specifications": [
    {
      "id": 1,
      "key": "max_load",
      "value": "100",
      "unit": "ton"
    }
  ],
  "created_by": "uuid",
  "created_by_name": "admin",
  "updated_by": "uuid",
  "updated_by_name": "admin",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T11:00:00Z"
}
```

### Create Equipment
```http
POST /equipment/
Authorization: Bearer <token>
Content-Type: application/json

{
  "equipment_number": "EQ-002",
  "equipment_type": "hoist",
  "manufacturer": "Demag",
  "model": "DC-Pro",
  "serial_number": "SN789",
  "manufacture_year": 2023,
  "capacity": 5.00,
  "capacity_unit": "ton",
  "site_name": "Site B",
  "status": "active"
}

Response: 201 Created (same structure as GET)
```

### Update Equipment
```http
PATCH /equipment/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "maintenance",
  "notes": "Under maintenance"
}

Response: 200 OK (updated object)
```

### Delete Equipment
```http
DELETE /equipment/{id}/
Authorization: Bearer <token>

Response: 204 No Content
```

### Equipment Statistics
```http
GET /equipment/stats/
Authorization: Bearer <token>

Response:
{
  "total": 150,
  "by_type": {
    "crane": 45,
    "hoist": 60,
    "forklift": 30,
    "elevator": 10,
    "other": 5
  },
  "by_status": {
    "active": 120,
    "maintenance": 20,
    "inactive": 8,
    "retired": 2
  }
}
```

### Export Equipment to Excel
```http
GET /equipment/export_excel/
Authorization: Bearer <token>

Query Parameters: (same as list endpoint)
- All filters from equipment list are supported
- equipment_type, status, manufacturer, etc.

Response: 
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- File download with name: equipment_export_YYYYMMDD_HHMMSS.xlsx
- Contains all filtered equipment with Hebrew headers
- 22 columns with styled headers and auto-adjusted widths

Features:
- Full Unicode/UTF-8 support (Hebrew displays correctly)
- Styled headers (blue background, white text)
- Auto-adjusted column widths
- Applies current filters
```

### Export Equipment to CSV
```http
GET /equipment/export_csv/
Authorization: Bearer <token>

Query Parameters: (same as list endpoint)

Response:
- Content-Type: text/csv; charset=utf-8-sig
- File download with BOM for Excel UTF-8 support
```

### Get Equipment Inspections
```http
GET /equipment/{id}/inspections/
Authorization: Bearer <token>

Response: Array of inspection objects
```

### Get Equipment Documents
```http
GET /equipment/{id}/documents/
Authorization: Bearer <token>

Response: Array of document objects
```

### Get Equipment Issues
```http
GET /equipment/{id}/issues/
Authorization: Bearer <token>

Response: Array of issue objects
```

## Inspection Report Endpoints

### List Inspection Reports
```http
GET /inspections/reports/
Authorization: Bearer <token>

Query Parameters:
- status: draft|pending|approved|final
- equipment: uuid
- inspection_date_from: YYYY-MM-DD
- inspection_date_to: YYYY-MM-DD
- search: string

Response:
{
  "count": 50,
  "results": [
    {
      "id": "uuid",
      "report_number": "RPT-001",
      "equipment": "uuid",
      "equipment_number": "EQ-001",
      "inspection_date": "2024-01-15",
      "inspector_name": "John Doe",
      "status": "approved",
      "created_at": "2024-01-15T14:00:00Z"
    }
  ]
}
```

### Get Inspection Report Details
```http
GET /inspections/reports/{id}/
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "equipment": "uuid",
  "equipment_details": {...},
  "report_number": "RPT-001",
  "inspection_date": "2024-01-15",
  "next_inspection_date": "2025-01-15",
  "inspector_name": "John Doe",
  "inspector_license": "LIC123",
  "workplace_name": "Main Site",
  "employer": "Company ABC",
  "site": "SUB FAB",
  "fab": "FAB 1",
  "location": "Building A",
  "data": {},
  "defects_description": "No major defects",
  "no_defects_note": "Equipment in good condition",
  "repairs_required": "None",
  "general_notes": "Passed inspection",
  "pdf_file": "http://.../report.pdf",
  "source_scan": null,
  "status": "approved",
  "approved_by": "uuid",
  "approved_by_name": "admin",
  "approved_at": "2024-01-15T16:00:00Z",
  "created_by": "uuid",
  "created_by_name": "technician1",
  "items": [
    {
      "id": 1,
      "line_no": 1,
      "manufacturer": "Liebherr",
      "description": "Main crane",
      "serial_number": "123456",
      "capacity": "100 ton",
      "condition": "Good",
      "passed": true
    }
  ]
}
```

### Create Inspection Report
```http
POST /inspections/reports/
Authorization: Bearer <token>
Content-Type: application/json

{
  "equipment": "uuid",
  "report_number": "RPT-002",
  "inspection_date": "2024-01-20",
  "inspector_name": "John Doe",
  "status": "draft"
}

Response: 201 Created
```

### Generate PDF
```http
POST /inspections/reports/{id}/generate_pdf/
Authorization: Bearer <token>

Response:
{
  "message": "PDF generation will be implemented",
  "report_id": "uuid"
}
```

### Finalize Report
```http
POST /inspections/reports/{id}/finalize/
Authorization: Bearer <token>

Response: Updated report with status="final"
```

### Approve Report
```http
POST /inspections/reports/{id}/approve/
Authorization: Bearer <token>

Response: Updated report with status="approved"
```

## Document Endpoints

### List Documents
```http
GET /documents/
Authorization: Bearer <token>

Query Parameters:
- document_type: manual|certificate|inspection|warranty|maintenance|photo|drawing|other
- equipment: uuid
- uploaded_from: YYYY-MM-DD
- uploaded_to: YYYY-MM-DD

Response:
{
  "count": 200,
  "results": [
    {
      "id": "uuid",
      "equipment": "uuid",
      "equipment_number": "EQ-001",
      "title": "User Manual",
      "document_type": "manual",
      "file": "http://.../documents/EQ-001/manual/file.pdf",
      "file_extension": ".pdf",
      "description": "Equipment user manual",
      "document_date": "2020-05-01",
      "expiry_date": null,
      "file_size": 2048000,
      "mime_type": "application/pdf",
      "uploaded_by": "uuid",
      "uploaded_by_name": "admin",
      "uploaded_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Upload Document
```http
POST /documents/
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- equipment: uuid
- title: string
- document_type: string
- file: file
- description: string (optional)
- document_date: YYYY-MM-DD (optional)
- expiry_date: YYYY-MM-DD (optional)

Response: 201 Created
```

### Export Documents to Excel
```http
GET /documents/export_excel/
Authorization: Bearer <token>

Query Parameters: (same as list endpoint)
- document_type, equipment, uploaded_from, uploaded_to

Response:
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- File download with name: documents_export_YYYYMMDD_HHMMSS.xlsx
- Contains all filtered documents with Hebrew headers
- 10 columns with styled headers and auto-adjusted widths

Columns:
1. מזהה (ID)
2. כותרת (Title)
3. סוג מסמך (Document Type)
4. ציוד (Equipment)
5. תיאור (Description)
6. תאריך מסמך (Document Date)
7. תאריך תפוגה (Expiry Date)
8. גודל קובץ (File Size KB)
9. הועלה על ידי (Uploaded By)
10. תאריך העלאה (Upload Date)
```

## Issue Endpoints

### List Issues
```http
GET /issues/
Authorization: Bearer <token>

Query Parameters:
- status: open|in_progress|resolved|closed
- priority: low|medium|high|critical
- issue_type: malfunction|maintenance|safety|damage|other
- equipment: uuid
- assigned_to: uuid

Response:
{
  "count": 30,
  "results": [
    {
      "id": "uuid",
      "equipment": "uuid",
      "equipment_number": "EQ-001",
      "title": "Oil leak",
      "issue_type": "malfunction",
      "priority": "high",
      "status": "open",
      "reported_date": "2024-01-15T09:00:00Z",
      "due_date": "2024-01-20",
      "assigned_to": "uuid",
      "assigned_to_name": "technician1"
    }
  ]
}
```

### Create Issue
```http
POST /issues/
Authorization: Bearer <token>
Content-Type: application/json

{
  "equipment": "uuid",
  "title": "Hydraulic problem",
  "description": "Hydraulic system not responding",
  "issue_type": "malfunction",
  "priority": "critical",
  "assigned_to": "uuid"
}

Response: 201 Created
```

### Add Comment to Issue
```http
POST /issues/{id}/add_comment/
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "Inspected the hydraulic system"
}

Response:
{
  "id": 1,
  "comment": "Inspected the hydraulic system",
  "created_by": "uuid",
  "created_by_name": "technician1",
  "created_at": "2024-01-15T11:00:00Z"
}
```

### Resolve Issue
```http
POST /issues/{id}/resolve/
Authorization: Bearer <token>
Content-Type: application/json

{
  "resolution_notes": "Replaced hydraulic pump"
}

Response: Updated issue with status="resolved"
```

### Close Issue
```http
POST /issues/{id}/close/
Authorization: Bearer <token>

Response: Updated issue with status="closed"
```

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```
