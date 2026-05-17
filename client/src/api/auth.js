import { api } from './client.js'

export const authApi = {
  login:    (body) => api.post('/auth/login', body),
  signup:   (body) => api.post('/auth/signup', body),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
  updateMe: (body) => api.patch('/auth/me', body),
}
