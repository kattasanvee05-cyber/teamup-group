const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000') + '/api'

async function upload(endpoint, fieldName, file) {
  const formData = new FormData()
  formData.append(fieldName, file)
  const token = localStorage.getItem('teamup_token')
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error ?? 'Upload failed'), { status: res.status })
  return data
}

export const uploadsApi = {
  resume:    (file) => upload('/uploads/resume',     'resume', file),
  itemImage: (file) => upload('/uploads/item-image', 'image',  file),
}
