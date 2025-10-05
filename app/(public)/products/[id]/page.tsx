import ProductDetails from './components/ProductDetails';

// In Next.js 15, the `params` prop for dynamic routes is a Promise.
// This allows for better streaming and performance optimizations.
// We must use an async component and await the params to access their values.
// See: https://nextjs.org/docs/app/api-reference/file-conventions/layout#params-optional
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetails productId={id} />;
}
