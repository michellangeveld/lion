/* eslint-disable consistent-return */
import { acceptLanguageRequestTransformer, createXSRFRequestTransformer } from './transformers.js';
import { HttpClientFetchError } from './HttpClientFetchError.js';

/**
 * @typedef {Object} HttpClientConfig configuration for the AjaxClass instance
 * @property {boolean} addAcceptLanguage the Accept-Language request HTTP header advertises
 * which languages the client is able to understand, and which locale variant is preferred.
 * @property {string} xsrfCookieName name of the XSRF cookie to read from
 * @property {string} xsrfHeaderName name of the XSRF header to set
 */

/**
 * Transforms a Request before fetching. Must return an instance of Request or Response.
 * If a Respone is returned, the network call is skipped and it is returned as is.
 * @typedef {(request: Request) => Request | Response} RequestTransformer
 */

/**
 * Transforms a Response before returning. Must return an instance of Response.
 * @typedef {(response: Response) => Response} ResponseTransformer
 */

/**
 * HTTP Client which acts as a small wrapper around `fetch`. Allows registering hooks which
 * transform request and responses, for example to add authorization headers or logging. A
 * request can also be prevented from reaching the network at all by returning the Response directly.
 */
export class HttpClient {
  /**
   * @param {HttpClientConfig} config
   */
  constructor(config = {}) {
    const {
      addAcceptLanguage = true,
      xsrfCookieName = 'XSRF-TOKEN',
      xsrfHeaderName = 'X-XSRF-TOKEN',
    } = config;

    /** @type {RequestTransformer[]} */
    this._requestTransformers = [];
    /** @type {ResponseTransformer[]} */
    this._responseTransformers = [];

    if (addAcceptLanguage) {
      this.addRequestTransformer(acceptLanguageRequestTransformer);
    }

    if (xsrfCookieName && xsrfHeaderName) {
      this.addRequestTransformer(createXSRFRequestTransformer(xsrfCookieName, xsrfHeaderName));
    }
  }

  /** @param {RequestTransformer} requestTransformer */
  addRequestTransformer(requestTransformer) {
    this._requestTransformers.push(requestTransformer);
  }

  /** @param {RequestTransformer} requestTransformer */
  removeRequestTransformer(requestTransformer) {
    const indexOf = this._requestTransformers.indexOf(requestTransformer);
    if (indexOf !== -1) {
      this._requestTransformers.splice(indexOf);
    }
  }

  /** @param {ResponseTransformer} responseTransformer */
  addResponseTransformer(responseTransformer) {
    this._responseTransformers.push(responseTransformer);
  }

  /** @param {ResponseTransformer} responseTransformer */
  removeResponseTransformer(responseTransformer) {
    const indexOf = this._responseTransformers.indexOf(responseTransformer);
    if (indexOf !== -1) {
      this._responseTransformers.splice(indexOf, 1);
    }
  }

  /**
   * Makes a fetch request, calling the registered fetch request and response
   * transformers.
   *
   * @param {RequestInfo} info
   * @param {RequestInit} [init]
   * @returns {Promise<Response>}
   */
  async request(info, init) {
    const request = new Request(info, init);
    /** @type {Request | Response} */
    let transformedRequestOrResponse = request;

    // run request transformers, returning directly and skipping the network
    // if a transformer returns a Response
    this._requestTransformers.forEach(transform => {
      transformedRequestOrResponse = transform(transformedRequestOrResponse);
      if (transformedRequestOrResponse instanceof Response) {
        return transformedRequestOrResponse;
      }
    });

    const response = await fetch(transformedRequestOrResponse);
    const transformedResponse = this._responseTransformers.reduce(
      (prev, transform) => transform(prev),
      response,
    );
    if (transformedResponse.status >= 400 && transformedResponse.status < 600) {
      throw new HttpClientFetchError(request, transformedResponse);
    }
    return transformedResponse;
  }
}
