import { RequestHandler } from '@sempervirens/endpoint';

import cacher from './cacher.class.js';

class CacheRequestHandler extends RequestHandler {

  constructor({ req, res, data, isSecure }) {
   super({ req, res, data, isSecure });
   if (!this.isAuthorized) return;
   this.#init(req.params);
  }

  async #init({ action }) {
    try {
      if (action == 'clear') {
        await cacher.clear();
      }
      this.send();
    } catch(error) {
      this.error({ number: 295929, error });
    }
  }

}

export default CacheRequestHandler;