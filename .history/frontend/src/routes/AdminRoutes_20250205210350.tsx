import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard, NewsManagement, UserManagement, RoleManagement } from '../pages/admin';
import AdminLayout from '../layouts/AdminLayout';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="news" element={<NewsManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="roles" element={<RoleManagement />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes; 