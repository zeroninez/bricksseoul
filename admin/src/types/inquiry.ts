export type InquiryType = {
  id: string
  subject: string
  category: string
  email: string
  status: 'pending' | 'replied' | 'closed'
  reservation_code: string | null
  created_at: string
  updated_at: string
  has_password: boolean
}

export type MessageType = {
  id: string
  inquiry_id: string
  sender_type: 'customer' | 'admin'
  sender_name: string | null
  content: string
  created_at: string
}

export const INQUIRY_CATEGORIES = [
  { value: 'reservation', label_ko: '예약 관련', label_en: 'Reservation' },
  { value: 'payment', label_ko: '결제/환불', label_en: 'Payment/Refund' },
  { value: 'facility', label_ko: '시설 문의', label_en: 'Facility' },
  { value: 'service', label_ko: '서비스 문의', label_en: 'Service' },
  { value: 'complaint', label_ko: '불만/건의', label_en: 'Complaint/Suggestion' },
  { value: 'general', label_ko: '일반 문의', label_en: 'General' },
  { value: 'other', label_ko: '기타', label_en: 'Other' },
]
