import { describe, expect, it } from 'bun:test'
import app from '../server'

describe('My first test', () => {
  it('Should return 200 Response', async () => {
    const req = new Request('http://localhost/')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
  })

  it('Should return 404 Response', async () => {
    const req = new Request('http://localhost/not-found')
    const res = await app.fetch(req)
    expect(res.status).toBe(404)
  })
  
    it('request post user Should return 201 Response', async () => {
      const req = new Request('http://localhost/api/users', {
        method: 'POST',
        body: JSON.stringify({ name: 'testUser', age: Number(99) }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const res = await app.fetch(req)
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.name).toBe('testUser')
      expect(data.age).toBe(99)
    })

  it('request get user Should return 200 Response', async () => {
    const req = new Request('http://localhost/api/users/1')
    const res = await app.fetch(req)
    expect(res.status).toBe(200)
  })
})
