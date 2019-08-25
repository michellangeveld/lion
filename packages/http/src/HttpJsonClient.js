import { HttpClient } from './HttpClient.js';

/**
 * @typedef {import('./HttpClient').HttpClientConfig} HttpJsonClientConfig configuration for the AjaxClass instance
 * @property {string} jsonPrefix prefixing the JSON string in this manner is used to help
 * prevent JSON Hijacking. The prefix renders the string syntactically invalid as a script so
 * that it cannot be hijacked. This prefix should be stripped before parsing the string as JSON.
 */

/**
 * Extension of HttpClient, adding convenient functionality when dealing with JSON requests and responses.
 *
 * Any request body is JSON encoded automatically, and responses are automatically decoded from JSON. This
 * way you don't need to do an extra body transform.
 */
export class HttpJsonClient extends HttpClient {
  /**
   * @param {HttpJsonClientConfig} config
   */
  constructor(config = {}) {
    super(config);

    this._jsonPrefix = config.jsonPrefix;
  }

  /**
   * Makes a fetch request, calling the registered fetch request and response
   * transformers. Encodes/decodes the request and response body as JSON.
   *
   * @param {RequestInfo} info
   * @param {RequestInit} [init]
   * @template T
   * @returns {Promise<{ response: Response, body: T }>}
   */
  async request(info, init) {
    const jsonInit = {
      ...init,
      headers: {
        ...(init && init.headers),
        accept: 'application/json',
      },
    };

    if (init && init.body) {
      jsonInit.headers['content-type'] = 'application/json';
      jsonInit.body = JSON.stringify(init.body);
    }

    const response = await super.request(info, jsonInit);
    let responseText = await response.text();

    if (typeof this._jsonPrefix === 'string') {
      if (responseText.startsWith(this._jsonPrefix)) {
        responseText = responseText.substring(this._jsonPrefix.length);
      }
    }

    try {
      return {
        response,
        body: JSON.parse(responseText),
      };
    } catch (error) {
      throw new Error(`Failed to parse response from ${response.url} as JSON.`);
    }
  }
}
