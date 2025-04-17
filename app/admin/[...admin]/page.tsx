import { getRouteComponents } from '@/hooks';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { admin: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: params.admin ? `Admin | ${params.admin.join(' ')}` : 'Admin Dashboard',
  };
}

export default function AdminPage({ params }: Props) {
  const path = `/${params.admin?.join('/') || ''}`;
  const routes = getRouteComponents('admin');
  
  const route = routes.find(r => r.route === path);
  
  if (!route) {
    return notFound();
  }
  
  const Component = route.component;
  return <Component />;
}

export const dynamicParams = false;