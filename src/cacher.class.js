import dao from '@sempervirens/dao';

import pageModel from './page.model.js';

class Cacher {

  #Model = null;

  constructor() {}

  #init() {
    if (this.#Model) return;
    try {
      dao.initDb({
        name: 'cache',
        models: [pageModel]
      });
      this.#Model = dao.getModel('cache', 'Page');
    } catch(error) {
      if (error.message == "Cannot read properties of null (reading 'model')") {
        throw new Error([
          'The @sempervirens/dao must be configured before calling ',
          '@sempervirens/cacher functions. ',
          'See https://www.npmjs.com/package/@sempervirens/dao for more information.'
        ].join(''));
      } else {
        throw error;
      }
    }
  }

  async create({ url, html } = {}) {
    if (!this.#Model) this.#init();
    const record = await this.find(url);
    if (record) return record;
    return (await this.#Model.create({ url, html })).toObject();
  }

  async find(url) {
    if (!this.#Model) this.#init();
    return await this.#Model.findOne({ url }).lean();
  }

  async clear(url = '') {
    if (!this.#Model) this.#init();
    if (url) {
      await this.#Model.deleteOne({ url });
    } else {
      await this.#Model.deleteMany();
    }
  }

}

export default new Cacher();
