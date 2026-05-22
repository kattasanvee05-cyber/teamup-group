import { api } from './client.js'

export const applicationsApi = {
  mine:     ()     => api.get('/applications'),
  get:      (id)   => api.get(`/applications/${id}`),
  create:   (body) => api.post('/applications', body),
  withdraw: (id)   => api.delete(`/applications/${id}`),
}
