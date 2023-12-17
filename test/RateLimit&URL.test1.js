const supertest = require('supertest')
require('dotenv').config()
const app = supertest('https://gorest.co.in/public/v2')

describe('test', () => {
  test('HEAD', async () => {
    const response = await app
      .options('/users')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    console.log(response)
    // expect(response.status).toBe(200)
    // expect(response.headers['content-type']).toMatch(/json/)
    // expect(response.body.length).toBe(100)
  })
})
