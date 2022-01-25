# Getting Prisma to work with Linux Container


### Step  1 - Install prisma/client package
---

Installing the prisma client proxy so we can generate our client based on our database

```bash
npm install @prisma/client
```

### Step 2 - Run `npx prisma generate` 
---

Generate the client from our host machine terminal in the api directory

```bash
> cd ..\services\workly-api
> npx prisma generate
```

You'll be then greeted with the following error:

```bash
🚀 Server ready at http://localhost:4000undefined

Mon, 24 Jan 2022 20:56:29 GMT workly-api:server Listening on port 3000

/app/node_modules/@prisma/client/runtime/index.js:36469

      throw new PrismaClientInitializationError(errorText, this.config.clientVersion);

            ^


PrismaClientInitializationError: Query engine library for current platform "linux-musl" could not be found.

You incorrectly pinned it to linux-musl


This probably happens, because you built Prisma Client on a different platform.

(Prisma Client looked in "/app/node_modules/@prisma/client/runtime/libquery_engine-linux-musl.so.node")


Searched Locations:


  /app/node_modules/.prisma/client

  ~\work-activity-dashboard\services\workly-api\node_modules\@prisma\client

  /app/node_modules/@prisma/client

  /app/node_modules/.prisma/client

  /app/node_modules/.prisma/client

  /tmp/prisma-engines

  /app/node_modules/.prisma/client



To solve this problem, add the platform "linux-musl" to the "binaryTargets" attribute in the "generator" block in the "schema.prisma" file:

generator client {

  provider      = "prisma-client-js"

  binaryTargets = ["native", "windows"]

}


Then run "prisma generate" for your changes to take effect.

Read more about deploying Prisma Client: https://pris.ly/d/client-generator

    at Object.getLibQueryEnginePath (/app/node_modules/@prisma/client/runtime/index.js:36469:13)

    at async Object.loadEngine (/app/node_modules/@prisma/client/runtime/index.js:36137:33)

    at async Object.instantiateLibrary (/app/node_modules/@prisma/client/runtime/index.js:36103:5) {

  clientVersion: '3.8.1',

  errorCode: undefined

}


Node.js vXX.X.X
```


If we examine the error log careful we will notice the following section: 
 
>To solve this problem, add the platform "linux-musl" to the "binaryTargets" attribute in the "generator" block in the "schema.prisma" file:
>
>generator client {
>
>  provider      = "prisma-client-js"
>
>  binaryTargets = ["native", "windows"]
>
>}
>
>
>Then run "prisma generate" for your changes to take effect.
>
>Read more about deploying Prisma Client: https://pris.ly/d/client-generator

### Step 3 - Configure `npx prisma generate` for multiple OS enviroments
---

The set up we have is that we execute `npx prisma generate` from the host machine outside of the docker container.

We have also mapped a volume to our host machine source code whic enables us to trigger source code refresh in the container when we execute `npm run start:build:api` for the express apollo server.

Navigate to the `.\prisma` at th root of the api project:

```bash
cd .\prisma
```

Locate and open the `schema.prisma` file:

```javascript
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

...
// OMITTED FOR BREVITY

```

Look for the `generator client` code block and follow the instructions in the error log from the docker container.

First we should add `binaryTargets` section then configure for our host machine given in my case to be a Windows OS:

We will add `native` flag and then OS specific flag i.e. `windows` acccording to the prisma docs:
```javascript
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native","windows"]
}

```

Secondly we need to configure for the docker container as well by adding `linux-musl` to the `buildTargets` array:

```javascript
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native","windows","linux-musl"]
}
```

Then execute `npx prisma generate` and you should successful create the prisma client:

```bash
> npx prisma generate
```

The following output should be generated:

```bash
DATABASE_URL needs to be set in docker-compose

Node.js vXX.X.X

Mon, 24 Jan 2022 23:49:06 GMT workly-api:server Listening on port 3000

/app/node_modules/@prisma/client/runtime/index.js:36174

            throw new PrismaClientInitializationError(error2.message, this.config.clientVersion, error2.error_code);

                  ^


PrismaClientInitializationError: error: Environment variable not found: DATABASE_URL.

  -->  schema.prisma:11

   | 

10 |   provider = "sqlserver"

11 |   url      = env("DATABASE_URL")

   | 


Validation Error Count: 1

    at Object.loadEngine (/app/node_modules/@prisma/client/runtime/index.js:36174:19)

    at async Object.instantiateLibrary (/app/node_modules/@prisma/client/runtime/index.js:36103:5) {

  clientVersion: '3.8.1',

  errorCode: 'P1012'

}


Node.js vXX.X.X
```

🙀 Oh no WTF!!!

🤨 What is happening here?

### Step 4 - Connecting to the database
---

Well let's inspect the error log from the container:

> DATABASE_URL needs to be set in docker-compose
>
> BLAH
>
> BLAH
>
> BLAH
>
> BLAH 
>PrismaClientInitializationError: error: Environment variable not found: DATABASE_URL.
>
>  -->  schema.prisma:11
>
>   | 
>
>10 |   provider = "sqlserver"
>
>11 |   url      = env("DATABASE_URL")
>
>   | 

