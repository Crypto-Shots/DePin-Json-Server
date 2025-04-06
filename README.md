# DePIN JSON Server

DePIN JSON Server (DJS) allows you to control your Hive Witness running on a decentralized network (e.g. Flux) by sending it commands as on-chain custom JSON transactions on the Hive blockchain.

## Overview

- Containerization:
DJS and the Hive Witness run together in a single Docker container, ensuring a self-contained environment where configuration values (e.g. keys) are setup before the container is deployed.

- Secure Command Execution:
No sensitive data shall ever be broadcasted on-chain. Send only non-sensitive command identifiers in the payload!
For instance, you can trigger actions like starting synchronization or updating the witness using commands defined in the hive-witness-automation documentation:
https://github.com/Crypto-Shots/hive-witness-automation

- On-Chain Data Consumption:
The server consumes blockchain data via HAF, which is available on all Hive nodes. Under the hood, we query operations using the following API: https://api.hive.blog/hafah-api/blocks/94752093/operations?operation-types=18&path-filter=value.id=djs-server

- Modular & Extensible Integration:
The integration interface is designed to be agnostic. Currently, it dispatches payloads to a module that executes commands on the same machine where DJS runs, but this project can easily be cloned/extended to process different on-chain data types and trigger diverse actions (for example, on-chain game data).

## Usage

- Install Dependencies

```
npm install
```

- Configure DJS

Edit src/config.js to set up:
- Admin account list
- Discord webhook for notifications
- Healthcheck URLs for:
    - DJS itself
    - Chain data consumption
    - Witness Node status (1. up and 2. functioning properly)
- Logs forwarding endpoint

- Start the Server

```
npm start
```
TODO: replace with pm2 start ecostystem.config.js

- Broadcast Commands

Use JSON Doctor (Open Source) to broadcast on-chain custom JSON commands:
https://jsondoctor.github.io

Security Notice: to be on the safe side, do NOT enter your private key on that website.
By default, it will prompt you to sign the transaction using Hive Keychain. Make sure Hive Keychain is installed in your browser.

Example transaction:
https://hub.peakd.com/tx/8bd7673b6700eb6cd2bbe62347f9fb3c223861b4


## Contributing

Contributions, bug fixes, and feature improvements are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.

-----

## WORK IN PROGRESS

- Allow commands execution only frmo whitelisted accounts (admins)
- Use pm2 (or npm forever is enough if no reboots ever)
- Rotate Hive nodes using https://beacon.peakd.com (configurable endpoint)
- Make Discord webhook configurable
- Various Healthckecks support
- Logs forwarding support
- Production readiness checklist
- Add useful npm commands?


# FUTURE IMPROVEMENTS

- crypto-shots.com/witness UI:
input field for admin username
input field for command
commands history
server output -> from logs forwarder

- Support command as reply to a root blog post? (risk of nesting replies)
