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
      example: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8',
    },
    enabled: {
      type: 'boolean',
      example: true,
    },
    role: {
      type: 'string',
      example: '',
    },
  },
};

module.exports = { createUser, createUserBody, findOneUser };
