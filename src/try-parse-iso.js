'use strict';
const { T, compose, cond, identity, ifElse, test, trim } = require('ramda');
const parseIso = require('date-fns/parseISO');
const typeIs = require('./type-is');

/**
 * Returns a function that checks whether or not a given value if
 * an instance of the provided constructor.
 * @param {*} classConstructor
 * @returns {(value: any) => boolean}
 */
const instanceOf = classConstructor => value => value instanceof classConstructor;

/**
 * Tries to parse the given input as a `Date`.
 * If the input is a numerical string ([0-9] digits only), it'll be coerced into a number
 * and treated as milliseconds since the epoch.
 * If the input is a non-numerical `String`, `date-fns~parseISO` will be used to parse it an ISO 8601 date.
 * If the input is a `Number`, it'll be passed as-is to the `Date` constructor.
 * If the input is already a `Date`, it'll be returned without modifications.
 * Otherwise, `Invalid date` is returned.
 *
 * @function
 * @param {string|number|Date} dt The value to parse.
 * @returns {Date} The parsed date.
 */
const tryParseIso = cond([
  [typeIs('Number'), ms => new Date(ms)],
  [
    typeIs('String'),
    ifElse(
      test(/^\s*\d+\s*$/),
      compose(ms => new Date(ms), Number, trim),
      dt => parseIso(dt)
    )
  ],
  [instanceOf(Date), identity],
  [T, () => new Date(NaN)]
]);

module.exports = tryParseIso;
