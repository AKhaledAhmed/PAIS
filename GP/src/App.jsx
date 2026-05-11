import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Layout from './Pages/Layout/Layout'
import Login from './Pages/Login/Login'
import Register from './Pages/Register/Register'
import NotFound from './Pages/NotFound/NotFound'
import LandingPage from './Pages/LandingPage/LandingPage'
import FindMedicinePage from './Pages/FindMedicinePage/FindMedicinePage'
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard'
import PharmacistDashboard from './Pages/PharmacyDashboard/PharmacistDashboard'
import DashboardLayout from './Pages/DashboardLayout/DashboardLayout'
import MedicineDetails from './Pages/MedicineDetails/MedicineDetails';
import PharmacyDetails from './Pages/PharmacyDetails/PharmacyDetails'
import { AuthProvider } from './Context/AuthContext'
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute' 
import SelectRole from './Pages/SelectRolePage/SelectRolePage'
import { Toaster } from 'react-hot-toast'
import Profile from './Pages/Profile/Profile'
import InventoryPage from './Pages/InventoryPage/InventoryPage'
import InventoryFormPage from './Pages/InventoryFormPage/InventoryFormPage'
import BulkUploadPage from './Pages/BulkUploadPage/BulkUploadPage'

const router = createBrowserRouter([
  {
    path: '',
    element: <Layout />,   
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'find-medicine', element: <ProtectedRoute allowedRoles={['client']} >
        <FindMedicinePage />
      </ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute>
        <Profile/>
      </ProtectedRoute> },
      { path: 'medicine/:id', element: <MedicineDetails /> },
      { path: 'pharmacy/:id', element: <PharmacyDetails /> },
      {path:'select-role', element:<SelectRole/>},
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: 'pharmacist',
    
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),       
    children: [
      { index: true, element: <PharmacistDashboard /> },
       { path: 'inventory', element: <InventoryPage /> },
    { path: 'bulk-upload', element: <BulkUploadPage /> },
    { path: 'inventory/edit/:drugId', element: <InventoryFormPage /> },
     { path: 'inventory/add', element: <InventoryFormPage /> },
        { path: 'profile', element: <Profile /> }

    ],
  },
  {
    path: 'admin',
   
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),       
    children: [
      { index: true, element: <AdminDashboard /> },
     
    ],
  },
]);


function App() {
  return (
   <>
    <div><Toaster/></div>
   <AuthProvider>
       <RouterProvider router={router}/>
    </AuthProvider>
   </>
    
  )
}

export default App