Silly me do you remember we set the `DATABSE_URL` in the `.env` file at the root of the api project for our host machine to be the following:

```javascript
DATABASE_URL="sqlserver://localhost:1433;database=WorklyDb;user=sa;password=PMS@tr3d;encrypt=true;trustServerCertificate=true"
```

Remember we have exposed our MSSQL Server to our host machine port `1433` via `localhost:1433` 


```yaml
# docker-compose.yaml

services:
# ...
# Omitted for brevity
  database:
      container_name: database
      image: mcr.microsoft.com/mssql/server:2019-latest
      environment:
        ACCEPT_EULA: Y
        SA_PASSWORD: ${DATABSE_PASSWORD}
      ports:
        - '1433:1433'

```

So to make the container inside the compose file talk with with the database we have to use the service name defined under the `services:` section alias in our case i.e. `database`.

Let's add the `DATABASE_URL` environment in our `docker-compose.yml` by locating the `services` section then our api service i.e. `workly-api` by copying the value from `.env` file:

```yaml
# docker-compose.yaml

services:
# ...
# Omitted for brevity
  workly-api:
    container_name: workly-api
    build:
      context: ../services/workly-api
      dockerfile: Dockerfile
      target: dev
    environment:
      NODE_ENV: development 
      DATABASE_URL: "sqlserver://localhost:1433;database=WorklyDb;user=sa;password=${DATABSE_PASSWORD};encrypt=true;trustServerCertificate=true"
      # ...
      # Omitted for brevity
    ports:
      - '3001:3000'
    volumes:
      - ../services/workly-api/:/app
      - ../services/workly-api/node_modules/:/app/node_modules
  
```

We are almost there,the current value is still point to the host machine which the container will not know how resolve that IP addresss. 

We need it to point the container by it's `service alias` name as defined the compose file i.e. `database`.

Now let's fix the `DATABASE_URL` by replacing `localhost` in the connection string with `database`:


```javascript
// BEFORE
DATABASE_URL="sqlserver://localhost:1433;database=WorklyDb;user=sa;password=<password here>;encrypt=true;trustServerCertificate=true"
// AFTER
DATABASE_URL="sqlserver://database:1433;database=WorklyDb;user=sa;password=${DATABASE_PASSWORD};encrypt=true;trustServerCertificate=true"
```

We have replaced the `password=<password here>;` value with `password=${DATABASE_PASSWORD};` so that is pointing to the `.env` file for the docker-compose.

Your updated `docker-compse.yml` should look similar to the following:

```yaml
# docker-compose.yaml

services:
# ...
# Omitted for brevity
  workly-api:
    container_name: workly-api
    build:
      context: ../services/workly-api
      dockerfile: Dockerfile
      target: dev
    environment:
      NODE_ENV: development 
      DATABASE_URL: "sqlserver://database:1433;database=WorklyDb;user=sa;password=${DATABSE_PASSWORD};encrypt=true;trustServerCertificate=true"
      # ...
      # Omitted for brevity
    ports:
      - '3001:3000'
    volumes:
      - ../services/workly-api/:/app
      - ../services/workly-api/node_modules/:/app/node_modules
  
```

### Step 5 - Recreate and restart the container with `npm run start:build:api`
---

Now that we have everything configured, let's regenerate the prisma client:

```bash
> npx prisma generate
```

Fingers crossed 🤞🏽, execute the following:


```bash
> npm run start:build:api
```

We should see the conatiner successfully 🏁 started with following output in the container logs:

```bash
🚀 Server ready at http://localhost:4000undefined

GET /graphql 200 209.881 ms - -

OPTIONS /graphql 204 13.618 ms - 0

POST /graphql 200 1264.609 ms - 17244

POST /graphql 200 67.711 ms - 17244

OPTIONS /graphql 204 2.073 ms - 0

POST /graphql 200 266.690 ms - 17658

POST /graphql 200 97.881 ms - 17658

POST /graphql 200 49.180 ms - 17658

POST /graphql 200 45.868 ms - 17658

POST /graphql 200 52.107 ms - 17658

POST /graphql 200 27.691 ms - 17658

OPTIONS /graphql 204 12.072 ms - 0

POST /graphql 200 96.279 ms - 17244

POST /graphql 200 22.673 ms - 17244

POST /graphql 200 87.276 ms - 17658

POST /graphql 200 62.724 ms - 17658

OPTIONS /graphql 204 1.393 ms - 0

POST /graphql 200 81.293 ms - 17658

POST /graphql 200 24.270 ms - 17658

POST /graphql 200 61.165 ms - 17658

POST /graphql 200 52.567 ms - 17658

POST /graphql 200 62.259 ms - 17658

POST /graphql 200 14.024 ms - 17658

OPTIONS /graphql 204 1.671 ms - 0

POST /graphql 200 62.693 ms - 17658

Tue, 25 Jan 2022 00:00:02 GMT workly-api:server Listening on port 3000
```
