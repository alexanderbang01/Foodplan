import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import AuthForm from '../components/forms/AuthForm';
import Button from '../components/ui/Button';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/Toast';
import ToastContainer from '../components/ui/Toast';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { toast } = useToast();

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = mode === 'login' 
        ? await authAPI.login(formData)
        : await authAPI.signup(formData);

      setAuth(response.data.user, response.data.token);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="bg-primary-600 p-3 rounded-xl">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Food Plan</h1>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Your Personal Meal Planner
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Plan your weekly meals, track nutrition, and maintain a healthy lifestyle 
              with our intuitive meal planning tool.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-3xl font-bold text-primary-600">500+</p>
                <p className="text-sm text-gray-600">Foods Tracked</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-3xl font-bold text-primary-600">1000+</p>
                <p className="text-sm text-gray-600">Meals Planned</p>
              </div>
            </div>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-gray-600">
                {mode === 'login' 
                  ? 'Sign in to continue to your meal planner' 
                  : 'Start planning your meals today'}
              </p>
            </div>

            <AuthForm mode={mode} onSubmit={handleSubmit} loading={loading} />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="ml-2 text-primary-600 font-medium hover:text-primary-700"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}