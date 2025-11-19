import React, { useState } from 'react';
import { LoginPage } from './components/pages/LoginPage';
import { RAProfile } from './components/pages/RAProfile';
import { AdminProfile } from './components/pages/AdminProfile';
import { Toaster } from './components/ui/sonner';
import type { User } from './components/utils/Users'


export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'login' | 'profile'>('login');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  if (currentUser?.role === 'ra') {
    return (
      <>
        <RAProfile user={currentUser} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AdminProfile user={currentUser!} onLogout={handleLogout} />
      <Toaster />
    </>
  );
}
