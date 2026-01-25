import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './App.css'
import { router } from './app/router'
import { Toaster } from 'sonner'

function App() {
  return (
    <AuthProvider>
      <Toaster richColors closeButton position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
