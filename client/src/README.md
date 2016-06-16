# The `src` Directory

## Overview

The `src/` directory contains all code used in the application along with all
tests of such code.

```
src/
  |- app/
  |  |- about/
  |  |- home/
  |  |- app.js
  |  |- app.spec.js
  |- assets/
  |- common/
  |  |- plusOne/
  |- less/
  |  |- main.less
  |  |- variables.less
  |- index.html
```

- `src/app/` - application-specific code, i.e. code not likely to be reused in
  another application.
- `src/assets/` - static files like fonts and images.
- `src/common/` - third-party libraries or components likely to be reused in
  another application.
- `src/less/` - LESS CSS files.
- `src/index.html` - this is the HTML document of the single-page application.
  See below.

See each directory for a detailed explanation.

## `index.html`

The `index.html` file is the HTML document of the single-page application (SPA).
