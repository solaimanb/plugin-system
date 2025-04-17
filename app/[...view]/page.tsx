// app/[...view]/page.tsx
import { getRouteComponents } from '@/hooks';
import { notFound } from 'next/navigation';

interface Props {
  params: { view: string[] };
}

export default function ViewPage({ params }: Props) {
  const path = `/${params.view.join('/')}`;
  const routes = getRouteComponents('view');

  const route = routes.find(r => r.route === path);

  if (!route) {
    return notFound();
  }

  const Component = route.component;
  return <Component />;
}
