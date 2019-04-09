# uq-eait-kvd

Client for communicating with UQ EAIT's KVD system

## Installation

```bash
npm i @uq-elipse/uq-eait-kvd
```

## Usage

```javascript
/// Importing

// ES Modules style
import { KVD } from "@uq-elipse/uq-eait-kvd";

// CommonJS style
const KVD = require("@uq-elipse/uq-eait-kvd").KVD;


/// In your code...

// Initialise the KVD client with the default EAIT KVD server IP and port
const kvdClient = new KVD();

// You can perform a REQUEST operation like this:
kvdClient.request("3nwAoSEmnbmXJC5ExlEatxyk63F7bY2M")
    .then((buffer) => {
        // You are responsible for decoding the buffer yourself
        // For example, we expect JSON here, so:
        const data = JSON.parse(buffer.toString("utf8"));
    })
    .catch((e) => {
        // Note that if the request times out, an error is thrown, and it is up
        // to you to send the message again
        console.error(e);
    });

```

## Background

The KVD system is described in more detail in the following links:

* [EAIT Web Authentication and Authorisation](https://xlex.s3.uqcloud.net/eaitauth.pdf) (pdf)
* [Single Sign-On for the UQ Web](https://archive.its.uq.edu.au/filething/get/6791/130208_uq_sso.pdf) (pdf)
