import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import MealPlanner from './pages/MealPlanner';
import Pantry from './pages/Pantry';
import Settings from './pages/Settings';
import AuthLayout from './components/layout/AuthLayout';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AuthLayout>
                <Dashboard />
              </AuthLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/foods"
          element={
            <PrivateRoute>
              <AuthLayout>
                <Foods />
              </AuthLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/meal-planner"
          element={
            <PrivateRoute>
              <AuthLayout>
                <MealPlanner />
              </AuthLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/pantry"
          element={
            <PrivateRoute>
              <AuthLayout>
                <Pantry />
              </AuthLayout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AuthLayout>
                <Settings />
              </AuthLayout>
            </PrivateRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;