# Cooking Time - Frontend Application

A modern React-based web application for sharing and discovering recipes with a focus on user interaction and community features.

## 📋 Features

### Authentication

- User registration and login with JWT tokens
- Automatic token refresh mechanism
- Secure token storage in localStorage
- Role-based access (User, Admin)

### Recipe Management

- Browse and search recipes with advanced filtering
- Create, edit, and delete recipes
- Upload recipe images
- Manage ingredients and cooking steps
- Rate and comment on recipes
- Add recipes to favorites
- Track cooking history

### User Features

- User profiles with customizable preferences
- Allergies and dietary restrictions tracking
- Follow/unfollow users
- View user created recipes
- Notifications system

### Smart Features

- Find recipes by ingredients
- Popular recipes discovery
- Recipe recommendations
- Comment system on recipes

### Admin Panel

- User management (block/unblock users)
- Reports management and moderation
- Category management
- Tag management

## 🛠️ Technology Stack

- **Frontend Framework**: React 19
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **UI Components**: Custom Radix UI-inspired components
- **Styling**: CSS with CSS Variables
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/
│   ├── common/              # ProtectedRoute, AdminRoute
│   ├── layout/              # Header, Layout, Footer
│   └── ui/                  # UI component library
├── config/
│   ├── api.js               # Axios configuration
│   └── constants.js         # Application constants
├── features/
│   ├── admin/               # Admin panel components
│   ├── auth/                # Login, Register pages
│   └── recipes/             # Recipe management
├── hooks/                   # Custom hooks
├── pages/                   # Page components
├── services/                # API service layer
├── store/                   # Redux store and slices
├── styles/                  # Global styles
├── utils/                   # Utility functions
├── App.jsx                  # Main app with routes
└── main.jsx                 # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. Navigate to client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. Start development server:

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📡 API Integration

All API communication is handled through the service layer. The API instance automatically:

- Includes JWT tokens in request headers
- Handles token refresh on 401 responses
- Manages error responses
- Supports multipart file uploads

Base API URL: `http://localhost:3000/api`

## 🎨 UI Component Library

Custom components following design system principles:

- **Button**: variants (primary, secondary, outline, ghost, success, danger), sizes (xs-xl)
- **Input**: sizes (sm, md, lg), error states, disabled state
- **Textarea**: rows prop, error and disabled states
- **Card**: CardHeader, CardContent, CardFooter sub-components
- **Label**: form label with htmlFor attribute
- **Badge**: variants for different notification types
- **Separator**: horizontal or vertical divider
- **Loader**: animated spinner with sizes (sm, md, lg)
- **Alert**: variants (info, success, warning, error) with icons
- **Select**: dropdown with options array
- **CheckBox**: with label and disabled state
- **RadioGroup**: radio button group with options

All components use CSS variables for theming and support consistent props.

## 🔐 State Management

Redux Toolkit store with 5 feature slices:

### authSlice

- Authentication state, user info, loading
- Thunks: loginUser, registerUser, logoutUser, refreshToken

### recipeSlice

- Recipes list, current recipe, favorites, cook history, filters
- Thunks: fetch, create, update, delete recipes with full CRUD

### userSlice

- User profile information
- Thunks: fetchUserProfile, updateUserProfile

### notificationSlice

- Notifications list and unread count
- Thunks: fetch, mark as read, mark all as read

### adminSlice

- Admin operations: user management, reports, categories, tags
- Thunks: All admin CRUD operations

## 🔒 Authentication Flow

1. User registers/logs in at `/login` or `/register`
2. Server returns `accessToken` and `refreshToken`
3. Tokens stored in localStorage
4. Axios interceptor adds JWT header to all requests
5. On 401 response: automatic token refresh
6. On refresh failure: redirect to `/login`

## 🛣️ Routes

### Public Routes

- `/` - Home page with hero and recipe grids
- `/login` - User login
- `/register` - User registration
- `/recipes` - Recipe catalog with search and filters
- `/recipes/:id` - Recipe details with comments and ratings

### Protected Routes

- `/profile/:userId` - User profile view/edit
- `/favorites` - User's saved recipes
- `/smart-recipes` - Find recipes by ingredients
- `/notifications` - User notifications
- `/add-recipe` - Create new recipe
- `/edit-recipe/:id` - Edit recipe

### Admin Routes

- `/admin` - Admin panel with management features

## 📱 Responsive Design

- Mobile-first CSS approach
- Breakpoints at 768px (tablet) and 1024px (desktop)
- Flexible Grid and Flexbox layouts
- Touch-friendly on mobile devices

## 🧪 Utilities

### Formatters

- Date/time formatting functions
- Text truncation and manipulation
- URL slug generation

### Validators

- Email and password validation
- Recipe data validation
- Input sanitization

### Custom Hooks

- `useLocalStorage()` - Persistent state in localStorage
- `useSessionStorage()` - Persistent state in sessionStorage

## 📝 Best Practices

1. **Component Naming**: Descriptive, action-oriented names
2. **Separation of Concerns**: Services for API, store for state, components for UI
3. **Form Validation**: Both client-side (React Hook Form + Zod) and server-side
4. **Loading & Error States**: Prevent duplicate submissions, provide feedback
5. **Accessibility**: Semantic HTML, ARIA labels where needed
6. **Environment Variables**: Use .env for configuration
7. **Feature-Based Structure**: Organized by feature domain

## 🐛 Common Issues

### CORS Errors

Ensure backend is running on port 3000 with CORS enabled for `http://localhost:5173`

### Authentication Issues

Clear localStorage and re-login at `/login`

### Build Errors

Run `npm install --legacy-peer-deps` to handle peer dependency conflicts

### API Connection Issues

Verify backend is running with `npm run dev` in the server directory

## 📄 License

ISC License - See LICENSE file for details
