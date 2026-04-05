import type { Metadata } from 'next';
import AdminPanel from './AdminPanel';

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: 'noindex,nofollow',
};

export default function AdminPage() {
  return <AdminPanel />;
}
