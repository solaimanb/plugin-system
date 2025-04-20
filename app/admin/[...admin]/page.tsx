// app/admin/[...admin]/page.tsx
import { getRouteComponents } from '@/hooks';
import { notFound } from 'next/navigation';

export default function AdminPage({ params }: { params: any }) {
  if (!params?.admin || !Array.isArray(params.admin)) {
    return notFound();
  }

  const path = `/${params.admin.join('/')}`;
  const routes = getRouteComponents('admin');

  const route = routes.find((r) => r.route === path);

  if (!route) return notFound();

  const Component = route.component;
  return <Component />;
}