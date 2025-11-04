import imageCompression from 'browser-image-compression'

export async function uploadPropertyImage(file: File) {
  // --- 압축 설정 ---
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
  }

  let compressed = file
  try {
    compressed = await imageCompression(file, options)
    console.log(
      `[upload] compressed ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB`,
    )
  } catch (e) {
    console.warn('Compression failed, using original file')
  }

  // --- FormData 구성 ---
  const form = new FormData()
  form.append('file', compressed)

  // --- 서버 업로드 ---
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  const json = await res.json()

  if (!res.ok) throw new Error(json.error || 'Upload failed')
  return json as { url: string }
}
