# cpho

![Contracting Plus](https://mycontractingplus.com/public/images_new/logo-login-cplus.jpg)

> **C**ontracting **P**lus **H**ome **O**ffice command line tool

Reliably upload daily E-Workers allowance to [mycontractingplus.com][contracting-plus] from the comfort of your home.

```sh
# Clone repository
git clone git@github.com:nfantone/cpho.git
cd cpho

# Install dependencies
npm i --production

# Run test command
./bin/cpho.js --version
```

## Requirements

- `node` 12+
- `npm` 6+

Follow [official **Node.js** installation instructions][nodejs-dowload] for your system.

## Quick guide

```sh
cpho.js <command>

Commands:
  cpho.js upload  uploads e-workers allowance for all weekdays in a given month + year

Options:
  --help             Show help                                         [boolean]
  --url              Base Contracting Plus URL
                             [string] [default: "https://mycontractingplus.com"]
  -u, --username     Contracting Plus username                          [string]
  -p, --password     Contracting Plus password                          [string]
  -d, --description  Contracting Plus allowance entry description
                                              [string] [default: "Pragmars LLC"]
  --hs, --hours      Contracting Plus allowance entry hours[number] [default: 8]
  --min, --minutes   Contracting Plus allowance entry minutes           [number]
  -m, --month        Index of month to upload allowance for (beginning with 0
                     for January to 11 for December)       [number] [default: 5]
  -y, --year         Year to upload allowance for       [number] [default: 2020]
  -t, --throttle     Number of milliseconds to wait between allowance uploads
                                                         [number] [default: 500]
  --version          Show version number                               [boolean]
```

### Usage

- Upload **monthly allowance** for **all weekdays in current month**.

```sh
./cpho.js upload -u myuser@company.org -p my-password
```

> :bulb: If not provided using `-u` / `-p`, `cpho` will prompt for username and password.

[contracting-plus]: https://mycontractingplus.com
[nodejs-dowload]: https://nodejs.org/en/download/package-manager/
