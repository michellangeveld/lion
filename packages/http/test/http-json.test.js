import { expect } from '@open-wc/testing';
import { httpJson, setHttpJson } from '../src/http-json.js';
import { HttpJsonClient } from '../src/HttpJsonClient.js';

describe('http-json', () => {
  it('exports an instance of HttpJsonClient', () => {
    expect(httpJson).to.be.an.instanceOf(HttpJsonClient);
  });

  it('can replace http with another instance', () => {
    const newHttp = new HttpJsonClient();
    setHttpJson(newHttp);
    expect(httpJson).to.equal(newHttp);
  });
});
