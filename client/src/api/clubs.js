import { api } from './client.js'

export const clubsApi = {
  list:        (params = {}) => api.get('/clubs?' + new URLSearchParams(params).toString()),
  get:         (id)          => api.get(`/clubs/${id}`),
  mine:        ()            => api.get('/clubs/mine'),
  join:        (id)          => api.post(`/clubs/${id}/join`, {}),
  leave:       (id)          => api.delete(`/clubs/${id}/leave`),
  messages:    (id, channel, since) => api.get(`/clubs/${id}/messages?channel=${encodeURIComponent(channel)}${since ? `&since=${encodeURIComponent(since)}` : ''}`),
  sendMessage: (id, message, channel) => api.post(`/clubs/${id}/messages`, { message, channel }),
  members:     (id)          => api.get(`/clubs/${id}/members`),
  create:      (body)        => api.post('/clubs', body),
  update:      (id, body)    => api.patch(`/clubs/${id}`, body),
  remove:      (id)          => api.delete(`/clubs/${id}`),
}
