const {
  createUserBody, createUser, findOneUser, getAllUsers,
} = require('./users');

const apiDocumentation = {
  openapi: '3.0.1',
  info: {
    version: '1.3.0',
    title: 'My REST API - Documentation',
    description: 'Description of my API here',
    termsOfService: 'https://mysite.com/terms',
    contact: {
      name: 'Fintech',
      email: 'slimane@scaa.fr',
      url: 'https://devwebsite.com',
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080/',
      description: 'Local Server',
    },
    {
      url: 'https://api.mysite.com',
      description: 'Production Server',
    },
  ],
  tags: [
    {
      name: 'Users',
      description: 'User Entity',
    },
    {
      name: 'Accounts',
      description: 'Bank account entity',
    },
    {
      name: 'Credit Cards',
      description: 'Bank account entity',
    },
    {
      name: 'Transactions',
      description:
        'Transaction entity which will regroup multiple types of transactions (Bank deposits, Bank transfer, Credit Card Payments)',
    },
    {
      name: 'Subscriptions',
      description:
        'Subscription entity which will regroup monthly salaries, loans etc...',
    },
  ],
  paths: {
    '/api/users': {
      post: createUser,
      get: getAllUsers,
    },
    '/api/users/{id}': {
      get: findOneUser,
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      createUserBody,
    },
  },
};

module.exports = apiDocumentation;
