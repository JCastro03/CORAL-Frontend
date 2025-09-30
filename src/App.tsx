import { useState } from 'react'
import { LoginPage } from './pages/Login';

export type UserRole = 'ra' | 'scheduling_admin' | 'full_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

function App() {
  

  return (
    <>
      <LoginPage />
    </>
  )
}

export default App
