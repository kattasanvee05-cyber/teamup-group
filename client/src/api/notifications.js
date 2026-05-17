import { api } from './client.js'

export const notificationsApi = {
  list:       (params = {}) => api.get('/notifications?' + new URLSearchParams(params)),
  unread:     ()            => api.get('/notifications/unread-count'),
  markRead:   (id)          => api.patch(`/notifications/${id}/read`, {}),
  markAllRead:()            => api.patch('/notifications/read-all', {}),
  dismiss:    (id)          => api.delete(`/notifications/${id}`),
  clearAll:   ()            => api.delete('/notifications'),
}
