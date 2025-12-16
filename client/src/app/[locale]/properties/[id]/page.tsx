// app/[locale]/properties/[id]/page.tsx
// app/[locale]/properties/[id]/page.tsx
import DetailClient from './DetailClient'

export const revalidate = 60

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ in?: string; out?: string }>
}) {
  const { id } = await params
  const { in: moveIn, out: moveOut } = await searchParams

  return <DetailClient id={id} moveInDate={moveIn} moveOutDate={moveOut} />
}
