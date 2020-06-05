'use strict';
const { trim } = require('ramda');
const formatDate = require('date-fns/format');
const { URL, URLSearchParams } = require('url');
const cookie = require('cookie');
const tryParseIso = require('./try-parse-iso');
const fetch = require('./abort-fetch');

/**
 * Base login endpoint path name.
 * @type {string}
 */
const HOMEOFFICE_PATH = '/public/index.php/homeoffice';

/**
 * @type {string}
 */
const HOMEOFFICE_BODY_DATE_PATTERN = 'dd-MM-yyyy';

/**
 * Builds a ContractingPlus homeoffice endpoint from a base URL.
 * @param {string} baseUrl Base ContractingPlus URL.
 * @returns {string} The homeoffice endpoint full URL.
 */
const createHomeofficeUrl = baseUrl => new URL(HOMEOFFICE_PATH, baseUrl).href;

/**
 * Creates and returns an URL encoded ContractingPlus homeoffice form body payload.
 * e.g.: 'sts=1&appdate=11-05-2020&hour=8&min=0&desc=Pragmars+LLC&txyr=0',
 *
 * @param {Object} body Request body fields.
 * @param {string|number|Date} body.date `appdate` form field value.
 * @param {string} body.description `desc` form field value.
 * @param {string|number} body.hours `hour` form field value.
 * @param {string|number} body.minutes `min` form field value.
 * @returns {URLSearchParams} The `x-www-form-urlencoded` body payload.
 */
const createHomeOfficeBody = ({ date, description, hours, minutes }) => {
  return new URLSearchParams({
    sts: '1',
    appdate: formatDate(tryParseIso(date), HOMEOFFICE_BODY_DATE_PATTERN),
    hour: String(hours),
    min: String(minutes),
    desc: trim(description),
    txyr: '0'
  });
};

/**
 * POSTs a new dated entry in the My Contracting Plus E-Worker Allowance time sheet.
 *
 * @param {string} baseUrl Base ContractingPlus URL.
 * @param {string} phpSessId PHPSESSID cookie value.
 * @param {Object} body Request body fields.
 * @param {string|number|Date} body.date `appdate` form field value.
 * @param {string} body.description `desc` form field value.
 * @param {string|number} body.hours `hour` form field value.
 * @param {string|number} body.minutes `min` form field value.
 * @returns {Promise<{ date: string|number|Date, description: string, hours: string|number, minutes: string|number }>}
 */
async function homeoffice(baseUrl, phpSessId, { date, description, hours = 8, minutes = 0 }) {
  const endpoint = createHomeofficeUrl(baseUrl);

  await fetch(endpoint, {
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
      'upgrade-insecure-requests': '1',
      cookie: cookie.serialize('PHPSESSID', phpSessId),
      timeout: '20s'
    },
    referrer: endpoint,
    referrerPolicy: 'no-referrer-when-downgrade',
    body: createHomeOfficeBody({ date, description, hours, minutes }),
    method: 'POST',
    mode: 'cors'
  });

  return { date, description, hours, minutes };
}

module.exports = homeoffice;
