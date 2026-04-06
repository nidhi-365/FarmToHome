import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Farmer
import Dashboard from './pages/Dashboard';
import MyProduce from './pages/MyProduce';
import AddProduce from './pages/AddProduce';
import ImperfectMarket from './pages/ImperfectMarket';
import CropRecommendations from './pages/CropRecommendations';
import FarmerOrdersPage from './pages/FarmerOrdersPage';
import Layout from './components/Layout';

// Customer
import CustomerLayout from './components/CustomerLayout';
import MarketplacePage from './pages/customer/MarketplacePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import ProfilePage from './pages/customer/ProfilePage';

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {(!user || user.role === 'customer') && (
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<MarketplacePage />} />
            <Route path="/produce/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={!user ? <Navigate to="/login" /> : <CartPage />} />
            <Route path="/checkout" element={!user ? <Navigate to="/login" /> : <CheckoutPage />} />
            <Route path="/orders" element={!user ? <Navigate to="/login" /> : <OrdersPage />} />
            <Route path="/orders/:id" element={!user ? <Navigate to="/login" /> : <OrderDetailPage />} />
            <Route path="/profile" element={!user ? <Navigate to="/login" /> : <ProfilePage />} />
          </Route>
        )}

        {user?.role === 'farmer' && (
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/produce" element={<MyProduce />} />
            <Route path="/produce/add" element={<AddProduce />} />
            <Route path="/imperfect" element={<ImperfectMarket />} />
            <Route path="/crops" element={<CropRecommendations />} />
            <Route path="/my-orders" element={<FarmerOrdersPage />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}