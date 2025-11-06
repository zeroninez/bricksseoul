export function DropCard({ onFiles }: { onFiles: (files: File[]) => void }) {
  return (
    <div className='w-full h-auto aspect-landscape flex justify-center items-center bg-stone-200 rounded-lg cursor-pointer'>
      <label className='w-full h-full flex flex-col justify-center items-center cursor-pointer active:scale-95 active:opacity-80 transition-all'>
        <input
          type='file'
          accept='image/*'
          multiple
          className='hidden'
          onChange={(e) => {
            const picked = Array.from(e.target.files || [])
            if (picked.length) {
              onFiles(picked)
              e.target.value = '' // 같은 파일 재선택 가능하도록
            }
          }}
        />
        <span className='text-2xl text-stone-400 select-none'>＋</span>
        <span className='text-xs font-medium text-stone-400 select-none'>이미지 업로드</span>
      </label>
    </div>
  )
}
