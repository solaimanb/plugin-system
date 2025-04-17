// app/admin/[...admin]/page.tsx
import { getRouteComponents } from '@/hooks';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    admin: string[];
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default function AdminPage({ params }: PageProps) {
  const path = `/${params.admin?.join('/') || ''}`;
  const routes = getRouteComponents('admin');
  
  const route = routes.find(r => r.route === path);
  
  if (!route) {
    return notFound();
  }
  
  const Component = route.component;
  return <Component />;
}

export const dynamicParams = false; // Set to true if you want to allow non-registered routes