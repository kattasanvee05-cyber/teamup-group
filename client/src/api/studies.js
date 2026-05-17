import { api } from './client.js'

export const studiesApi = {
  books:        (params = {}) => api.get('/studies/books?' + new URLSearchParams(params)),
  equipment:    (params = {}) => api.get('/studies/equipment?' + new URLSearchParams(params)),
  myBorrows:    ()            => api.get('/studies/borrows/mine'),
  borrow:       (body)        => api.post('/studies/borrow', body),
  returnItem:   (id)          => api.patch(`/studies/borrows/${id}/return`),
  startChat:    (body)        => api.post('/studies/chat', body),
  chatMessages: (id, since)   => api.get(`/studies/chat/${id}/messages${since ? `?since=${encodeURIComponent(since)}` : ''}`),
  sendMessage:  (id, message) => api.post(`/studies/chat/${id}/messages`, { message }),
}
