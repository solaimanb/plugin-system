// app/admin/[...admin]/page.tsx
import { notFound } from 'next/navigation';
import { getRouteComponents } from '@/hooks';

export default function ViewPage({ params }: { params: any }) {
  if (!params?.view || !Array.isArray(params.view)) {
    return notFound();
  }

  const path = `/${params.view.join('/')}`;
  const routes = getRouteComponents('admin');
  const route = routes.find((r) => r.route === path);

  if (!route) return notFound();

  const Component = route.component;
  return <Component />;
}