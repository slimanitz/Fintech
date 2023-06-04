// POST /api/users
const createUser = {
  tags: ['Users'],
  description: 'Create a new user in the system',
  operationId: 'createUser',
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/createUserBody',
        },
      },
    },
    required: true,
  },
  responses: {
    200: {
      description: 'User created successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                example: 'John Snow',
              },
              email: {
                type: 'string',
                example: 'john.snow@email.com',
              },
              password: {
                type: 'string',
                example: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
              },
              isActive: {
                type: 'boolean',
                example: true,
              },
              role: {
                type: 'string',
                example: 'CLIENT',
              },
            },
          },
        },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Internal Server Error',
              },
            },
          },
        },
      },
    },
  },
};

// GET /api/users/{id}
const findOneUser = {
  tags: ['Users'],
  description: 'Find a specific user by Id',
  operationId: 'findOneUser',
  security: [
    {
      bearerAuth: [],
    },
  ],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'ID of the entity',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ],
  responses: {
    200: {
      description: 'Return the user with the following Id or return CODE 404 if not found',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                example: 'John Snow',
              },
              email: {
                type: 'string',
                example: 'john.snow@email.com',
              },
              password: {
                type: 'string',
                example: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
              },
              isActive: {
                type: 'boolean',
                example: true,
              },
              role: {
                type: 'string',
                example: 'CLIENT',
              },
            },
          },
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'No User found',
              },
            },
          },
        },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Internal Server Error',
              },
            },
          },
        },
      },
    },
  },
};

// GET /api/users
const getAllUsers = {
  tags: ['Users'],
  description:
    'Find all users that matches the the specifications in the request Query',
  operationId: 'findOneUser',
  security: [
    {
      bearerAuth: [],
    },
  ],
  parameters: [
    {
      name: 'id',
      in: 'query',
      description: 'ID of the user',
      required: false,
      schema: {
        type: 'string',
      },
    },
    {
      name: 'name',
      in: 'query',
      description: 'Name of the user',
      required: false,
      schema: {
        type: 'string',
      },
    },
    {
      name: 'email',
      in: 'query',
      description: 'Email of the user',
      required: false,
      schema: {
        type: 'string',
      },
    },
    {
      name: 'isActive',
      in: 'query',
      description: 'Boolean to check if user is active or not',
      required: false,
      schema: {
        type: 'boolean',
      },
    },
    {
      name: 'role',
      in: 'query',
      description: 'Role of the user must be from the following values',
      required: false,
      schema: {
        type: 'string',
        default: 'CLIENT',
        description: 'CLIENT represents the basic role of the application\n Admin represents the admin role of the application that has admin features',
        enum: ['ADMIN', 'CLIENT'],
      },
    },
  ],
  responses: {
    200: {
      description:
        'Return array of user Object',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                example: 'John Snow',
              },
              email: {
                type: 'string',
                example: 'john.snow@email.com',
              },
              password: {
                type: 'string',
                example: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
              },
              isActive: {
                type: 'boolean',
                example: true,
              },
              role: {
                type: 'string',
                example: 'CLIENT',
              },
            },
          },
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'No User found',
              },
            },
          },
        },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Internal Server Error',
              },
            },
          },
        },
      },
    },
  },
};

// POST /api/users/login
const loginUser = {
  tags: ['Users'],
  description: 'Log in a user',
  operationId: 'loginUser',
  security: [
    {
      bearerAuth: [],
    },
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/userLoginBody',
        },
      },
    },
    required: true,
  },
  responses: {
    200: {
      description: 'User created successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                example: 'John Snow',
              },
              email: {
                type: 'string',
                example: 'john.snow@email.com',
              },
              password: {
                type: 'string',
                example: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
              },
              isActive: {
                type: 'boolean',
                example: true,
              },
              role: {
                type: 'string',
                example: 'CLIENT',
              },
              token: {
                type: 'string',
                example:
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODc4M2M4OGMtYTA4MC00MDAxLWI4MjMtMTQ0NDMzMTllY2ZmIiwibmFtZSI6IkpvaG4gU25vdyIsImVtYWlsIjoiam9obi5zMm5vd0BlbWFpbC5jb20iLCJwYXNzd29yZCI6IjViYWE2MWU0YzliOTNmM2YwNjgyMjUwYjZjZjgzMzFiN2VlNjhmZDgiLCJpc0FjdGl2ZSI6dHJ1ZSwicm9sZSI6IkNMSUVOVCIsImNyZWF0ZWRBdCI6IlN1biBKdW4gMDQgMjAyMyAxOTowMjozNCBHTVQrMDEwMCAoR01UKzAxOjAwKSIsInVwZGF0ZWRBdCI6IlN1biBKdW4gMDQgMjAyMyAxOTowMjozNCBHTVQrMDEwMCAoR01UKzAxOjAwKSJ9LCJpYXQiOjE2ODU5MDE3ODIsImV4cCI6MTY4NTkwODk4Mn0.X8Ou1q5IPHM1HHJHuHGQkLmM0we4vHLttm5-YupwLIo',
              },
            },
          },
        },
      },
    },
    401: {
      description: 'Wrong credentials',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Wrong credentials',
              },
            },
          },
        },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Internal Server Error',
              },
            },
          },
        },
      },
    },
  },
};

// {
//   "id": "8783c88c-a080-4001-b823-14443319ecff",
//   "name": "John Snow",
//   "email": "john.s2now@email.com",
//   "isActive": true,
//   "role": "CLIENT",
//   "createdAt": "Sun Jun 04 2023 19:02:34 GMT+0100 (GMT+01:00)",
//   "updatedAt": "Sun Jun 04 2023 19:02:34 GMT+0100 (GMT+01:00)",
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODc4M2M4OGMtYTA4MC00MDAxLWI4MjMtMTQ0NDMzMTllY2ZmIiwibmFtZSI6IkpvaG4gU25vdyIsImVtYWlsIjoiam9obi5zMm5vd0BlbWFpbC5jb20iLCJwYXNzd29yZCI6IjViYWE2MWU0YzliOTNmM2YwNjgyMjUwYjZjZjgzMzFiN2VlNjhmZDgiLCJpc0FjdGl2ZSI6dHJ1ZSwicm9sZSI6IkNMSUVOVCIsImNyZWF0ZWRBdCI6IlN1biBKdW4gMDQgMjAyMyAxOTowMjozNCBHTVQrMDEwMCAoR01UKzAxOjAwKSIsInVwZGF0ZWRBdCI6IlN1biBKdW4gMDQgMjAyMyAxOTowMjozNCBHTVQrMDEwMCAoR01UKzAxOjAwKSJ9LCJpYXQiOjE2ODU5MDE3ODIsImV4cCI6MTY4NTkwODk4Mn0.X8Ou1q5IPHM1HHJHuHGQkLmM0we4vHLttm5-YupwLIo"
// }

const createUserBody = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'John Snow',
    },
    email: {
      type: 'string',
      example: 'john.snow@email.com',
    },
    password: {
      type: 'string',
      example: 'password',
    },
  },
};
const userLoginBody = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      example: 'john.snow@email.com',
    },
    password: {
      type: 'string',
      example: 'password',
    },

  },
};

module.exports = {
  createUser, createUserBody, findOneUser, getAllUsers, loginUser, userLoginBody,
};
