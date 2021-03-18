# PRAwN Stack

🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤

- **P**ostgres.
- **R**eact.
- **Aw**s.
- **N**ode.

## Scripts

- `yarn build` build the frontend so it's ready to deploy
- `yarn test` perform the jest unit tests
- `yarn deploy --profile account-name` build the frontend and deploy the cdk stack
- `yarn cdk bootstrap --profile account-name` prepare the AWS region for cdk deployments
- `yarn cdk destroy --profile account-name` destroy the deployment

## First Deploy

1. Create an [AWS account](https://aws.amazon.com/).
1. Enable MFA on your Root account.
1. Create an IAM user with programmtic access and assign the FullAdministratorAccess permission.
1. Download the credentials.
1. Setup your credentials with `vi ~/.aws/credentials`.
   ```
   [account-name]
   aws_access_key_id=
   aws_secret_access_key=
   ```
1. Run `yarn` to install dependencies.
1. Set the region in `bin/lambda-cdk.ts`.
1. Run `yarn cdk bootstrap --profile account-name`.
1. Run `yarn deploy --profile account-name`.

Subsequent deployments can then be done with:

```
yarn deploy --profile account-name
```

And you can destroy a deployment with:

```
yarn cdk destroy --profile account-name
```

## Accessing the RDS Database

You'll need to do this to setup the database initially.

Access is currently through a whitelisted ip address which isn't ideal but will work well enough for now.

1. Make sure you enter your IP Address in the cdk code.
1. Login to AWS then go to the AWS Secret Manager for the credentials.
1. Enter them into [PgAdmin](https://www.pgadmin.org/).

## Accessing the local database

1. Make sure you're docker containers are up.
   ```
   docker-compose up
   ```
1. Go to [http://localhost:5050/](http://localhost:5050/).
1. Login with:
   - **Email:** pgadmin4@pgadmin.org
   - **Password:** admin
1. Click Add New Server.
1. Fill in the local server details.
   - General
     - **Name:** local
   - Connection
     - **Host:** postgres
     - **Username:** postgres
     - **Password:** changeme
     - **Save password?:** yes

### Setup a new database

1. Expand Servers, local, Databases.
1. Right-Click on Databases and create a new one called app.

### Query the database

1. Right-Click on the app database then select Query Tool.

## Roadmap

1. Setup pageViews in deployed environment.
1. Setup the frontend again.

### Ideas

1. Document the inspirations for this project, particularly from the LAMP stack.
1. Setup a cron to hit an endpoint every 5 minutes. This can also act as a monitoring solution.
1. Setup integration tests.
1. Clarify node_modules folders, possibly with yarn v2.
1. Create an abstraction for translating between Lambda functions and express.
1. Setup a materialized view and a cron to refresh it every 5 minutes.
1. [Tune](https://www.jeremydaly.com/manage-rds-connections-aws-lambda/) the RDS connection settings for Serverless.
1. Set a maximum Lambda concurrency.
1. Use [serverless-postgres](https://github.com/MatteoGioioso/serverless-pg) for connecting to postgres.
1. Explain provisioned concurrency.

### Done.

1. Deploy a cdk stack with RDS and Lambda.
1. Setup Express to call the same handler as Lambda.
1. Setup serverless-express to make routing conistent for local and deployed environments.
1. Setup pageViews with local postgres database.

## Related Projects

- [cadbox1/backend-frontend-aws-cdk](https://github.com/cadbox1/backend-frontend-aws-cdk).
- [cadbox1/internal-magic-links-aws-cdk](https://github.com/cadbox1/internal-magic-links-aws-cdk).
- [cadbox1/node-api-2020](https://github.com/cadbox1/node-api-2020).
- [cdk-patterns-serverless/the-rds-proxy](https://github.com/cdk-patterns/serverless/tree/main/the-rds-proxy).
- [wclr/ts-node-dev](ts-node-dev).
- [vendia/serverless-express](https://github.com/vendia/serverless-express).
- [khezen/compose-postgres](https://github.com/khezen/compose-postgres)
