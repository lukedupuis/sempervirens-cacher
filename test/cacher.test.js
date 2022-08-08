import { expect } from 'chai';
import mongoose from 'mongoose';
import dao from '@sempervirens/dao';

import cacher from '../src/cacher.class.js';

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

describe('1. cacher', () => {

  describe('1.1. When cacher functions are called before the database is configured', () => {
    const fns = ['create', 'find', 'clear'];
    for (let i = 0; i < fns.length; i++) {
      const fn = fns[i];
      it(`1.1.1.${(i + 1)}. Should throw an error for "${fn}"`, async () => {
        try {
          await cacher[fn]();
        } catch({ message }) {
          expect(message).to.equal([
            'The @sempervirens/dao must be configured before calling ',
            '@sempervirens/cacher functions. ',
            'See https://www.npmjs.com/package/@sempervirens/dao for more information.'
          ].join(''));
        }
      });
    }
  });

  describe('1.2. When cacher functions are called after the database is configured', () => {

    let Page;
    before(() => {
      dao.config();
      cacher.find(''); // Invokes init the first time
      Page = dao.getModel('cache', 'Page');
    });

    describe('1.2. When "create" is called', () => {

      describe('1.2.1. When a record does not already exist', () => {
        it('1.2.1.1. Should create and return a new record', async () => {
          const url = getUrl('test-1');
          const record1 = await Page.findOne({ url });
          expect(record1).not.to.exist;
          const record2 = await cacher.create({ url, html });
          Page = dao.getModel('cache', 'Page');
          expect(record2.url).to.equal(url);
          await Page.deleteOne({ url });
        });
      });

      describe('1.2.2. When a record already exists', () => {
        it('1.2.2.1. Should return the existing record', async () => {
          const url = getUrl('test-1');
          const record1 = await Page.create({ url, html });
          const record2 = await cacher.create({ url, html });
          expect(record2._id.toString()).to.equal(record1._id.toString());
          await Page.deleteOne({ url });
        });
      });

    });

    describe('1.3. When "find" is called', () => {

      describe('1.3.1. When the record does not exist', () => {
        it('1.3.1.1. Should return "null"', async () => {
          const url = getUrl('test-1');
          const record = await cacher.find(url);
          expect(record).to.be.null;
        });
      });

      describe('1.3.2. When the record exists', () => {
        it('1.3.2.1. Should return the record', async () => {
          const url = getUrl('test-1');
          const record1 = await Page.create({ url, html });
          const record2 = await cacher.find(url);
          expect(record2._id.toString()).to.equal(record1._id.toString());
          await Page.deleteOne({ url });
        });
      });

    });

    describe('1.4. When "clear" is called', () => {

      describe('1.4.1. When "url" is given', () => {
        it('1.4.1.1. Should clear only the given record', async () => {
          const url1 = getUrl('test-1');
          const url2 = getUrl('test-2');
          await Page.create({ url: url1, html });
          await Page.create({ url: url2, html });
          await cacher.clear(url1);
          const record1 = await Page.findOne({ url: url1 });
          const record2 = await Page.findOne({ url: url2 });
          expect(record1).not.to.exist;
          expect(record2).to.exist;
        });
      });

      describe('1.4.2. When "url" is not given', () => {
        it('1.4.2.1. Should clear all records', async () => {
          const url1 = getUrl('test-1');
          const url2 = getUrl('test-2');
          await Page.create({ url: url1, html });
          await Page.create({ url: url2, html });
          await cacher.clear();
          const record1 = await Page.findOne({ url: url1 });
          const record2 = await Page.findOne({ url: url2 });
          expect(record1).not.to.exist;
          expect(record2).not.to.exist;
        });
      });

    });

    after(async () => {
      await new Promise(resolve => setTimeout(() => resolve(), 500));
      await dao.getDb('cache').connection.dropDatabase();
      process.exit();
    });

  });

});