import { formatCurrency } from '@/utils'

export interface InvoiceProps {
  pricePerNight: number
  currency: string
  nights: number
  totalPrice: number
}

// 🎯 단일 소스: HTML 생성 (여기만 수정하면 됨!)
export const generateInvoiceHTML = (props: InvoiceProps): string => {
  const { pricePerNight, currency, nights, totalPrice } = props

  return `
<div style="width: 100%; background-color: #FFF; border-radius: 8px; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px;">
  <div style="width: 100%; display: flex; flex-direction: column;">
    <span style="font-size: 16px; color: #57534e;">Room charge</span>
    <span style="font-size: 16px; font-weight: 500; color: #000000;">${formatCurrency(pricePerNight, currency)} x ${nights} nights</span>
  </div>
  <div style="width: 100%; height: 1px; background-color: #a8a29e;"></div>
  <div style="width: 100%; display: flex; flex-direction: column;">
    <span style="font-size: 16px; color: #57534e;">Total</span>
    <span style="font-size: 18px; font-weight: 600; color: #000000;">${formatCurrency(totalPrice, currency)}</span>
  </div>
</div>
  `.trim()
}

// React 컴포넌트 (HTML을 그대로 렌더링)
export const Invoice = (props: InvoiceProps) => {
  const html = generateInvoiceHTML(props)
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
