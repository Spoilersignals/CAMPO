import { redirect } from "next/navigation";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingRedirectPage({ params }: ListingPageProps) {
  const { id } = await params;
  redirect(`/marketplace/${id}`);
}
