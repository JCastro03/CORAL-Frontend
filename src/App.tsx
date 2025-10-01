import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage } from './components/pages/LoginPage';
import { Dashboard } from './components/pages/Dashboard';
import { CalendarView } from './components/pages/CalendarView';
import { ResearchAssistants } from './components/pages/ResearchAssistants';
import { StudyShifts } from './components/pages/StudyShifts';
import { Navbar } from './components/ui/Navbar';
import { Toaster } from './components/ui/sonner';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/assistants" element={<ResearchAssistants />} />
                <Route path="/shifts" element={<StudyShifts />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}
