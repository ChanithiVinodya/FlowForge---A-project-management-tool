import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

// Pages - lazy loading would be better for production, but using direct imports for simplicity now
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProjectPage from '../pages/ProjectPage';
import BoardPage from '../pages/BoardPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import NotificationsPage from '../pages/NotificationsPage';
import SearchPage from '../pages/SearchPage';
import NotFoundPage from '../pages/NotFoundPage';
import LandingPage from '../pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout children={<Outlet />} />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/projects/:projectId', element: <ProjectPage /> },
          { path: '/projects/:projectId/boards/:boardId', element: <BoardPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/search', element: <SearchPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
