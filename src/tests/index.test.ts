import { describe, expect, it } from 'bun:test'
import app from '..'

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
})
