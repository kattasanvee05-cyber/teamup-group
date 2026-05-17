import { api } from './client.js'

export const opportunitiesApi = {
  list:   (params = {}) => api.get('/opportunities?' + new URLSearchParams(params)),
  get:    (id)          => api.get(`/opportunities/${id}`),
  create: (body)        => api.post('/opportunities', body),
  update: (id, body)    => api.patch(`/opportunities/${id}`, body),
  delete: (id)          => api.delete(`/opportunities/${id}`),
  apply:  (id, body)    => api.post(`/opportunities/${id}/apply`, body),
}
