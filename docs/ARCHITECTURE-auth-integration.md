# Authentication Architecture

## Overview
SportsProd ERP uses `core-erp` as the centralized authentication system. This keeps authentication logic DRY across all Huntington ERP applications while allowing app-specific customizations.

## Package Structure

```
core-erp/                    # Central auth package (github.com/coreymckeon/core-erp)
├── src/auth/                # JWT, sessions, middleware, password utils
│   ├── jwt.ts              # Token generation/verification
│   ├── password.ts         # Hashing, validation
│   ├── middleware.ts       # authenticate(), requireRole()
│   └── session.ts          # Session management
├── src/ui/                  # React components
│   ├── AuthContext.tsx     # AuthProvider, useAuth hook
│   ├── LoginForm.tsx       # Reusable login form
│   └── UserTable.tsx       # User management table
└── src/api/                 # Express middleware, error handling

sportsprod-erp/              # This application
├── uses core-erp/auth       # Via npm/GitHub package
├── wraps AuthProvider       # For app-specific config
└── implements ProtectedRoute # Route guards using useAuth
```

## Integration Pattern

### 1. Install core-erp

```json
{
  "dependencies": {
    "@huntington/core-erp": "github:coreymckeon/core-erp#main"
  }
}
```

### 2. Wrap App with AuthProvider

```tsx
import { AuthProvider } from '@huntington/core-erp/ui';

function App() {
  return (
    <AuthProvider apiBasePath="/api/auth">
      <BrowserRouter>
        <Routes>...</Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### 3. Create Login Page using LoginForm

```tsx
import { LoginForm } from '@huntington/core-erp/ui';
import { useAuth } from '@huntington/core-erp/ui';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm
        onSubmit={login}
        onSuccess={({ mustChangePassword }) => {
          if (mustChangePassword) {
            navigate('/change-password');
          } else {
            navigate('/');
          }
        }}
        title="SportsProd ERP"
        submitLabel="Sign In"
      />
    </div>
  );
}
```

### 4. Implement Protected Routes

```tsx
import { useAuth } from '@huntington/core-erp/ui';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user && !requiredRole.includes(user.role_name || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

### 5. Add Logout Functionality

```tsx
import { useAuth } from '@huntington/core-erp/ui';

function UserMenu() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect handled by ProtectedRoute
  };

  return (
    <div>
      <span>{user?.first_name} {user?.last_name}</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Full system access | All features, user management |
| `analyst` | Financial analyst | View dashboards, run projections, edit data |
| `viewer` | Read-only access | View dashboards and reports only |

## API Endpoints (from core-erp/api)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user, returns access token + sets refresh cookie |
| `/api/auth/logout` | POST | Invalidate session |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/refresh` | POST | Refresh access token using refresh cookie |
| `/api/auth/change-password` | POST | Change password (required on first login) |

## Security Considerations

1. **Access tokens** are short-lived (15 min) and stored in memory
2. **Refresh tokens** are HTTP-only cookies, preventing XSS
3. **CSRF protection** via SameSite cookie attribute
4. **Password requirements** enforced by core-erp: 8+ chars, complexity rules
5. **Rate limiting** on login endpoint (implemented in core-erp/api)

## Backend Integration

SportsProd backend must proxy or mount core-erp auth routes:

```ts
import { authRouter, authenticate, requireRole } from '@huntington/core-erp/api';

// Mount auth routes
app.use('/api/auth', authRouter);

// Protect API endpoints
app.get('/api/projections', authenticate, requireRole(['admin', 'analyst']), handler);
```

## Migration Plan

1. Install core-erp package
2. Add AuthProvider to App.tsx
3. Create LoginPage using LoginForm
4. Wrap existing routes with ProtectedRoute
5. Add user menu with logout
6. Update backend to use core-erp middleware
7. Test all authentication flows
