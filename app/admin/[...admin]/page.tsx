// app/admin/[...admin]/page.tsx
import { getRouteComponents } from '@/hooks';
import { notFound } from 'next/navigation';

export default function AdminPage({ params }: { params: { admin: string[] } }) {
  const path = `/${params.admin.join('/')}`;
  const routes = getRouteComponents('admin');
  
  const route = routes.find(r => r.route === path);
  
  if (!route) {
    return notFound();
  }
  
  const Component = route.component;
  return <Component />;
}