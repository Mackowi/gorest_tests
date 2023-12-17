const { parseString } = require('xml2js')

const parseXmlMessage = (xml) => {
  let message

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }
    if (result.hash) {
      message = result.hash.message[0]
    } else {
      const objectsArray = result.objects.object
      const errors = objectsArray.map((object) => {
        const field = object.field ? object.field[0] : null
        const message = object.message ? object.message[0] : null
        if (field && message) {
          return { field, message }
        }
      })
      message = errors[0]
    }
  })
  return message
}

const parseXmlUser = (xml) => {
  let userDetails

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }

    userDetails = {
      id: parseInt(result.hash.id[0]._),
      name: result.hash.name[0],
      email: result.hash.email[0],
      status: result.hash.status[0],
      gender: result.hash.gender[0],
    }
  })

  return userDetails
}

const parseXmlUsers = (xml) => {
  let parsedObjects

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }

    if (result['nil-classes']) {
      parsedObjects = []
      return parsedObjects
    }

    const objectsArray = result.objects.object

    parsedObjects = objectsArray.map((object) => {
      return {
        id: parseInt(object.id[0]._),
        name: object.name[0],
        email: object.email[0],
        status: object.status[0],
        gender: object.gender[0],
      }
    })
  })

  return parsedObjects
}

const parseXmlPost = (xml) => {
  let postData

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }

    postData = {
      id: parseInt(result.hash.id[0]._),
      user_id: parseInt(result.hash['user-id'][0]._),
      title: result.hash.title[0],
      body: result.hash.body[0],
    }
  })

  return postData
}

const parseXmlPosts = (xml) => {
  let postsData

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }

    if (result['nil-classes']) {
      postsData = []
      return postsData
    }

    const objectsArray = result.objects.object

    postsData = objectsArray.map((object) => {
      return {
        id: parseInt(object.id[0]._),
        user_id: parseInt(object['user-id'][0]._),
        title: object.title[0],
        body: object.body[0],
      }
    })
  })

  return postsData
}

const parseXmlComment = (xml) => {
  let commentData

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }

    commentData = {
      id: parseInt(result.hash.id[0]._),
      post_id: parseInt(result.hash['post-id'][0]._),
      name: result.hash.name[0],
      email: result.hash.email[0],
      body: result.hash.body[0],
    }
  })

  return commentData
}

const parseXmlComments = (xml) => {
  let commentsData

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }

    if (result['nil-classes']) {
      commentsData = []
      return commentsData
    }

    commentsData = result.objects.object.map((comment) => ({
      id: parseInt(comment.id[0]._),
      post_id: parseInt(comment['post-id'][0]._),
      name: comment.name[0],
      email: comment.email[0],
      body: comment.body[0],
    }))
  })

  return commentsData
}

const parseXmlTodo = (xml) => {
  let todoData

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }

    todoData = {
      id: parseInt(result.hash.id[0]._),
      user_id: parseInt(result.hash['user-id'][0]._),
      title: result.hash.title[0],
      due_on: new Date(result.hash['due-on'][0]),
      status: result.hash.status[0],
    }
  })

  return todoData
}

const parseXmlTodos = (xml) => {
  let todosData = []

  parseString(xml, (err, result) => {
    if (err) {
      throw err
    }


    if (result['nil-classes']) {
      todosData = []
      return todosData
    }

    const objectsArray = result.objects.object

    todosData = objectsArray.map((todo) => {
      return {
        id: parseInt(todo.id[0]._),
        user_id: parseInt(todo['user-id'][0]._),
        title: todo.title[0],
        due_on: new Date(todo['due-on'][0]),
        status: todo.status[0],
      }
    })
  })

  return todosData
}

module.exports = {
  parseXmlMessage,
  parseXmlUsers,
  parseXmlUser,
  parseXmlPost,
  parseXmlPosts,
  parseXmlComment,
  parseXmlComments,
  parseXmlTodo,
  parseXmlTodos,
}
