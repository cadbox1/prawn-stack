# PRAwN Stack

🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤

- **P**ostgres.
- **R**eact.
- **Aw**s.
- **N**ode.

## Scripts

 * `yarn build`                                     build the frontend so it's ready to deploy
 * `yarn test`                                      perform the jest unit tests
 * `yarn deploy --profile account-name`             build the frontend and deploy the cdk stack
 * `yarn cdk bootstrap --profile account-name`      prepare the AWS region for cdk deployments
 * `yarn cdk destroy --profile account-name`        destroy the deployment

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
yarn destroy --profile account-name
```
## Accessing the Database

You'll need to do this to setup the database initially.

Access is currently through a whitelisted ip address which isn't ideal but will work well enough for now.

1. Make sure you enter your IP Address in the cdk code.
1. Login to AWS then go to the AWS Secret Manager for the credentials.
1. Enter them into [PgAdmin](https://www.pgadmin.org/).

## Adding a Route

We currently use express for local development which calls the functions that will be deployed to Lambda with a bit of translation in between.

Unfortunately that means new routes need to be defined in two places; in CDK for API Gateway and in Express for local development.

1. Add the route to `server.ts`.
2. Add the route to `lambda-cdk.ts`.

We can probably create an abstraction for this later on.

## Roadmap

1. Setup a local postgres database using docker and connect to it.
1. Connect to RDS when deployed to Lambda.
1. Create a page view counter.
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

## Related Projects

- [cadbox1/backend-frontend-aws-cdk](https://github.com/cadbox1/backend-frontend-aws-cdk).
- [cadbox1/internal-magic-links-aws-cdk](https://github.com/cadbox1/internal-magic-links-aws-cdk).
- [cadbox1/node-api-2020](https://github.com/cadbox1/node-api-2020).
- [cdk-patterns-serverless/the-rds-proxy](https://github.com/cdk-patterns/serverless/tree/main/the-rds-proxy).
- [wclr/ts-node-dev](ts-node-dev).