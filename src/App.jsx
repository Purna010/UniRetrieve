import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import PageLayout from './components/layout/PageLayout';

import HomePage from './pages/HomePage';
import BrowseItemsPage from './pages/BrowseItemsPage';
import ReportItemPage from './pages/ReportItemPage';
import MatchResultPage from './pages/MatchResultPage';
import ChatPage from './pages/ChatPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyItemsPage from './pages/MyItemsPage';
import AuthPage from './pages/AuthPage';
import { useApp } from './context/AppContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser } = useApp();
  if (!currentUser) return <AuthPage />;
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function AppContent() {
  const { currentUser } = useApp();
  
  if (!currentUser) return <AuthPage />;

  return (
    <Routes>
      <Route path="/" element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="items" element={<BrowseItemsPage />} />
        <Route path="report" element={<ReportItemPage />} />
        <Route path="match/:matchId" element={<MatchResultPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:chatId" element={<ChatPage />} />
        <Route path="admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="my-items" element={<MyItemsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
