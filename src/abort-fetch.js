'use strict';
const fetch = require('node-fetch');
const { T, always, applyTo, compose, cond, dissoc, identical, identity, type } = require('ramda');
const ms = require('ms');
const AbortController = require('abort-controller');
const isRedirect = require('is-redirect');

/**
 * @type {number}
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Returns a function that checks whether a given value is
 * of the `valueType` type.
 * @param {string} valueType The type to check for.
 * @returns {(value:string) => boolean}
 */
const typeIs = valueType => value => applyTo(value, compose(identical(valueType), type));

/**
 * @function
 */
const getTimeoutMs = cond([
  [typeIs('String'), ms],
  [typeIs('Number'), identity],
  [T, always(DEFAULT_TIMEOUT)]
]);

/**
 * Checks if the given response has been redirected (3xx status).
 *
 * @param {Response} res The response object.
 * @returns {boolean} Whether the response was redirected or not.
 */
const responseRedirected = res => res.redirected || isRedirect(res.status);

/**
 * Fetch implementation with request cancellation support.
 *
 * @typedef {Object} AbortRequestInit
 * @property {string|number} [timeout] Time before aborting the request (supports either milliseconds or
 *  a string parsable through `@zeit/ms`). Defaults to 10s.
 *
 * @param {string} url A string representing the URL for fetching.
 * @param {AbortRequestInit & RequestInit} options Options for the HTTP(S) request extended by
 *  supporting an extra `timeout` option.
 * @returns {Promise.<Response>} Resolves to the response object.
 */
async function abortFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, getTimeoutMs(options.timeout));

  try {
    const res = await fetch(url, { ...dissoc('timeout', options), signal: controller.signal });

    if (!res.ok && !responseRedirected(res)) {
      throw new fetch.FetchError(res.statusText, 'error');
    }

    return res;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = abortFetch;
