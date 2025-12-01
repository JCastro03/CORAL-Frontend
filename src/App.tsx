import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/pages/LoginPage';
import { RAProfile } from './components/pages/RAProfile';
import { AdminProfile } from './components/pages/AdminProfile';
import { Dashboard } from './components/pages/Dashboard';
import { Toaster } from './components/ui/sonner';
import type { User } from './components/utils/Users';

// function ProtectedRoute({ children, user }: { children: React.ReactNode; user: User | null }) {
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   return <>{children}</>;
// }

// function DashboardRoute({ user, onLogout }: { user: User | null; onLogout: () => void }) {
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (user.role === 'ra') {
//     return <RAProfile user={user} onLogout={onLogout} />;
//   }

//   return <AdminProfile user={user} onLogout={onLogout} />;
// }

// function AppRoutes({ 
//   currentUser, 
//   setCurrentUser 
// }: { 
//   currentUser: User | null; 
//   setCurrentUser: (user: User | null) => void;
// }) {
//   const navigate = useNavigate();

//   const handleLogin = (user: User) => {
//     setCurrentUser(user);
//     localStorage.setItem('currentUser', JSON.stringify(user));
//     navigate('/dashboard');
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     localStorage.removeItem('currentUser');
//     navigate('/login');
//   };

//   return (
//     <Routes>
//       <Route 
//         path="/login" 
//         element={
//           currentUser ? (
//             <Navigate to="/dashboard" replace />
//           ) : (
//             <LoginPage onLogin={handleLogin} />
//           )
//         } 
//       />
//       <Route 
//         path="/dashboard" 
//         element={
//           <ProtectedRoute user={currentUser}>
//             <DashboardRoute user={currentUser} onLogout={handleLogout} />
//           </ProtectedRoute>
//         } 
//       />
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />
//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// }

// export default function App() {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const storedUser = localStorage.getItem('currentUser');
//     if (storedUser) {
//       try {
//         setCurrentUser(JSON.parse(storedUser));
//       } catch (e) {
//         localStorage.removeItem('currentUser');
//       }
//     }
//     setIsLoading(false);
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-lg">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <Router>
//       <AppRoutes currentUser={currentUser} setCurrentUser={setCurrentUser} />
//       <Toaster />
//     </Router>
//   );
// }

// export default function App() {
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [currentPage, setCurrentPage] = useState<'login' | 'profile'>('login');

//   const handleLogin = (user: User) => {
//     setCurrentUser(user);
//     setCurrentPage('profile');
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setCurrentPage('login');
//   };

  // if (currentPage === 'login') {
  //   return (
  //     <>
  //       <LoginPage onLogin={handleLogin} />
  //       <Toaster />
  //     </>
  //   );
  // }

  // if (currentUser?.role === 'ra') {
  //   return (
  //     <>
  //       <RAProfile user={currentUser} onLogout={handleLogout} />
  //       <Toaster />
  //     </>
  //   );
  // }

  // return (
  //   <>
  //     <AdminProfile user={currentUser!} onLogout={handleLogout} />
  //     <Toaster />
  //   </>
//   );
// }
// import Profile from "./components/pages/Profile"
import { Profile } from "./components/pages/Profile";


export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
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

  return (
    <>
      <Profile user={currentUser} onLogout={handleLogout} />
      <Toaster />
    </>
  );

}
