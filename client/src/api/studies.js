import { api } from './client.js'

export const studiesApi = {
  books:           (params = {}) => api.get('/studies/books?' + new URLSearchParams(params)),
  createBook:      (body)        => api.post('/studies/books', body),
  equipment:       (params = {}) => api.get('/studies/equipment?' + new URLSearchParams(params)),
  createEquipment: (body)        => api.post('/studies/equipment', body),
  myBorrows:       ()            => api.get('/studies/borrows/mine'),
  borrow:          (body)        => api.post('/studies/borrow', body),
  returnItem:      (id)          => api.patch(`/studies/borrows/${id}/return`),
  startChat:       (body)        => api.post('/studies/chat', body),
  chatMessages:    (id, since)   => api.get(`/studies/chat/${id}/messages${since ? `?since=${encodeURIComponent(since)}` : ''}`),
  sendMessage:     (id, message) => api.post(`/studies/chat/${id}/messages`, { message }),
  myItems:         ()            => api.get('/studies/my-items'),
}
