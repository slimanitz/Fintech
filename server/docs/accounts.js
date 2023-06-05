const { accountTypesEnum } = require('../utils/enums');

// POST /api/users/{userId}/accounts
const createUserBankAccount = {
  tags: ['Accounts'],
  description: 'Create a new user bank Account',
  operationId: 'createUserBankAccount',
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: 'userId',
      in: 'path',
      description: 'ID of the user who will own the created account',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ],
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
              id: {
                type: 'string',
                example: '21b93fa7-f4b9-4ae4-89f2-d67daa0aab7f',
              },
              balance: {
                type: 'int',
                example: 20000,
              },
              isActive: {
                type: 'boolean',
                example: true,
              },
              userId: {
                type: 'bb7b7e18-f339-4d97-879c-ab60e05851e0',
                example: true,
              },
              type: {
                type: 'string',
                example: 'BASIC',
              },
              iban: {
                type: 'string',
                example: 'KZ86003R4750340X3892',
              },
              currency: {
                type: 'string',
                example: 'KZT',
              },
            },
          },
        },
      },
    },
    400: {
      description: 'Bad payload',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Bad payload',
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
    type: {
      type: 'string',
      example: accountTypesEnum.BASIC,
      description: 'This field can be one of the following values [BASIC,SAVING,FROZEN]',
    },

  },
};

module.exports = { createUserBankAccount, createUserBankAccountBody };
