// types/next.d.ts
import type { Metadata, ResolvingMetadata } from 'next';

declare module 'next' {
  interface PageProps {
    params: Record<string, string | string[]>;
    searchParams: Record<string, string | string[] | undefined>;
  }
}