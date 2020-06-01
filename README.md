# iTwin Stack Viewport App

Copyright © Bentley Systems, Incorporated. All rights reserved.

An iModel.js sample application that demonstrates the minimum setup for opening an iModel from iModelBank and viewing its graphics in a viewport with basic viewing tools.

* _Viewport_: Renders geometric data onto an HTMLCanvasElement.
* _Toolbar_: Includes basic viewport tools in top-right corner of viewport (select, fit, rotate, pan, zoom).

This app serves as a guide on how you can configure application to work within iTwinStack. Please refer to [basic viewport app](https://github.com/imodeljs/imodeljs-samples/tree/master/interactive-app/basic-viewport-app) for the differences between this and iModelHub based solution.
See http://imodeljs.org for comprehensive documentation on the iModel.js API and the various constructs used in this sample.

## Purpose

The purpose of this application is to demonstrate the following:

* [Dependencies](./package.json) required for iModel.js-based frontend applications.
* [Scripts](./package.json) recommended to build and run iModel.js-based applications.
* How to set up a simple [backend for web](./src/backend/BackendServer.ts) and
* How to set up a simple [frontend for web](./src/frontend/api/ITwinStackApp.ts).
* How to [consume](./src/frontend/components/App.tsx) iModel.js React components.
* How to [setup a viewport](./src/frontend/components/App.tsx#L106).
* How to include
  [tools](./src/frontend/components/Toolbar.tsx) in a
  [viewport](./src/frontend/components/App.tsx#L205).

## Prerequisites

* [Git](https://git-scm.com/)
* [Node](https://nodejs.org/en/): an installation of the latest security patch of Node 10 or 12. The Node installation also includes the **npm** package manager.
* [TypeScript](https://www.typescriptlang.org/): this is listed as a devDependency, so if you're building it from source, you will get it with `npm install`.
* [Visual Studio Code](https://code.visualstudio.com/): an optional dependency, but the repository structure is optimized for its use

> See [supported platforms](https://www.imodeljs.org/learning/supportedplatforms/) for further information.

## Development Setup

1. Create an iModel on iModelBank using REST API

2. Publish some data into the iModel using iModel Bridge

3. Configure the `.env.local` file with the iModel's and its context's ids.

4. Install the dependencies

    ```sh
    npm install
    ```

5. Build the application

    ```sh
    npm run build
    ```

6. There are two servers, a web server that delivers the static web resources (the frontend Javascript, localizable strings, fonts, cursors, etc.), and the backend RPC server that opens the iModel on behalf of the application. Start them both running locally:

    ```sh
    npm run start
    ```

7. Open a web browser (e.g., Chrome or Edge), and browse to localhost:3000.

## Contributing

[Contributing to iModel.js](https://github.com/imodeljs/imodeljs/blob/master/CONTRIBUTING.md)
