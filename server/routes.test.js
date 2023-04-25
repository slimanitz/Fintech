const request = require('supertest');
const httpStatus = require('http-status');
const app = require('./config/server');
const { connect, sequelize } = require('./config/database');
const { transactionGatewayEnum, accountTypesEnum, subscriptionFrequency } = require('./utils/enums');
const { redisClient } = require('./config/cache');

describe('Check before launching tests', () => {
  beforeAll(async () => {
    await connect();
  });

  test('Should make sure that we are using the test env variables ', async () => {
    if (process.env.APP_ENV === 'test') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.sync({ force: true });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    expect(process.env.APP_ENV).toEqual('test');
  }, 10000);
});

describe('Testing Client API Endpoints', () => {
  let server;

  beforeAll(() => {
    server = app.listen(8080, async () => {
      await connect();
      console.log('Express server started on port 8080');
    });
  });

  afterAll(() => {
    server.close();
    sequelize.close();
    redisClient.quit();
  });

  const user = {
    email: 'slimaneber@gmail.com',
    password: 'password',
    name: 'Slimaneber',
  };
  let account;
  let creditCard;
  let transaction;
  let subscription;
  let token = 'Bearer ';

  // ================USER=================

  describe('POST /api/users', () => {
    test('should create an account', async () => {
      const res = await request(app).post('/api/users').send(user);
      user.id = res.body.id;
      expect(res.status).toEqual(200);
      expect(res.body.email).toEqual(user.email);
    });
  });

  describe('POST /api/users/login', () => {
    test('Should login an return a token', async () => {
      const { email, password } = user;
      const res = await request(app).post('/api/users/login').send({ email, password });
      expect(res.status).toEqual(200);
      token += res.body.token;
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return a single user by id', async () => {
      const res = await request(app).get(`/api/users/${user.id}`);
      expect(res.status).toEqual(200);
      expect(res.body.email).toEqual(user.email);
    });

    test('should return 404 if agency is not found', async () => {
      const res = await request(app).get('/api/users/99');
      expect(res.status).toEqual(404);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update an existing user', async () => {
      const updatedUser = {
        name: 'Sliman',
        email: 'slimaneber2001@gmail.com',
      };
      const res = await request(app)
        .patch(`/api/users/${user.id}`)
        .send(updatedUser);
      expect(res.status).toEqual(200);
    });

    it('should return 404 if user is not found', async () => {
      const res = await request(app).put('/api/users/99').send({ name: 'test' });
      expect(res.status).toEqual(404);
    });
  });

  // ================Account=================

  describe('POST /api/users/:userId/accounts', () => {
    test('should create an account ', async () => {
      const res = await request(app).post(`/api/users/${user.id}/accounts`).set('Authorization', token).send({ type: accountTypesEnum.BASIC });
      account = res.body;
      expect(res.status).toEqual(200);
      expect(res.body.balance).toEqual(0);
    });

    describe('Authentication check on POST /api/users/:userId/accounts', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).post(`/api/users/${user.id}/accounts`).send(account);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /api/users/:userId/accounts', () => {
    test('should return all user accounts', async () => {
      const res = await request(app).get(`/api/users/${user.id}/accounts`).set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body[0].userId).toEqual(user.id);
    });

    describe('Authentication check on GET /api/users/:userId/accounts', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).get(`/api/users/${user.id}/accounts`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /api/users/:userId/accounts/:accountId', () => {
    test('should return all user accounts', async () => {
      const res = await request(app).get(`/api/users/${user.id}/accounts/${account.id}`).set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body.userId).toEqual(user.id);
      expect(res.body.id).toEqual(account.id);
    });

    describe('Authentication check on GET /api/users/:userId/accounts', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).get(`/api/users/${user.id}/accounts`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('PATCH /api/users/:userId/accounts/:accountId', () => {
    test('should return update user accounts', async () => {
      const res = await request(app).patch(`/api/users/${user.id}/accounts/${account.id}`).set('Authorization', token).send({ isActive: false });
      expect(res.status).toEqual(200);
    });

    test('Authentication check should return FORBIDDEN', async () => {
      const res = await request(app).patch(`/api/users/${user.id}/accounts/${account.id}`);
      expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });

  // ================Credit cards=================

  describe('POST /api/users/:userId/accounts/:accountId/credit-cards', () => {
    test('should create a creditCard ', async () => {
      const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/credit-cards`).set('Authorization', token);
      creditCard = res.body;
      expect(res.status).toEqual(200);
      expect(res.body.userId).toEqual(user.id);
      expect(res.body.accountId).toEqual(account.id);
    });

    describe('Authentication check on POST /api/users/:userId/accounts', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/credit-cards`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /api/users/:userId/credit-cards', () => {
    test('should return All users creditCards  ', async () => {
      const res = await request(app).get(`/api/users/${user.id}/credit-cards`).set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body[0].id).toEqual(creditCard.id);
    });

    describe('Authentication check on GET /api/users/:userId/credit-cards', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).get(`/api/users/${user.id}/credit-cards`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('GET /api/users/:userId/credit-cards/:creditCardId', () => {
    test('should return  users creditCard  ', async () => {
      const res = await request(app).get(`/api/users/${user.id}/credit-cards/${creditCard.id}`).set('Authorization', token);
      expect(res.status).toEqual(200);
      expect(res.body.id).toEqual(creditCard.id);
    });

    describe('Authentication check on GET /api/users/:userId/credit-cards/:creditCardId', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).get(`/api/users/${user.id}/credit-cards/${creditCard.id}`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('PATCH /api/users/:userId/credit-cards/:creditCardId', () => {
    test('should return update a creditCard', async () => {
      const updatedValues = { allowedLimit: 20000 };
      const res = await request(app).patch(`/api/users/${user.id}/credit-cards/${creditCard.id}`).set('Authorization', token).send(updatedValues);
      expect(res.status).toEqual(200);
    });

    describe('Authentication check on PATCH /api/users/:userId/credit-cards', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).patch(`/api/users/${user.id}/credit-cards/${creditCard.id}`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });

    describe('Allowed fields check on PATCH /api/users/:userId/credit-cards', () => {
      test('should return BAD_REQUEST', async () => {
        const updatedValues = { isActive: false, securityCode: '213' };
        const res = await request(app).patch(`/api/users/${user.id}/credit-cards/${creditCard.id}`).set('Authorization', token).send(updatedValues);
        expect(res.status).toEqual(httpStatus.BAD_REQUEST);
      });
    });
  });

  // ================Transactions=================

  describe('POST /api/users/:userId/accounts/:accountId/transactions', () => {
    test('should create a transaction with bank transafer', async () => {
      const accountResponse = await request(app).post(`/api/users/${user.id}/accounts`).set('Authorization', token).send({ type: accountTypesEnum.BASIC });
      const creditAccount = accountResponse.body;

      const payload = {
        amount: 2000,
        gateway: transactionGatewayEnum.TRANSFER,
        creditAccountIban: creditAccount.iban,
        comment: 'Test transaction',
      };

      const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/transactions`).set('Authorization', token).send(payload);
      transaction = res.body;
      expect(res.status).toEqual(200);
      expect(res.body.amount).toEqual(2000);
      expect(res.body.debitAccountId).toEqual(account.id);
      expect(res.body.creditAccountId).toEqual(creditAccount.id);
      expect(res.body.currencyExchange).toEqual(`${account.currency}/${creditAccount.currency}`);
    });
    test('should create a transaction with bank DEPOSIT', async () => {
      const accountResponse = await request(app).post(`/api/users/${user.id}/accounts`).set('Authorization', token).send({ type: accountTypesEnum.BASIC });
      const creditAccount = accountResponse.body;

      const payload = {
        amount: 2000,
        gateway: transactionGatewayEnum.DEPOSIT,
        creditAccountIban: creditAccount.iban,
        comment: 'Test transaction',
      };

      const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/transactions`).set('Authorization', token).send(payload);
      expect(res.status).toEqual(200);
      expect(res.body.amount).toEqual(2000);
      expect(res.body.debitAccountId).toEqual(account.id);
      expect(res.body.creditAccountId).toEqual(creditAccount.id);
      expect(res.body.currencyExchange).toEqual(`${creditAccount.currency}/${creditAccount.currency}`);
    });

    test('should create a transaction with bank CHECK', async () => {
      const accountResponse = await request(app).post(`/api/users/${user.id}/accounts`).set('Authorization', token).send({ type: accountTypesEnum.BASIC });
      const creditAccount = accountResponse.body;

      const payload = {
        amount: 2000,
        gateway: transactionGatewayEnum.CHECK,
        creditAccountIban: creditAccount.iban,
        comment: 'Test transaction',
      };

      const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/transactions`).set('Authorization', token).send(payload);
      expect(res.status).toEqual(200);
      expect(res.body.amount).toEqual(2000);
      expect(res.body.debitAccountId).toEqual(account.id);
      expect(res.body.creditAccountId).toEqual(creditAccount.id);
      expect(res.body.currencyExchange).toEqual(`${account.currency}/${creditAccount.currency}`);
    });

    test('should create a transaction with credit Card ', async () => {
      const newUser = await request(app).post('/api/users').send({ email: 'test@check.com', password: 'password', name: 'Slimane' });
      const login = await request(app).post('/api/users/login').send({ email: newUser.body.email, password: 'password' });
      const accountResponse = await request(app).post(`/api/users/${newUser.body.id}/accounts`).set('Authorization', `Bearer ${login.body.token}`).send({ type: accountTypesEnum.BASIC });
      const creditAccount = accountResponse.body;

      const payload = {
        amount: 2000,
        gateway: transactionGatewayEnum.CREDIT_CARD,
        creditAccountIban: creditAccount.iban,
        comment: 'Test transaction',
        creditCardInfo: {
          number: creditCard.number,
          securityCode: creditCard.securityCode,
          expirationDate: creditCard.expirationDate,
        },
      };

      const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/transactions`).set('Authorization', token).send(payload);
      expect(res.status).toEqual(200);
      expect(res.body.amount).toEqual(2000);
      expect(res.body.debitAccountId).toEqual(account.id);
      expect(res.body.creditAccountId).toEqual(creditAccount.id);
    });

    describe('Authentication check on POST /api/users/:userId/accounts/:accountId/transactions', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/transactions`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });

    describe('Check the fact that we can t use the same account', () => {
      test('should return CONFLICT', async () => {
        const payload = {
          amount: 2000,
          gateway: transactionGatewayEnum.TRANSFER,
          creditAccountIban: account.iban,
          comment: 'Test transaction ',
        };

        const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/transactions`).set('Authorization', token).send(payload);
        expect(res.status).toEqual(httpStatus.CONFLICT);
      });
    });

    describe('Check the fact that we can t make a transaction between someone else s saving account', () => {
      test('should return CONFLICT', async () => {
        const userResponse = await request(app).post('/api/users').send({ email: 'example@gmail.com', password: 'password', name: 'example' });
        const accountResponse = await request(app).post(`/api/users/${userResponse.body.id}/accounts`).set('Authorization', token).send({ type: accountTypesEnum.SAVING });
        const creditAccount = accountResponse.body;

        const payload = {
          amount: 2000,
          gateway: transactionGatewayEnum.TRANSFER,
          creditAccountIban: creditAccount.iban,
          comment: 'Test transaction ',
        };

        const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/transactions`).set('Authorization', token).send(payload);
        expect(res.status).toEqual(httpStatus.CONFLICT);
      });
    });

    describe('GET /api/users/:userId/transactions', () => {
      test('should return All users transactions  ', async () => {
        const res = await request(app).get(`/api/users/${user.id}/transactions`).set('Authorization', token);
        expect(res.status).toEqual(200);
        expect(res.body.some(({ id }) => id === transaction.id)).toBe(true);
      });
    });

    describe('GET /api/users/:userId/transactions/:transactionId', () => {
      test('should return  users transactions by ID  ', async () => {
        const res = await request(app).get(`/api/users/${user.id}/transactions/${transaction.id}`).set('Authorization', token);
        expect(res.status).toEqual(200);
        expect(res.body.id).toEqual(transaction.id);
      });

      describe('Authentication check on GET /api/users/:userId/transactions/:transactionId', () => {
        test('should return FORBIDDEN', async () => {
          const res = await request(app).get('/api/users/:userId/transactions/:transactionId');
          expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
        });
      });
    });

    // ================Subscriptions=================
    describe('POST /api/users/:userId/accounts/:accountId/subscriptions', () => {
      test('should return a subscription', async () => {
        const userResponse = await request(app).post('/api/users').send({ email: 'example2@gmail.com', password: 'password', name: 'example' });
        const accountResponse = await request(app).post(`/api/users/${userResponse.body.id}/accounts`).set('Authorization', token).send({ type: accountTypesEnum.BASIC });
        const creditAccount = accountResponse.body;

        const payload = {
          amount: 2000,
          creditAccountIban: creditAccount.iban,
          name: 'Test Subscription ',
          frequency: subscriptionFrequency.MONTHLY,
          finishDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        };

        const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/subscriptions`).set('Authorization', token).send(payload);
        subscription = res.body;
        expect(res.status).toEqual(httpStatus.OK);
      });
    });

    describe('Authentication check on POST /api/users/:userId/accounts/:accountId/subscriptions', () => {
      test('should return FORBIDDEN', async () => {
        const res = await request(app).post(`/api/users/${user.id}/accounts/${account.id}/subscriptions`);
        expect(res.status).toEqual(httpStatus.UNAUTHORIZED);
      });
    });

    describe('GET /api/users/:userId/subscriptions', () => {
      test('should return All users subscriptions  ', async () => {
        const res = await request(app).get(`/api/users/${user.id}/subscriptions`).set('Authorization', token);
        expect(res.status).toEqual(200);
        expect(res.body.some(({ id }) => id === subscription.id)).toBe(true);
      });
    });

    describe('PATCH /api/users/:userId/accounts/:accountId/subscriptions', () => {
      test('should return a subscription', async () => {
        const payload = {
          name: 'Test Subscription  2',
          isCancelled: true,
        };

        const res = await request(app).patch(`/api/users/${user.id}/subscriptions/${subscription.id}`).set('Authorization', token).send(payload);
        expect(res.status).toEqual(httpStatus.OK);
      });
    });
  });
});
