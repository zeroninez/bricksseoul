// app/[locale]/properties/[id]/page.tsx
import DetailClient from './DetailClient'

export const revalidate = 60 // 1분마다 최신화

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params
  return <DetailClient id={id} />
}
