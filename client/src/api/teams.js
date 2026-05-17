import { api } from './client.js'

export const teamsApi = {
  list:   (params = {}) => api.get('/teams?' + new URLSearchParams(params)),
  mine:   ()            => api.get('/teams/mine'),
  get:    (id)          => api.get(`/teams/${id}`),
  create: (body)        => api.post('/teams', body),
  update: (id, body)    => api.patch(`/teams/${id}`, body),
  delete: (id)          => api.delete(`/teams/${id}`),
  join:   (id, body)    => api.post(`/teams/${id}/join`, body),
  leave:  (id)          => api.delete(`/teams/${id}/leave`),
}
