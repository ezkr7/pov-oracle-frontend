import { Outlet } from 'react-router-dom';

/** Public app: always render nested routes — no auth gate. */
export default function ProtectedRoute() {
  return <Outlet />;
}
