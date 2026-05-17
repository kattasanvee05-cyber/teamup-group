import { api } from './client.js'

export const applicationsApi = {
  mine:     ()    => api.get('/applications'),
  get:      (id)  => api.get(`/applications/${id}`),
  withdraw: (id)  => api.delete(`/applications/${id}`),
}
