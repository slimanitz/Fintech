// /* eslint-disable no-underscore-dangle */
// const request = require('supertest');
// const { default: mongoose } = require('mongoose');
// const app = require('./config/server');
// const connect = require('./config/database');
// const { mongoUrl, host, jwtSecret } = require('./config/vars');

// describe('Check before launching tests', () => {
//   beforeAll(async () => {
//     await connect();
//   });

//   test('Should make sure that we are using the test env variables ', () => {
//     console.log('====================================');
//     console.log(mongoUrl);
//     console.log(host);
//     console.log(jwtSecret);
//     mongoose.connection.db.dropDatabase(() => console.log('Database dropped succesfully'));
//     console.log('====================================');
//     expect(process.env.APP_ENV).toEqual('test');
//   });
// });

// describe('Testing API Endpoints API', () => {
//   let server;

//   beforeAll(() => {
//     server = app.listen(8080, async () => {
//       await connect();
//       console.log('Express server started on port 8080');
//     });
//   });

//   afterAll(() => {
//     server.close();
//   });
//   let agency = {
//     name: 'orpi',
//     address: 'une address',
//     city: 'Paris',
//     postalCode: '75003',
//     website: 'https://www.orpi.com',
//   };

//   let user = {
//     email: 'slimane234@gmail.com',
//     password: 'password',
//     name: 'Slimaneber',
//   };

//   afterEach(() => {
//     agency = {
//       _id: agency._id,
//       name: 'orpi',
//       address: 'une address',
//       city: 'Paris',
//       postalCode: '75003',
//       website: 'https://www.orpi.com',
//     };
//     user = {
//       _id: user._id,
//       email: 'slimane.berrada.01@gmail.com',
//       password: 'password',
//       name: 'Slimaneber',
//       agency: agency._id,
//     };
//   });

//   describe('POST /api/agencies', () => {
//     it('should create a agency', async () => {
//       const res = await request(app).post('/api/agencies').send(agency);
//       agency._id = res.body._id;
//       expect(res.status).toEqual(200);
//       expect(res.body.name).toEqual(agency.name);
//     });
//   });

//   describe('GET /api/agencies', () => {
//     it('should return all agencies', async () => {
//       const res = await request(app).get('/api/agencies');
//       expect(res.status).toEqual(200);
//       expect(res.body).toContainEqual(agency);
//     });
//   });

//   describe('GET /api/agencies/:id', () => {
//     it('should return a single agency by id', async () => {
//       const res = await request(app).get(`/api/agencies/${agency._id}`);
//       expect(res.status).toEqual(200);
//       expect(res.body.name).toEqual(agency.name);
//     });

//     it('should return 404 if agency is not found', async () => {
//       const res = await request(app).get('/api/agencies/99');
//       expect(res.status).toEqual(404);
//     });
//   });

//   describe('PATCH /api/agencies/:id', () => {
//     it('should update an existing agency', async () => {
//       const updatedAgency = {
//         name: 'La foret',
//         address: 'une address',
//         city: 'Paris',
//         postalCode: '75003',
//         website: 'https://www.orpi.com',
//       };
//       const res = await request(app)
//         .patch(`/api/agencies/${agency._id}`)
//         .send(updatedAgency);
//       expect(res.status).toEqual(200);
//       expect(res.body).toEqual({ ...updatedAgency, _id: agency._id });
//     });

//     it('should return 404 if agency is not found', async () => {
//       const res = await request(app).put('/api/agencies/99').send({ name: 'La foret' });
//       expect(res.status).toEqual(404);
//     });
//   });

//   describe('DELETE /api/agencies/:id', () => {
//     it('should delete an existing agency', async () => {
//       const res = await request(app).delete(`/api/agencies/${agency._id}`);
//       expect(res.status).toEqual(200);
//     });

//     it('should return 404 if agency is not found', async () => {
//       const res = await request(app).delete('/api/agencies/99');
//       expect(res.status).toEqual(404);
//     });
//   });

//   // ================USER=================

//   describe('POST /api/users', () => {
//     it('should create a user', async () => {
//       const res = await request(app).post('/api/users').send(user);
//       user._id = res.body._id;
//       expect(res.status).toEqual(200);
//       expect(res.body.name).toEqual(user.name);
//     });
//   });

//   describe('GET /api/users', () => {
//     it('should return all users', async () => {
//       const res = await request(app).get('/api/users');
//       expect(res.status).toEqual(200);
//       expect(res.body[0].email).toEqual(user.email);
//     });
//   });

//   describe('GET /api/users/:id', () => {
//     it('should return a single user by id', async () => {
//       const res = await request(app).get(`/api/users/${user._id}`);
//       expect(res.status).toEqual(200);
//       expect(res.body.name).toEqual(user.name);
//     });

//     it('should return 404 if user is not found', async () => {
//       const res = await request(app).get('/api/users/99');
//       expect(res.status).toEqual(404);
//     });
//   });

//   describe('POST /api/users/login', () => {
//     it('should return a jwt', async () => {
//       const res = await request(app).post('/api/users/login').send({ email: user.email, password: user.password });
//       expect(res.status).toEqual(200);
//     });

//     it('Should return code 401 on wrong credentials', async () => {
//       const res = await request(app).post('/api/users/login').send({ email: user.email, password: 'notpassword' });
//       expect(res.status).toEqual(401);
//     });
//   });

//   describe('PATCH /api/users/:id', () => {
//     it('should update an existing user', async () => {
//       const updatedUser = {
//         email: 'slimane.berrada.01@gmail.com',
//         password: 'password',
//         name: 'Slimane',
//         agency: agency._id,
//       };
//       const res = await request(app)
//         .patch(`/api/users/${user._id}`)
//         .send(updatedUser);
//       expect(res.status).toEqual(200);
//       expect(res.body.name).toEqual(updatedUser.name);
//     });

//     it('should return 404 if user is not found', async () => {
//       const res = await request(app).put('/api/users/99').send({ name: 'Slimane' });
//       expect(res.status).toEqual(404);
//     });
//   });

//   describe('DELETE /api/users/:id', () => {
//     it('should delete an existing user', async () => {
//       const res = await request(app).delete(`/api/users/${user._id}`);
//       expect(res.status).toEqual(200);
//     });

//     it('should return 404 if user is not found', async () => {
//       const res = await request(app).delete('/api/users/99');
//       expect(res.status).toEqual(404);
//     });
//   });
// });
