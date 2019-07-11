Launcher UI Tooling
=========================

[![CircleCI](https://circleci.com/gh/fabric8-launcher/launcher-frontend.svg?style=svg)](https://circleci.com/gh/fabric8-launcher/launcher-frontend)
[![codecov](https://codecov.io/gh/fabric8-launcher/launcher-frontend/branch/master/graph/badge.svg)](https://codecov.io/gh/fabric8-launcher/launcher-frontend)
[![License](https://img.shields.io/:license-Apache2-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&identifier=72209295)](https://dependabot.com)

Launcher UI Tooling based on React.js.

If this is the first time you are starting the UI, you need to run

```bash
$ yarn install
```

## Development

### Start Storybook dev server (launcher-component)
```bash
$ yarn comp:storybook
```

### Build the libraries
All at once:
```bash
$ yarn build
```

Or:
```bash
$ yarn client:build
$ yarn comp:build
```

## Test

```bash
$ yarn test
```

## Build for production

```bash
$ yarn build
```

### Storybook
https://fabric8-launcher-component-storybook.surge.sh

## Patternfly Doc
http://patternfly-react.surge.sh/patternfly-4/
