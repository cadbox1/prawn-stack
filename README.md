# PRAwN Stack

🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤 🦐 🍤

- **P**ostgres.
- **R**eact.
- **Aw**s.
- **N**ode.

We're also using Typescript and NextJS for the frontend.

![PRAwN Stack](./docs/assets/PRAwN%20Stack.png)

## Features

- Relational database so you can make cool stateful apps like a page view counter.
- Fun local development experience with docker-compose.
- Easy to deploy with AWS CDK.
- Almost completely in the AWS Free Tier. Turns out this is actually quite difficult with RDS and Lambda.

## Scripts

- `docker-compose up` starts postgres, the node api development server and the nextjs development server.
- `yarn start` run the development Node server.
- `yarn dev` run the NextJS development server.
- `yarn test` perform the jest unit tests.
- `yarn build` build the NextJS frontend so it's ready to deploy.
- `yarn cdk bootstrap --profile account-name` prepare the AWS region for cdk deployments.
- `yarn deploy --profile account-name` build the frontend and deploy the cdk stack.
- `yarn cdk destroy --profile account-name` destroy the deployment.

## Running Locally

1. Install dependencies.
   ```
   yarn
   ```
1. Run docker-compose.
   ```
   docker-compose up
   ```
   This will bring up:
   - Postgres database and run migrations on it using Flyway.
   - PgAdmin to access the Postgres database. Available at [http://localhost:5050/](http://localhost:5050/).
   - Node API development server. Available at [http://localhost:3001/api/](http://localhost:3001/api/).
   - NextJS development server for the frontend. Available at [http://localhost:3000](http://localhost:3000.

### Accessing the Local Database

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

## Almost Completely in the Free Tier!

![bill](./docs/assets/bill.png)

The only thing you have to pay for is Secrets Manager which is \$0.4/month.

When the free tier ends after 12 months you could move this onto a t3.micro for rds at $0.028/h, $21/month) and a t3.nano for ec2 (used as a cheap NAT) at $0.0066/h, $4.95/month.

There's also a budget configured with cdk to alert you when you spend more than \$1 usd to remind you when the free tier ends.

### Serverless and Lambda

I'm a _serverless skeptic_. A few timely things swayed me to try Lambda for this project.

1. [serverless-express](https://github.com/vendia/serverless-express) allows you to run an express app in Lambda, which means you can run the express part locally for a nice development experience.
1. I wanted to setup some cron jobs which are well suited to Lamdbda.
1. AWS CDK makes working with AWS ~~easy~~ less hard.

It turns out the simplest way to setup Lambda with RDS is quite expensive. You have to [use a NAT Gateway](<(https://aws.amazon.com/premiumsupport/knowledge-center/internet-access-lambda-function/)>) which costs $0.059/h and $44.25/month. [That's expensive!](https://forums.aws.amazon.com/thread.jspa?threadID=234959).

There's a few ways to get around this:

- Make your database public. This isn't secure.
- Make your Lambda private so it can't access the internet. The internet is useful though and you'll have to [pay](https://aws.amazon.com/privatelink/pricing/) to access AWS services like Secret Manager.
- Setup a NAT Instance in the free tier.

This all feels very typical of AWS.

I went with the NAT Instance because thankfully [CDK makes it easy](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-ec2-readme.html#using-nat-instances). Unfortunately, it does some to add some extra latency, ~300ms (150%) more, but I'll happily cop latency instead of money for this project.

## Load Testing

![wrk results](./docs/assets/wrk.png)

Even under light load, this stack is pretty slow, coming in at 515ms on average. I think this might be coming from the requests to SecretManager, through the NAT Instance but I'm not too sure. I setup AWS X-Ray and cached the secrets from SecretManager but it hasn't had much impact on latency. Fun fact, the HTTP API Gateway doesn't support X-Ray.

With more load, our application can support a throughput of 193 requests per second or about 16.7 million per day at 1000ms latency. I'm going to ignore those socket errors.

I worked this out by running tests with increasingly higher concurrent requests until the latency reached 1000ms where we consider the application to have failed. If we think higher latencies are acceptable then we might be able to support even more throughput.

You can install [wrk](https://github.com/wg/wrk) with:

```
brew install wrk
```

Then run it with:

```
wrk -t1 -c1 -d60s https://prawn.cadell.dev/api/home
```

Other tools like [hey](https://github.com/rakyll/hey) and [vegeta](https://github.com/tsenart/vegeta) offer more stats like percentiles. [How percentile approximation works (and why it's more useful than averages)](https://blog.timescale.com/blog/how-percentile-approximation-works-and-why-its-more-useful-than-averages/) talks about it more and as well as the [hackernews comments](https://hn.premii.com/#/comments/28526966).

## First Deploy

Make sure you setup email forwarding for `admin` @yourdomain (e.g `admin@cadell.dev`) you receive the email from aws to validate that you own the domain so it can create a certificate.

1. Create an [AWS account](https://aws.amazon.com/).
1. Click Signin.
1. Click Create a new AWS account.
1. Enter your details.
1. Go to IAM.
1. Enable MFA on your Root account. I recommend 1Password.
1. Create an IAM user with programmtic access and assign the AdministratorAccess permission.
1. Download the credentials.
1. Create a `.aws` folder if you don't already have one.
   ```
   mkdir ~/.aws
   ```
1. Create a credential file with `vi ~/.aws/credentials`.
   ```
   [account-name]
   aws_access_key_id=
   aws_secret_access_key=
   ```
1. Run `yarn` to install dependencies.
1. Set the region in `bin/prawn-cdk.ts`.
1. Update `yourPublicIpAddress` in `lib/prawn-stack.ts` with your public ip address so you can access the database.
1. Run `yarn cdk bootstrap --profile account-name`.
1. Run `yarn cdk deploy CertificateStack --profile account-name`.
   - This will send an email to `admin@yourdomain` to confirm you control the domain for the certificate it's creating. You can also go into CertificateManager in the `us-east-1` region and resend it if you need to.
   - The command won't finish until you approve the email.
1. Copy the certificateArn from the output and add it to the `bin/prawn-cdk.ts`.
1. Run `yarn deploy --profile account-name`.
   - This takes about about 15 mins.

### Future Deploys

This takes about 1-3 mins.

```
yarn deploy --profile account-name
```

### Access the Database

You'll need to do this to setup the database initially.

Access is currently through a whitelisted ip address which isn't ideal but will work well enough for now.

1. Make sure the `yourPublicIpAddress` in `lib/prawn-stack.ts` is up to date and deployed.
1. Login to the AWS console.
1. Select the region, probably `ap-southeast-2`.
1. Go to Secret Manager.
1. Click `PrawnStack-rds-credentials`.
1. Go to the `Secret value` section then click `Retrieve secret value`.

You can put the values into PgAdmin to query the database.

### Setup the Database

Run the following command to migrate the database with Flyway.

```
HOST=xxx USER=xxx PASSWORD=xxx; docker-compose run flyway -url=jdbc:postgresql://$HOST/postgres -user=$USER -password=$PASSWORD migrate
```

### Setup a Custom Domain

1. Sign into your domain registrar. I use [Google Domains](https://domains.google.com).
1. Setup a new CNAME DNS record using the coudfront domain in the deploy output.
1. Make sure the CNAME aligns with the `customDomain` in `bin/prawn-cdk.ts`.

### Destroy the Stack

```
yarn cdk destroy --profile account-name
```

### Why is AWS Charging You?

1. Login to the root account.
1. On the account dropdown on the top right, click My Billing Dashboard.
1. Click Cost Explorer.
1. Click Daily Spend View.
1. Change the timeframe to the last 7 days.
1. Group by Usage Type.

The table below will give you a decent breakdown on your charges.

## Inspiration

The LAMP Stack (Linux, Apache, MySQL, PHP) is the inspiration for this project. I made a terrible chat app with it when I was in year 10 to get around the school's internet filter but it worked and it was really fun.

The best parts:

- Free hosting with dodgy hosts.
- Good local development with [MAMP](https://www.mamp.info/en/mac/).
- Relational database.
- Fun.

Some [other people](https://news.ycombinator.com/item?id=21567577) also agree.

I wanted to see if I could create a stack with similar qualities with more modern tools.

## Roadmap

### Ideas

1. Change page views table to an events table.
1. Setup a subdomain.
1. Setup a cron to hit an endpoint every 5 minutes. This can also act as a monitoring solution.
1. Graph the number of events over time with something like Nivo.
1. Setup a rollup table and iteratively refresh it as a materialized view solution.
1. Setup MDX on NextJS pages and add some more copy about the project.
1. Setup integration tests.
1. Set a maximum Lambda concurrency.
1. Use [serverless-postgres](https://github.com/MatteoGioioso/serverless-pg) for connecting to postgres.
1. Setup provisioned concurrency.

### Done

- Cache secrets from SecretManager. Didn't make much difference to latency but it does reduce compute time which reduces costs.
- Setup X-Ray tracing.
- Load testing results with wrk.
- Custom domain.
- Setup a budget in cdk.
- Moved setup the api and frontend in docker-compose. It's a bit slow though.
- Setup flyway for database migrations.
- Setup a NAT Instance to save on PrivateLink costs and allow internet access for Lambdas.
- Document the inspirations for this project.
- Setup frontend with nextjs.
- Setup pageViews in deployed environment.
- Set the NAT Gateways to 0 after being charged. Lucky I had a Budget!
- Setup pageViews with local postgres database.
- Setup serverless-express to make routing conistent for local and deployed environments.
- Setup Express to call the same handler as Lambda.
- Deploy a cdk stack with RDS and Lambda.

## Related Projects

- [cadbox1/backend-frontend-aws-cdk](https://github.com/cadbox1/backend-frontend-aws-cdk).
- [cadbox1/internal-magic-links-aws-cdk](https://github.com/cadbox1/internal-magic-links-aws-cdk).
- [cadbox1/node-api-2020](https://github.com/cadbox1/node-api-2020).
- [cdk-patterns-serverless/the-rds-proxy](https://github.com/cdk-patterns/serverless/tree/main/the-rds-proxy).
- [wclr/ts-node-dev](ts-node-dev).
- [vendia/serverless-express](https://github.com/vendia/serverless-express).
- [khezen/compose-postgres](https://github.com/khezen/compose-postgres)
