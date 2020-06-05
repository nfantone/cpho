'use strict';
const { applyTo, compose, identical, type } = require('ramda');

/**
 * Returns a function that checks whether a given value is
 * of the `valueType` type.
 * @param {string} valueType The type to check for.
 * @returns {(value:string) => boolean}
 */
const typeIs = valueType => value => applyTo(value, compose(identical(valueType), type));

module.exports = typeIs;
