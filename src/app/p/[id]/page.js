const BASE = 'https://vellora.salonchairwala.com';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const img = `${BASE}/api/marketing/public/${id}`;
  return {
    title: 'Special offer',
    description: 'Poster dekhne ke liye tap karein',
    openGraph: {
      title: 'Special offer',
      description: 'Poster dekhne ke liye tap karein',
      url: `${BASE}/p/${id}`,
      type: 'website',
      images: [{ url: img }],
    },
    twitter: { card: 'summary_large_image', images: [img] },
  };
}

export default async function PosterPage({ params }) {
  const { id } = await params;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', padding: 16 }}>
      <img src={`/api/marketing/public/${id}`} alt="Poster" style={{ maxWidth: '100%', maxHeight: '100vh', borderRadius: 12 }} />
    </div>
  );
}