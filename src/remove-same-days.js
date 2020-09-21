'use strict';
const { differenceWith } = require('ramda');
const isSameDay = require('date-fns/isSameDay');

/**
 * Returns all dates in the first list that are not the same day
 * as any of the dates given in the second list.
 *
 * @function
 * @see https://ramdajs.com/docs/#differenceWith
 * @see https://date-fns.org/v2.16.1/docs/isSameDay
 * @param {Date[]} ds1 The first list of `Date`.
 * @param {Date[]} ds2 The second list of `Date`.
 * @returns {Date[]} A new list containing all `Date` in `ds1` that
 *  are are not in the same day as any of the `Date` in `ds2`.
 */
const removeSameDays = differenceWith(isSameDay);

module.exports = removeSameDays;
