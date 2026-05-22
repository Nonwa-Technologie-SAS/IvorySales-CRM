import DashboardPage from './(dashboard)/page';

type HomeProps = {
  params?: Promise<Record<string, string | string[]>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Route `/` — consomme les props dynamiques Next avant de rendre le dashboard. */
export default async function Home({ params, searchParams }: HomeProps) {
  if (params) await params;
  if (searchParams) await searchParams;
  return <DashboardPage />;
}
