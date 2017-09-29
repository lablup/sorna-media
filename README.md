# Backend.AI Media Library

A front-end side Javascript library to ease rendering of JSON-encoded media outputs
generated by our kernel runners as well as web terminals.

[Backend.AI Kernel Runner](https://github.com/lablup/backend.ai-kernel-runner)
used by user-written codes inside [Backend.AI
kernels](https://github.com/lablup/backend.ai-kernels) generates various
multimedia outputs, not only stdout/stderr console outputs.
**Backend.AI Media** library eases rendering of them in the web-browser.

Note that, this library is *not a direct client of Backend.AI*.
For that purpose, please check out [another
repository](https://github.com/lablup/backend.ai-client-js).
This library only takes the computation results and renders them into HTML.

It means that it's your job to connect with the Backend.AI on the cloud or
on-premise servers, and you should have your own scripts to retrieve Backend.AI
computation results in your own front-end.

Your front-end should call `Sorna.Media.handle_all(<media-output-array>,
<result-identifier>, <result-ctonainer>)` where `result-identifier`
should be a unique string for each code block and `result-container` should
be a reference to HTML element such as `<div>` blocks used for rendering the
execution results.


## For Developers

### Setting up

We use [**yarn**](https://yarnpkg.com) and [**webpack**](https://webpack.js.org)
for bundling Javascript files and CSS resources so that we keep the main script
small (less than 100KB) while the main script loads all the necessary stuffs
dynamically.

Check out [the installation instruction of yarn package
manager](https://yarnpkg.com/en/docs/install) first.

```sh
# Use package.json to install all dependencies locally:
$ yarn install
# To run a local development server serving auto-rebuilt in-memory bundles:
$ yarn run devserver
# To run the production build:
$ yarn run build
```

### Integration with a front-end

You need to specify `Sorna.assetRoot` in Javascript to let our scripts know
which location to fetch additoinal scripts from.
The `main.min.js` is designed to be small for faster page loads and most
functionality (e.g., drawing support) are loaded on demand.

For production:
```html
<script>
window.Sorna = window.Sorna || {};
window.Sorna.assetRoot = '//<sorna-serving-host>/<hash>';
</script>
<script src="//<sorna-serving-host>/<hash>/js/main.min.js"></script>
```
`<sorna-serving-host>` would be placed by a template variable from application
server settings.

For development:
```html
<script>
window.Sorna = window.Sorna || {};
window.Sorna.assetRoot = 'http://localhost:8002/latest';
</script>
<script src="http://localhost:8002/latest/js/main.min.js"></script>
```

When receiving Sorna execution results:
```javascript
var response = ...;
var result_id = ...;
var result_container = document.getElementById(...);
// media is a list of (type, data) tuples produced by server-side Pyhon packages
Sorna.Media.handle_all(response.media, result_id, result_container);
```


### Developing with local neumann frontend instances

We use webpack-dev-server to automatically recompile the sources on the memory
whenever they change (aka "watch-mode").
However, you need to manually refresh the page to get the latest bundles as we
do not use "hot module refresh" (HMR) due to conflicts with script tags without
src attributes (e.g., ZenDesk-injected scripts).

```sh
$ yarn run devserver
# Bundled scripts are served at http://127.0.0.1:8002/latest/js/...
```

Note that the port number in the configuration is fixed for Lablup's internal
development configuration.  You may change it if you have different frontends.

### Deploying for production service

We use the standard aws-cli tool.  You should configure your AWS access key and
the secret key to make it working.

Before uploading, we first need to compile the resources for production.

```sh
$ yarn run update
# This includes "yarn run build" process.
```

This script will write the compiled resources into `assets/<hash>` directory,
where the hash value depends on the content of all resource files.
It also deletes all other `assets/<old-hash>` directories automatically to avoid
duplicate transfers below.
To debug the webpack build process, simply run `webpack` and see what it says.

Then, run the following to upload all assets:
```sh
$ aws s3 cp assets s3://sorna-assets/ --recursive
```

Afterwards, you must update the production configuration (e.g.,
`SORNA_ASSET_ROOT` in Django/Flask settings) for your front-end using the
latest hash value.
(e.g., https://s3.ap-northeast-2.amazonaws.com/sorna-assets/1234567890abcdef1234 )

