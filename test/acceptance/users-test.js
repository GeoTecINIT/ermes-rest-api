var request = require('supertest');
var http = require('http');
var path = require('path');
var expect = require('chai').expect;

describe('User services', function() {

  var server;

  beforeEach(function() {
    "use strict";

    return require('require-reload')('../../server').then((serverInstance) => {
      server = serverInstance;
    });
  });

  afterEach(function(done) {
    "use strict";

    server.close(done);
  });

  describe('GET /users', function () {
    it('should return a list of users', function (done) {
      request(server)
        .get('/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          "users": []
        },done);
    });
  });

  describe('POST /users', function() {
    "use strict";
    it('should create an owner', function(done) {
      request(server)
        .post('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .send({"user": {
          "username": "Alberto",
          "password": "aslfjskdf",
          "email": "example@example.com",
          "region": "spain",
          "profile": "local",
          "type": "owner",
          "language": "es"
        }})
        .expect(201)
        .end(done);
    });

    it('should not create a collaborator with an invalid owner', function(done) {
      request(server)
        .post('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .send({"user": {
          "username": "Nacho",
          "password": "aslfjskdf",
          "email": "nacho@example.com",
          "region": "spain",
          "profile": "local",
          "type": "collaborator",
          "language": "es",
          "collaboratesWith": "AlBerto"
        }})
        .expect(200, done);
    });

    it('should create a collaborator for an existing owner', function(done) {

      request(server)
        .post('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({"user": {
          "username": "Alberto",
          "password": "aslfjskdf",
          "email": "example@example.com",
          "region": "spain",
          "profile": "local",
          "type": "owner",
          "language": "es"
        }})
        .expect(201)
        .end(() => {
          request(server)
            .post('/users')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .send({"user": {
              "username": "Nacho",
              "password": "aslfjskdf",
              "email": "nacho@example.com",
              "region": "spain",
              "profile": "local",
              "type": "collaborator",
              "language": "es",
              "collaboratesWith": "AlBerto"
            }})
            .expect(201, done);
        });
    });
  });

  describe('GET /users/:username/collaborators', function() {
    "use strict";

    it('should list user collaborators', function(done) {

      request(server)
        .post('/users')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({"user": {
          "username": "Alberto",
          "password": "aslfjskdf",
          "email": "example@example.com",
          "region": "spain",
          "profile": "local",
          "type": "owner",
          "language": "es"
        }})
        .expect(201)
        .end(() => {
          request(server)
            .post('/users')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .send({"user": {
              "username": "Nacho",
              "password": "aslfjskdf",
              "email": "nacho@example.com",
              "region": "spain",
              "profile": "local",
              "type": "collaborator",
              "language": "es",
              "collaboratesWith": "AlBerto"
            }})
            .expect(201)
            .end(() => {
              request(server)
                .get('/users/alberto/collaborators')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200)
                .expect((res) => {
                  expect(res.body.collaborators.length).to.equal(1);
                })
                .end(done);
            });
        });
    })
  })
});