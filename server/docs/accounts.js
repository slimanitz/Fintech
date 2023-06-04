const createUserBankAccount = {
  tags: ['Accounts'],
  description: 'Create a new user bank Account',
  operationId: 'createUserBankAccount',
  security: { basicJWT: [] },
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/createUserBankAccountBody',
        },
      },
    },
    required: true,
  },
  responses: {
    200: {
      description: 'Bank account created successfully !',
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

const createUserBankAccountBody = {
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

module.exports = { createUserBankAccount, createUserBankAccountBody };
