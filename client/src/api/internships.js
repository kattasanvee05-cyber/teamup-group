import { api } from './client.js'

export const internshipsApi = {
  list:     (params = {}) => api.get('/internships?' + new URLSearchParams(params)),
  get:      (id)          => api.get(`/internships/${id}`),
  create:   (body)        => api.post('/internships', body),
  update:   (id, body)    => api.patch(`/internships/${id}`, body),
  delete:   (id)          => api.delete(`/internships/${id}`),
  apply:    (id, body)    => api.post(`/internships/${id}/apply`, body),
  bookmark: (id)          => api.post(`/internships/${id}/bookmark`),
}
