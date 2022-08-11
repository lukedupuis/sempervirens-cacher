import { expect } from 'chai';
import express from 'express';
import superagent from 'superagent';
import http from 'http';
import { readFileSync } from 'fs';
import dao from '@sempervirens/dao';
import authorizer from '@sempervirens/authorizer';

import { CacheRequestHandler, pageModel } from '../index.js';

dao.initDb({
  host: 'localhost',
  port: '27017',
  name: 'cache',
  models: [pageModel]
});

const Page = dao.getModel('cache', 'Page');

const getUrl = path => `http://localhost:8080/${path}`;
const html = `
<html>
  <head>
    <title>Test 1</title>
  </head>
  <body>
    <h1>Test 1</h1>
  </body>
</html>
`

const jwtPublicKey = readFileSync('./security/jwt/jwtRS256.key.pub', 'utf8');
const jwtPrivateKey = readFileSync('./security/jwt/jwtRS256.key', 'utf8');
authorizer.init({ jwtPublicKey, jwtPrivateKey });

const app = express();
app.use(express.json());

app.get('/cache/:action?', (req, res) => {
  new CacheRequestHandler({ req, res, isSecure: true });
});

http.createServer(app).listen(8080);

describe('1. cache.request-handler', () => {

  describe('1.1. When not authorized', () => {

    describe('1.1.1. When called with "clear" and no URL', () => {
      it('1.1.1. Should return an error and not delete any records', async () => {
        const record = await Page.create({ url: getUrl('test-1'), html });
        const _id = record._id.toString();
        try {
          await superagent.get('http://localhost:8080/cache/clear');
        } catch({ message }) {
          expect(message).to.equal('Unauthorized');
          expect(await Page.findOne({ _id }).lean()).to.exist;
          await Page.deleteOne({ _id });
        }
      });
    });

  });

  describe('1.2. When authorized', () => {

    describe('1.2.1. When called with "clear" and no URL', () => {
      it('1.2.1.1. Should delete all records', async () => {
        const record1 = await Page.create({ url: getUrl('test-1'), html });
        const _id1 = record1._id.toString();
        const record2 = await Page.create({ url: getUrl('test-1'), html });
        const _id2 = record2._id.toString();
        const token = authorizer.encrypt({ expiresIn: '1m', data: { prop1: 'val1' } });
        const { body: { message } } = await superagent
          .get('http://localhost:8080/cache/clear')
          .set('Authorization', `Bearer ${token}`);
        expect(message).to.equal('Success');
        expect(await Page.findOne({ _id: _id1 }).lean()).not.to.exist;
        expect(await Page.findOne({ _id: _id2 }).lean()).not.to.exist;
      });
    });

  });

  after(async () => {
    await dao.getDb('cache').connection.dropDatabase();
    setTimeout(() => process.exit(), 100);
  });

});