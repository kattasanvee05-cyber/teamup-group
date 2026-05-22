import { api } from './client.js'

export const projectsApi = {
  list:   (params = {}) => api.get('/projects?' + new URLSearchParams(params).toString()),
  get:    (id)          => api.get(`/projects/${id}`),
  create: (body)        => api.post('/projects', body),
  update: (id, body)    => api.patch(`/projects/${id}`, body),
  remove: (id)          => api.delete(`/projects/${id}`),
}
