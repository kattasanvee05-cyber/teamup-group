import { api } from './client.js'

export const exchangeApi = {
  list:        (params = {}) => api.get('/exchange?' + new URLSearchParams(params)),
  get:         (id)          => api.get(`/exchange/${id}`),
  create:      (body)        => api.post('/exchange', body),
  update:      (id, body)    => api.patch(`/exchange/${id}`, body),
  remove:      (id)          => api.delete(`/exchange/${id}`),

  myChats:     ()            => api.get('/exchange/chats/mine'),
  startChat:   (listing_id)  => api.post('/exchange/chats', { listing_id }),
  messages:    (chatId, since) => api.get(`/exchange/chats/${chatId}/messages${since ? '?since=' + encodeURIComponent(since) : ''}`),
  send:        (chatId, message) => api.post(`/exchange/chats/${chatId}/messages`, { message }),
}
