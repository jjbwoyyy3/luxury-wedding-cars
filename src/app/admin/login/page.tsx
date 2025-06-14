import LoginForm from '@/components/admin/LoginForm';
import { checkAdminSession } from '@/lib/actions';
import { ADMIN_DASHBOARD_PATH } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin Login - Glitzy Rides',
};

export default async function AdminLoginPage() {
  const isLoggedIn = await checkAdminSession();
  if (isLoggedIn) {
    redirect(ADMIN_DASHBOARD_PATH);
  }
  return <LoginForm />;
}
