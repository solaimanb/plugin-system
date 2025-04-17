// app/[...view]/page.tsx
import { getRouteComponents } from '@/hooks';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    view: string[];
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default function ViewPage({ params }: PageProps) {
  const path = `/${params.view?.join('/') || ''}`;
  const routes = getRouteComponents('view');

  const route = routes.find(r => r.route === path);

  if (!route) {
    return notFound();
  }

  const Component = route.component;
  return <Component />;
}

export const dynamicParams = false; // Set to true if you want to allow non-registered routes