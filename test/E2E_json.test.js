const supertest = require('supertest')
const { createDate } = require('../utils/date')
require('dotenv').config()
const app = supertest('https://gorest.co.in/public/v2')

const userData = {
  name: 'jim',
  email: 'jim@mail.com',
  status: 'active',
  gender: 'male',
}
const postData = {
  title: 'Test Post Title',
  body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
}
const commentData = {
  name: 'jim',
  email: 'jim@mail.com',
  body: 'Cras scelerisque cursus molestie. Praesent dignissim elit mi. Nulla hendrerit pellentesque mi quis gravida. Donec risus nibh, mollis ut libero ac, convallis tempus odio. In in quam ut nibh pulvinar pellentesque.',
}

const todoData = {
  title: 'Test ToDo Title',
  status: 'pending',
  due_on: createDate(),
}
const updatedUserData = {
  name: 'jim',
  email: 'jim@mail.com',
  status: 'inactive',
  gender: 'male',
}

beforeAll(async () => {
  const response = await app
    .get(`/users?email=jim@mail.com`)
    .set('Authorization', `Bearer ${process.env.TOKEN}`)
  let userDataId
  if (response.body.length) {
    userDataId = response.body[0].id
    await app
      .delete(`/users/${userDataId}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
  }
})

afterAll(async () => {
  await app
    .delete(`/users/${userData.id}`)
    .set('Authorization', `Bearer ${process.env.TOKEN}`)
})

describe('E2E user scenarios - JSON responses', () => {
  test('Wrong URL', async () => {
    const response = await app.get('/wrongUrl')
    expect(response.status).toBe(404)
    expect(response.headers['content-type']).toMatch(/text\/html/)
    expect(response.text).toMatch(/Page Not Found/i)
  })

  test('Should NOT create a user - missing process.env.TOKEN', async () => {
    const response = await app.post('/users').send(userData)
    expect(response.status).toBe(401)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body.message).toMatch('Authentication failed')
  })

  test('Should NOT creat user - Missing required field', async () => {
    const response = await app
      .post('/users')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send({
        name: 'jim',
        email: 'jim@mail.com',
        status: 'active',
        // gender: 'male',
      })
    expect(response.status).toBe(422)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body[0].field).toBe('gender')
    expect(response.body[0].message).toBe(
      `can't be blank, can be male of female`
    )
  })

  test('Should NOT creat user - Invalid field data', async () => {
    const response = await app
      .post('/users')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send({
        name: 'jim',
        email: 'invalidEmail',
        status: 'active',
        gender: 'male',
      })
    expect(response.status).toBe(422)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body[0].field).toBe('email')
    expect(response.body[0].message).toBe(`is invalid`)
  })

  test('Should create user', async () => {
    const response = await app
      .post('/users')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send(userData)
    userData.id = response.body.id
    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toMatchObject(userData)
  })

  test('Should NOT creat user second time - Duplicate field', async () => {
    const response = await app
      .post('/users')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send(userData)
    expect(response.status).toBe(422)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body[0].field).toBe('email')
    expect(response.body[0].message).toBe(`has already been taken`)
  })

  test('Should receive a previously created user', async () => {
    const response = await app
      .get(`/users/${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toMatchObject(userData)
  })

  test('Should return a list of users (public)', async () => {
    // no process.env.TOKEN -> no private users
    const response = await app.get(`/users`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(10)
    const list_user = response.body.find((user) => user.id === userData.id)
    expect(list_user).toBe(undefined)
  })

  test('Should receive a previously created user on list of all users', async () => {
    const response = await app
      .get(`/users`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBeGreaterThan(0)
    const list_user = response.body.find((user) => user.id === userData.id)
    expect(list_user).toMatchObject(userData)
  })

  test('Should return a list of 100 users from second page', async () => {
    const response = await app
      .get('/users?page=2&per_page=100')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(100)
    expect(response.headers['x-pagination-page']).toBe('2')
    // expect(response.headers['x-pagination-limit']).toBe('15') <-- this header is always 10
  })

  test('Should NOT return a list of 100+ users', async () => {
    const response = await app
      .get('/users?per_page=101')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body.length).not.toBe(101)
  })

  test('Should NOT return user - Non-existent user', async () => {
    const response = await app
      .get(`/users/0`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(404)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Object)
    expect(response.body.message).toBe(`Resource not found`)
  })

  test('Should create user post', async () => {
    const response = await app
      .post(`/users/${userData.id}/posts`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send(postData)
    postData.id = response.body.id
    postData.user_id = response.body.user_id
    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(postData.user_id).toBe(userData.id)
    expect(response.body).toMatchObject(postData)
  })

  test('Should receive a previously created user post', async () => {
    const response = await app
      .get(`/users/${userData.id}/posts?id=${postData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body[0]).toMatchObject(postData)
  })

  test('Should receive a user posts list, with previously created post', async () => {
    const response = await app
      .get(`/posts?user_id=${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    const list_post = response.body.find((post) => post.id === postData.id)
    expect(list_post).toMatchObject(postData)
  })

  test('Should create post comment', async () => {
    const response = await app
      .post(`/posts/${postData.id}/comments`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send(commentData)
    commentData.id = response.body.id
    commentData.post_id = response.body.post_id
    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(commentData.post_id).toBe(postData.id)
    expect(response.body).toMatchObject(commentData)
  })

  test('Should receive a previously created post comment', async () => {
    const response = await app
      .get(`/posts/${postData.id}/comments?id=${commentData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body[0]).toMatchObject(commentData)
  })

  test('Should receive post comments list, with previously created comment', async () => {
    const response = await app
      .get(`/comments?post_id=${postData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    const list_comment = response.body.find(
      (comment) => comment.id === commentData.id
    )
    expect(list_comment).toMatchObject(commentData)
  })

  test('Should create user todo', async () => {
    const response = await app
      .post(`/users/${userData.id}/todos`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send(todoData)
    todoData.id = response.body.id
    todoData.user_id = response.body.user_id
    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(todoData.user_id).toBe(userData.id)
    expect(response.body).toMatchObject(todoData)
  })

  test('Should receive a previously created todo', async () => {
    const response = await app
      .get(`/users/${userData.id}/todos`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body[0]).toMatchObject(todoData)
  })

  test('Should receive todos list, with previously created todo', async () => {
    const response = await app
      .get(`/todos?user_id=${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    const list_todo = response.body.find((todo) => todo.id === todoData.id)
    expect(list_todo).toMatchObject(todoData)
  })

  test('Should update user data', async () => {
    updatedUserData.id = userData.id
    const response = await app
      .patch(`/users/${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send(updatedUserData)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toMatchObject(updatedUserData)
    expect(updatedUserData).not.toMatchObject(userData)
  })

  test('Should receive a previously updated user', async () => {
    const response = await app
      .get(`/users/${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toMatchObject(updatedUserData)
    expect(response.body).not.toMatchObject(userData)
  })

  test('Should receive a previously updated user on list of all users', async () => {
    const response = await app
      .get(`/users?id=${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBeGreaterThan(0)
    expect(response.body[0]).toMatchObject(updatedUserData)
    expect(response.body).not.toMatchObject(userData)
  })

  test('Should remove user from users list', async () => {
    const response = await app
      .delete(`/users/${updatedUserData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(204)
    successRemoval = true
  })

  test('Should not receive deleted user', async () => {
    const response = await app
      .get(`/users/${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(404)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).not.toMatchObject(updatedUserData)
    expect(response.body.message).toBe('Resource not found')
  })

  test('Should receive empty list of users', async () => {
    const response = await app
      .get(`/users?id=${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(0)
  })

  test('Should receive empty user posts list from /users/user_id/posts', async () => {
    const response = await app
      .get(`/users/${userData.id}/posts`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(0)
  })

  test('Should receive empty user posts list /posts', async () => {
    const response = await app
      .get(`/posts?user_id=${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(0)
  })

  test('Should receive empty list of previously created post comments /users/user_id/comments', async () => {
    const response = await app
      .get(`/posts/${postData.id}/comments?id=${commentData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(0)
  })

  test('Should receive empty post comments list /comments', async () => {
    const response = await app
      .get(`/comments?post_id=${postData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(0)
  })

  test('Should receive empty todos list of previously created todo /users/user_id/todos', async () => {
    const response = await app
      .get(`/users/${userData.id}/todos`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(0)
  })

  test('Should receive empty todos list of previously created todo /todos', async () => {
    const response = await app
      .get(`/todos?user_id=${userData.id}`)
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toBeInstanceOf(Array)
    expect(response.body.length).toBe(0)
  })

  test('Should create user after previous deletion', async () => {
    const response = await app
      .post('/users')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .send(userData)
    userData.id = response.body.id
    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body).toMatchObject(userData)
  })

  test('Should exceed the request limit', async () => {
    for (let i = 0; i < 10; i++) {
      await app
        .get('/users')
        .set('Authorization', `Bearer ${process.env.LOW_LIMIT_TOKEN}`)
    }
    const response = await app
      .get('/users')
      .set('Authorization', `Bearer ${process.env.LOW_LIMIT_TOKEN}`)
    expect(response.status).toBe(429)
    expect(response.headers['x-ratelimit-limit']).toBe('5')
    expect(response.headers['x-ratelimit-remaining']).toBe('0')
    expect(response.headers['content-type']).toMatch(/json/)
    expect(response.body.message).toMatch('Too many requests')
  })
})
