# Stage Performing Arts

React application built with Create React App (`react-scripts`).

## Development

```sh
npm ci
npm start
```

The development server runs at http://localhost:3000. `npm run dev` is also available.

## Production

```sh
npm run build
```

The production files are generated in `build/`.

## Vercel

`vercel.json` selects Create React App, runs `npm run build`, publishes `build/`,
and serves the app for client-side routes such as `/login` and `/dashboard`.
Remove any old Vite overrides in the Vercel project settings. For the first
deployment after migration, redeploy without the existing build cache.

Commit `package-lock.json`. Keep `node_modules/` and generated build output out
of Git so Vercel installs dependencies for its own environment.
