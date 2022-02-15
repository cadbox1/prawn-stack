# PRAwN Stack

🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤

A modern page view counter to see unpopular my project is. Powered by a PRAwN stack (Postgres, React, AWs and Node) in the free tier, deployed using CDK.

- **P**ostgres.
- **R**eact.
- **Aw**s.
- **N**ode.

## Website

[prawn.cadell.dev](https://prawn.cadell.dev)

## Scripts

- `docker-compose up --build` starts postgres, the node api development server and the nextjs development server.
- `yarn start` run the development Node server.
- `yarn dev` run the NextJS development server.
- `yarn test` perform the jest unit tests.
- `yarn build` build the NextJS frontend so it's ready to deploy.
- `yarn cdk bootstrap --profile account-name` prepare the AWS region for cdk deployments.
- `yarn deploy --profile account-name` build the app and deploy the cdk stack.
- `yarn cdk destroy --profile account-name` destroy the deployment.

## Running Locally

1. Install dependencies.
   ```
   yarn
   ```
1. Run docker-compose.
   ```
   docker-compose up --build
   ```
   This will bring up:
   - Postgres database and run migrations on it using Flyway.
   - PgAdmin to access the Postgres database. Available at [http://localhost:5050/](http://localhost:5050/).
   - Node API development server. Available at [http://localhost:3001/api/](http://localhost:3001/api/).
   - NextJS development server for the frontend. Available at [http://localhost:3000](http://localhost:3000.
1. Go to [http://localhost:3000/](http://localhost:3000/).

Going forward, you can make this faster by skipping the build step. You only need it if your dependencies change.

```
docker-compose up
```

### Accessing the Local Database

1. Go to [http://localhost:5050/](http://localhost:5050/).
1. Set a master password.
1. Click Add New Server.
1. Fill in the local server details.
   - General
     - **Name:** local
   - Connection
     - **Host:** postgres
     - **Username:** postgres
     - **Password:** changeme
     - **Save password?:** yes
