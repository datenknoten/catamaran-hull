# Hull

> the frame or body of a ship or boat exclusive of masts, yards, sails, and
> rigging — [Ditcionary](https://www.merriam-webster.com/dictionary/hull)


Hull is a library for building [Scuttlebutt]()-Clients. It converts it's
datastructures into typed structure, which makes building a good client more
easy.

## How to use?

First you need to install it:

``` shell
$ npm install --save @catamaran/hull
```

Then you need to create client and use it:

``` typescript
const client = await Client.create();

const obs = client.message.fetchPublicFeed();

obs.subscribe(data => {
    console.dir({
        data,
    });
});
```

**Imporant**: hull relies on a running scuttlebot to connect to the
scuttleverse. Currently the most easy way to get a standalone scuttlebot is via
[scuttle-shell](https://github.com/ssbc/scuttle-shell).
