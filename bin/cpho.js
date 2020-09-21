#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';
const { isEmpty, isNil, join, map } = require('ramda');
const { EOL } = require('os');
const ms = require('ms');
const util = require('util');
const yargs = require('yargs');
const chalk = require('chalk');
const log = require('log-update');
const symbols = require('log-symbols');
const prompt = require('prompt');
const formatDate = require('date-fns/format');
const pck = require('../package.json');
const login = require('../src/cplus-login');
const homeoffice = require('../src/cplus-homeoffice');
const eachWeekdayOfMonth = require('../src/each-business-days-month');
const removeSameDays = require('../src/remove-same-days');

/**
 * Prompts the user to enter username and a hidden password unless it
 * they were already supplied by command line arguments (`-p` and/or `-u`).
 *
 * @param {Object} argv Script arguments.
 * @returns {Promise.<{ username: string, password: string}>} The username and password input.
 */
async function promptCredentialsIfNeeded(argv) {
  prompt.override = argv;

  prompt.start({ message: chalk`{cyan.bold cpho}` });
  const getPrompt = util.promisify(prompt.get.bind(prompt));

  return getPrompt([
    {
      name: 'username',
      required: true,
      type: 'string',
      pattern: /^.+@.+$/,
      message: 'username is required and must be an email',
      description: chalk`enter contracting plus {bold username}`
    },
    {
      name: 'password',
      required: true,
      hidden: true,
      type: 'string',
      // eslint-disable-next-line ramda/prefer-ramda-boolean
      conform: () => true,
      message: 'password is required',
      description: chalk`enter ${argv.username || 'contracting plus'} {bold password}`
    }
  ]);
}

async function show(message, fn) {
  log(`${message}...`);
  try {
    await fn();
    log(`${message}... ${symbols.success} done`);
  } catch (err) {
    log(`${message}... ${symbols.error} failed`);
    throw err;
  } finally {
    log.done();
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      return resolve();
    }, ms);
  });
}

function eachExcludedDate(year, month, days) {
  return map(day => new Date(year, month, day), days);
}

const asLongDate = date => formatDate(date, 'E, MMM do, yyyy');

async function uploadBusinessDaysAllowance(argv, phpSessId) {
  const shouldThrottle = isNil(argv.throttle) && argv.throttle > 0;

  // First day of the month/year to process allowance for as required
  // by `--month` (or `-m`) and `--year` (or `-y`)
  const currentDate = new Date(argv.year, argv.month);

  // A list of all days for which an allowance should not be uploaded
  // as supplied by the `--exclude` or `-x` option (e.g.: `-x 12 20 21` will ignore days
  // 12, 20 and 21 of the month)
  const excludedDates = eachExcludedDate(argv.year, argv.month, argv.exclude);

  // A list of all working days in the month (i.e.: every day minus weekends)
  const workingDatesOfMonth = eachWeekdayOfMonth(currentDate);

  // The final list of dates for which a home office allowance should be uploaded
  // (i.e.: all working days minus excluded days)
  const allowanceDates = removeSameDays(workingDatesOfMonth, excludedDates);

  console.info(
    chalk`{green.bold info} home office allowance will be uploaded for a total of {bold ${allowanceDates.length} days}`
  );

  if (!isEmpty(excludedDates)) {
    console.warn(
      chalk`{yellow.bold warn} excluding dates {bold ${join(
        ' / ',
        map(asLongDate, excludedDates)
      )}}`
    );
  }

  for (const date of allowanceDates) {
    await show(
      chalk`{green.bold info} uploading allowance for {bold ${asLongDate(date)}}`,
      async () => {
        await homeoffice(argv.url, phpSessId, {
          date,
          description: argv.description,
          hours: argv.hours,
          minutes: argv.minutes
        });

        if (shouldThrottle) {
          // Throttle sequential requests to avoid potential DoS
          await sleep(argv.throttle);
        }
      }
    );
  }
}

async function upload(yargs) {
  const argv = yargs.argv;

  try {
    // Request username and password if they weren't supplied from `--password`/`-p` and `--username`/`-u`
    const { password, username } = await promptCredentialsIfNeeded(argv);
    const startTime = Date.now();

    const phpSessId = await login(argv.url, username, password);

    console.info(chalk`{cyan.bold cpho} {gray.bold v${pck.version} - ${pck.license}}`);

    console.info(
      chalk`{green.bold info} logged in to {underline ${argv.url}} as ${username} (PHPSESSID ${phpSessId})`
    );

    await uploadBusinessDaysAllowance(argv, phpSessId);
    console.info(`all done ${ms(Date.now() - startTime)}`);
  } catch (err) {
    if (/cancell?ed/i.test(err.message)) {
      console.warn(chalk`${EOL}{yellow.bold warn} cancelled by user action`);
    } else {
      console.error(chalk`{red.bold err} an unexpected error occurred: {bold ${err.stack}}`);
    }
    process.exit(1);
  }
}

// eslint-disable-next-line no-unused-expressions
yargs
  .option('url', {
    string: true,
    default: 'https://mycontractingplus.com',
    describe: 'Base Contracting Plus URL'
  })
  .option('u', {
    string: true,
    alias: 'username',
    describe: 'Contracting Plus username'
  })
  .option('p', {
    string: true,
    alias: 'password',
    describe: 'Contracting Plus password'
  })
  .option('d', {
    string: true,
    alias: 'description',
    default: 'Pragmars LLC',
    describe: 'Contracting Plus allowance entry description'
  })
  .option('hs', {
    number: true,
    alias: 'hours',
    default: 8,
    describe: 'Contracting Plus allowance entry hours'
  })
  .option('min', {
    number: true,
    alias: 'minutes',
    minutes: 0,
    describe: 'Contracting Plus allowance entry minutes'
  })
  .option('m', {
    number: true,
    alias: 'month',
    default: new Date().getMonth(),
    describe:
      'Index of month to upload allowance for (beginning with 0 for January to 11 for December)'
  })
  .option('y', {
    number: true,
    alias: 'year',
    default: new Date().getFullYear(),
    describe: 'Year to upload allowance for'
  })
  .option('t', {
    number: true,
    alias: 'throttle',
    default: 500,
    describe: 'Number of milliseconds to wait between allowance uploads'
  })
  .option('x', {
    array: true,
    alias: 'exclude',
    default: [],
    describe: 'If specified, an allowance will not be uploaded for these working days'
  })
  .command('upload', 'uploads e-workers allowance for all weekdays in a given month + year', upload)
  .demandCommand()
  .version(pck.version).argv;
