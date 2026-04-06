import Navbar from './layout/Navbar';
import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 70px)' }}>
        <Outlet />
      </main>
    </>
  );
}
