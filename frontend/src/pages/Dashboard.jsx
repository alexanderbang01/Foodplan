import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Calendar, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PageLoader } from '../components/ui/Loader';
import { userAPI } from '../lib/api';
import { getWeekStartDate, formatWeekRange } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await userAPI.getStats();
      return response.data.stats;
    },
  });

  if (isLoading) return <PageLoader />;

  const statCards = [
    {
      title: 'Saved Foods',
      value: stats?.total_foods || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Meal Plans',
      value: stats?.total_plans || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'This Week',
      value: `${stats?.current_week_entries || 0} meals`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const quickActions = [
    {
      title: 'Add Food',
      description: 'Add a new food item to your collection',
      icon: Plus,
      action: () => navigate('/foods'),
      color: 'bg-primary-600',
    },
    {
      title: 'Plan This Week',
      description: 'Create your meal plan for this week',
      icon: Calendar,
      action: () => navigate('/meal-planner'),
      color: 'bg-green-600',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Overview of your meal planning activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover>
              <CardContent className="flex items-center gap-4">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card hover className="cursor-pointer" onClick={action.action}>
                <CardContent className="flex items-start gap-4">
                  <div className={`${action.color} p-3 rounded-lg flex-shrink-0`}>
                    <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Week Info */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                Current Week
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {formatWeekRange(getWeekStartDate())}
              </p>
            </div>
            <Button onClick={() => navigate('/meal-planner')} className="w-full sm:w-auto">
              View Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}