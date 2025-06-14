import AdminContactForm from '@/components/admin/AdminContactForm';
import { getContactInfo } from '@/lib/data-store';

export const metadata = {
  title: 'Manage Contact Info - Glitzy Rides Admin',
};

export default async function AdminContactPage() {
  // Fetch initial contact info on the server
  const contactInfo = await getContactInfo();

  return (
    <div>
      <AdminContactForm contactInfo={contactInfo} />
    </div>
  );
}
