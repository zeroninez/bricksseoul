// app/api/to-english/route.ts
import { NextRequest, NextResponse } from 'next/server'

const JUSO_KEY = process.env.NEXT_PUBLIC_JUSO_KEY!
const API_ENG = 'https://business.juso.go.kr/addrlink/addrEngApi.do'

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('keyword')?.trim()
  if (!keyword) return NextResponse.json({ error: 'keyword required' }, { status: 400 })

  const url = new URL(API_ENG)
  url.searchParams.set('confmKey', JUSO_KEY)
  url.searchParams.set('currentPage', '1')
  url.searchParams.set('countPerPage', '5')
  url.searchParams.set('keyword', keyword) // 도로명주소 형식 권장
  url.searchParams.set('resultType', 'json')

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return NextResponse.json({ error: 'request failed' }, { status: 502 })

  const data = await res.json()

  // Juso 공통영역 확인
  const common = data?.results?.common
  const list = data?.results?.juso ?? []

  // 에러/원인 그대로 전달 (개발 단계에서 도움)
  if (!list.length) {
    return NextResponse.json({
      items: [],
      common,
      debug: { requested: url.toString(), sampleTip: '예: "세종특별자치시 도움6로 42"' },
    })
  }

  const first = list[0]
  const item = {
    roadAddrKor: first.roadAddr, // 한글 도로명
    roadAddrEng: first.roadAddrEng,
    jibunAddrEng: first.jibunAddrEng,
    siDoEng: first.siDoEng,
    siGunGuEng: first.siGunGuEng,
    zipNo: first.zipNo,
  }

  return NextResponse.json({ item, items: list, common })
}
