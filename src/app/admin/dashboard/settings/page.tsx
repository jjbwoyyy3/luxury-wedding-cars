import AdminSiteSettingsForm from '@/components/admin/AdminSiteSettingsForm';
import { getSiteSettings } from '@/lib/data-store';
import PageHeader from '@/components/shared/PageHeader';

export const metadata = {
  title: 'Site Settings - Glitzy Rides Admin',
};

export default async function AdminSiteSettingsPage() {
  const siteSettings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <AdminSiteSettingsForm siteSettings={siteSettings} />
    </div>
  );
}
