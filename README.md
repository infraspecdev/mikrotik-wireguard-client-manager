A Node.js package for managing WireGuard VPN clients on MikroTik routers via SSH.

**This project has a [Code of Conduct](CODE_OF_CONDUCT.md).**

## Table of contents

* [Installation](#Installation)
* [Features](#Features)
* [Running Tests](#Running-Tests)
* [Contributing](#Contributing)
* [License](#license)

```js
const { MikroTikWireGuardClientManager }  = require('@nimisha.gj/mikrotik-client-manager')
const { MikroTikSSHClient } = require("@nimisha.gj/mikrotik-client-manager");

const sshClient = new MikroTikSSHClient("192.168.1.1", 22, "admin", "password");

const vpnManager = new MikroTikWireGuardClientManager(sshClient);
const clients = await vpnManager.listClients();
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 22 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install @nimisha.gj/mikrotik-client-manager
```
## Features
* Add WireGuard Client
* Remove WireGuard Client
* List WireGuard Clients


### Running Tests

To run the test suite, first install the dependencies:

```bash
npm install
```

Then run `npm test`:

```bash
npm test
```

## Contributing

The project welcomes all constructive contributions. Contributions take many forms,
from code for bug fixes and enhancements, to additions and fixes to documentation, additional
tests, triaging incoming pull requests and issues, and more!

See the [Contributing Guide](CONTRIBUTING.md) for more technical details on contributing.

## License

[MIT](LICENSE)
