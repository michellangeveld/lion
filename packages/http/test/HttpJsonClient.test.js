import { expect } from '@open-wc/testing';
import { stub } from 'sinon';
import { HttpJsonClient } from '../src/HttpJsonClient.js';

describe('HttpJsonClient', () => {
  /** @type {import('sinon').SinonStub} */
  let fetchStub;
  /** @type {HttpJsonClient} */
  let http;

  beforeEach(() => {
    fetchStub = stub(window, 'fetch');
    fetchStub.returns(Promise.resolve(new Response('"mock response"')));
    http = new HttpJsonClient();
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('sets json accept header', async () => {
    await http.request('/foo');
    const request = fetchStub.getCall(0).args[0];
    expect(request.headers.get('accept')).to.equal('application/json');
  });

  it('decodes response from json', async () => {
    fetchStub.returns(Promise.resolve(new Response('{"a":1,"b":2}')));
    const response = await http.request('/foo');
    expect(response.body).to.eql({ a: 1, b: 2 });
  });

  describe('given a request body', () => {
    it('encodes the request body as json', async () => {
      await http.request('/foo', { method: 'POST', body: { a: 1, b: 2 } });
      const request = fetchStub.getCall(0).args[0];
      expect(await request.text()).to.equal('{"a":1,"b":2}');
    });

    it('sets json content-type header', async () => {
      await http.request('/foo', { method: 'POST', body: { a: 1, b: 2 } });
      const request = fetchStub.getCall(0).args[0];
      expect(request.headers.get('content-type')).to.equal('application/json');
    });
  });

  describe('given a json prefix', () => {
    it('strips json prefix from response before decoding', async () => {
      const localHttp = new HttpJsonClient({ jsonPrefix: '//.,!' });
      fetchStub.returns(Promise.resolve(new Response('//.,!{"a":1,"b":2}')));
      const response = await localHttp.request('/foo');
      expect(response.body).to.eql({ a: 1, b: 2 });
    });
  });
});
