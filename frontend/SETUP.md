# Frontend Setup Guide

## Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher (comes with Node.js)

## Installation Steps

### 1. Install Node.js
Download and install from: https://nodejs.org/

Verify installation:
```powershell
node --version
npm --version
```

### 2. Install Dependencies
```powershell
cd frontend
npm install
```

This will install all packages from `package.json`:
- React & React DOM
- Material-UI (MUI)
- React Router
- Axios
- Date utilities

### 3. Configure Environment
```powershell
copy .env.example .env
```

Edit `.env` if needed:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Run Development Server
```powershell
npm start
```

Application will open at: `http://localhost:3000`

The page will reload when you make changes.

## Available Scripts

### `npm start`
Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template with RTL support
│   └── favicon.ico
├── src/
│   ├── components/         # Reusable components
│   │   └── Layout/
│   │       └── Layout.js   # Main layout with sidebar
│   ├── context/            # React contexts
│   │   └── AuthContext.js  # Authentication state
│   ├── pages/              # Page components
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Equipment/
│   │   ├── Inspections/
│   │   ├── Documents/
│   │   └── Issues/
│   ├── services/
│   │   └── api.js          # API client
│   ├── App.js              # Main app component
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── package.json
└── .env
```

## RTL (Right-to-Left) Support

The application is configured for Hebrew with RTL support:

1. HTML has `dir="rtl"` attribute
2. MUI theme is configured with `direction: 'rtl'`
3. Hebrew locale is set in theme

## Routing

Application uses React Router v6:

- `/login` - Login page
- `/` - Dashboard (requires auth)
- `/equipment` - Equipment list
- `/equipment/new` - Add new equipment
- `/equipment/:id` - Equipment details
- `/equipment/:id/edit` - Edit equipment
- `/inspections` - Inspections list
- `/documents` - Documents list
- `/issues` - Issues list

## Authentication

The app uses JWT authentication:

1. Login sends credentials to `/api/token/`
2. Receives `access` and `refresh` tokens
3. Tokens stored in localStorage
4. Access token sent in Authorization header
5. Auto-refresh on 401 response

## API Integration

All API calls go through `src/services/api.js`:

```javascript
import { equipmentAPI } from './services/api';

// List equipment
const response = await equipmentAPI.list({ status: 'active' });

// Get equipment details
const equipment = await equipmentAPI.get(id);

// Create equipment
await equipmentAPI.create(data);
```

## Styling

Using Material-UI (MUI) components:

```javascript
import { Box, Button, TextField } from '@mui/material';
```

Theme configured in `App.js` with:
- RTL direction
- Hebrew locale
- Custom colors

## Common Issues

### Issue: `npm install` fails
**Solution:**
```powershell
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: "Module not found" errors
**Solution:**
```powershell
npm install
```

### Issue: Port 3000 already in use
**Solution:**
```powershell
# Change port
set PORT=3001 && npm start

# Or kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: API calls failing (CORS)
**Solution:**
1. Ensure backend is running on port 8000
2. Check `proxy` in package.json
3. Verify CORS settings in Django

### Issue: White screen after build
**Solution:**
Check browser console for errors and ensure:
1. Backend API is accessible
2. Environment variables are set
3. Build was successful

## Development Tips

### Hot Reload
Changes to files will automatically reload the page.

### DevTools
Install React Developer Tools browser extension for debugging.

### API Testing
Use browser DevTools Network tab to inspect API calls.

### State Management
Currently using React Context for auth.
For complex state, consider Redux or Zustand.

## Building for Production

### 1. Create production build
```powershell
npm run build
```

### 2. Test production build locally
```powershell
npm install -g serve
serve -s build
```

### 3. Deploy
Upload `build/` folder to your web server.

## Environment Variables

Create `.env.production` for production:
```
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## Performance Optimization

1. Use React.memo() for expensive components
2. Implement code splitting with React.lazy()
3. Optimize images
4. Enable gzip compression
5. Use CDN for static assets

## Browser Support

Supports modern browsers:
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Path Intellisense
