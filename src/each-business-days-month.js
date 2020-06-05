'use strict';
const { reject } = require('ramda');
const isWeekend = require('date-fns/isWeekend');
const startOfMonth = require('date-fns/startOfMonth');
const endOfMonth = require('date-fns/endOfMonth');
const eachDayOfInterval = require('date-fns/eachDayOfInterval');

/**
 * @function
 */
const businessDaysOnly = reject(isWeekend);

/**
 * Returns a list of all days in the month of the given `date`.
 * @param {Date} date Any date.
 * @return {Date[]} An array containing all dates within a month.
 */
const eachDayOfMonth = date =>
  eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) });

/**
 * Returns a list of all weekdays (i.e.: excluding Sundays and Saturdays) in the
 *  month of the given `date`.
 *
 * @param {Date} date Any date.
 * @return {Date[]} An array of all weekdays (i.e.: rejecting Sundays and Saturdays) in the
 *  month of the given `date`.
 */
function eachBusinessDayOfMonth(date) {
  return businessDaysOnly(eachDayOfMonth(date));
}

module.exports = eachBusinessDayOfMonth;
