import { getRouteComponents } from '@/hooks';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { view: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: params.view ? `${params.view.join(' ')} | My Site` : 'My Site',
  };
}

export default function ViewPage({ params }: Props) {
  const path = `/${params.view?.join('/') || ''}`;
  const routes = getRouteComponents('view');
  
  const route = routes.find(r => r.route === path);
  
  if (!route) {
    return notFound();
  }
  
  const Component = route.component;
  return <Component />;
}

export const dynamicParams = false;