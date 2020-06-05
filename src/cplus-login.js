'use strict';
const { compose, prop } = require('ramda');
const { URL, URLSearchParams } = require('url');
const cookie = require('cookie');
const fetch = require('./abort-fetch');

/**
 * Base login endpoint path name.
 * @type {string}
 */
const LOGIN_PATH = '/public/index.php/auth/login';

/**
 * Builds a ContractingPlus login endpoint from a base URL.
 * @param {string} baseUrl Base ContractingPlus URL.
 * @returns {string} The login endpoint full URL.
 */
const createLoginUrl = baseUrl => new URL(LOGIN_PATH, baseUrl).href;

/**
 * Creates and returns an URL encoded ContractingPlus login form body payload.
 * @param {string} username `username` form field value.
 * @param {string} password `userpassword` form field value.
 * @returns {URLSearchParams} The `x-www-form-urlencoded` body payload.
 */
const createLoginBody = (username, password) => {
  return new URLSearchParams({
    username,
    userpassword: password,
    submit: '',
    status: ''
  });
};

/**
 * Extracts the value of a `PHPSESSID` cookie from a `Set-Cookie` header.
 *
 * @function
 * @param {Response} res The response object.
 * @returns {string} The value of a `PHPSESSID` cookie.
 */
// @ts-ignore
const extractPhpSessId = compose(prop('PHPSESSID'), cookie.parse, res =>
  res.headers.get('set-cookie')
);

/**
 * Tries to authenticate against ContractingPlus login endpoint and, if successful,
 * returns the generated PHP session cookie value (PHPSESSID).
 *
 * @param {string} baseUrl ContractingPlus base URL.
 * @param {string} username `username` form field value.
 * @param {string} password `userpassword` form field value.
 * @returns {Promise.<string>} Resolves to the `PHPSESSID` cookie value
 */
async function login(baseUrl, username, password) {
  const endpoint = createLoginUrl(baseUrl);

  const res = await fetch(endpoint, {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'en-IE,en;q=0.9,es-AR;q=0.8,es;q=0.7,en-US;q=0.6',
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1'
    },
    referrer: endpoint,
    referrerPolicy: 'no-referrer-when-downgrade',
    body: createLoginBody(username, password),
    method: 'POST',
    mode: 'cors',
    redirect: 'manual',
    timeout: '5s'
  });

  return extractPhpSessId(res);
}

module.exports = login;
