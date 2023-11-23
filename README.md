# PRAwN Stack

🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤

A modern page view counter to see how unpopular my project is. Powered by a PRAwN stack (Postgres, React, AWs and Node) in the free tier, deployed using CDK.

- **P**ostgres.
- **R**eact.
- **Aw**s.
- **N**ode.

We're also using Typescript and NextJS for the frontend.

## Website

[prawn.cadell.dev](https://prawn.cadell.dev)

## Scripts

- `docker-compose up --build` starts postgres, the node api development server and the nextjs development server.
- `npm run start` run the development Node server.
- `npm run dev` run the NextJS development server.
- `npm run test` perform the jest unit tests.
- `npm run build` build the NextJS frontend so it's ready to deploy.
- `npx aws-cdk bootstrap --profile account-name` prepare the AWS region for cdk deployments.
- `npm run deploy -- --profile account-name` build the frontend and deploy the cdk stack.
- `npx aws-cdk destroy --profile account-name` destroy the deployment.

## Running Locally

1. Install dependencies.
   ```
   npm install
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

## First Deploy

Make sure you setup email forwarding for `admin` @yourdomain (e.g `admin@cadell.dev`) you receive the email from aws to validate that you own the domain so it can create a certificate.

1. Create an [AWS account](https://aws.amazon.com/).
1. Click Signin.
1. Click Create a new AWS account.
1. Enter your details.
1. Go to IAM.
1. Enable MFA on your Root account. I recommend 1Password.
1. Create an IAM user without console access, assign the AdministratorAccess permission and setup an access key.
1. Download the credentials.
1. Create a `.aws` folder if you don't already have one.
   ```
   mkdir ~/.aws
   ```
1. Create a credential file with `vi ~/.aws/credentials`.
   ```
   [{account-name}]
   aws_access_key_id={access_key}
   aws_secret_access_key={secret_key}
   ```
1. Run `npm install` to install dependencies.
1. Run `npm run build` to build the project.
1. Set the region in `bin/prawn-cdk.ts`.
1. Update `yourPublicIpAddress` in `bin/prawn-cdk.ts` with your public ip address so you can access the database.
1. Run `npx aws-cdk bootstrap --profile {account-name}`.
1. Run `npx aws-cdk deploy CertificateStack --profile {account-name}`.
   - This will send an email to `admin@yourdomain` to confirm you control the domain for the certificate it's creating. You can also go into CertificateManager in `us-east-1` region and resend it if you need to.
   - The command won't finish until you approve the email.
1. Copy the certificateArn from the output and add it to the `bin/prawn-cdk.ts`.
1. Run `npm run deploy -- --profile account-name`.
   - This takes about about 15 mins.

### Future Deploys

This takes about 1-3 mins.

```
npm run deploy --profile account-name
```

### Access the Database

You'll need to do this to setup the database initially.

Access is currently through a whitelisted ip address which isn't ideal but will work well enough for now.

1. Make sure the `yourPublicIpAddress` in `lib/prawn-stack.ts` is up to date and deployed.
1. Login to the AWS console.
1. Go to Secrets Manager.
1. Select the region, probably `ap-southeast-2`.
1. Click `PrawnStack-rds-credentials`.
1. Go to the `Secret value` section then click `Retrieve secret value`.

You can put the values into PgAdmin to query the database.

### Setup the Database

1. Make sure Docker is running.
1. Run flyway migrate with connection details and credentials from secrets manager.

```
HOST=xxx USER=xxx PASSWORD=xxx; docker-compose run flyway -url=jdbc:postgresql://$HOST/postgres -user=$USER -password=$PASSWORD migrate
```

### Setup a Custom Domain

1. Sign into your domain registrar. I use [Google Domains](https://domains.google.com).
1. Setup a new CNAME DNS record using the cloudfront domain in the deploy output.
1. Make sure the CNAME aligns with the `customDomain` in `bin/prawn-cdk.ts`.

### Destroy the Stack

```
npx aws-cdk destroy --profile account-name
```

### Why is AWS Charging You?

1. Login to the root account.
1. On the account dropdown on the top right, click My Billing Dashboard.
1. Click Cost Explorer.
1. Click Daily Spend View.
1. Change the timeframe to the last 7 days.
1. Group by Usage Type.

The table below will give you a decent breakdown on your charges.
