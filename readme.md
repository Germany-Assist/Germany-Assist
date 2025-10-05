# Germany assist Backend

This is the first commit containing the scaffolding of our project please read the next steps to run the application properly

## Installation

After cloning, use npm install.

```
npm install
```

## Enviroment

Please create a .env file following the sample_env.txt file structure
Also, you need to name the file (dev.env) for the current script to work. A screenshot of the files will be down below

Database should exist with the same name in the env file.

## Scripts

Currently, only the dev script exists, which will run the app with the dev.env file as the environment file, and the app will run in watch mode (meaning the app will restart after each time you edit the code)

```bash
npm run dev
```

# about the code

This version only contains the basic scaffolding of the app, a database model called users was created for testing, only one temp router called users was created, which will lead to two routes:-

1. http://localhost:3000/user -- using the GET method will get all the users in the Users table
2. http://localhost:3000/user -- using the POST method will create a new user firstname "test" in the Users table

## Notice

1.  Sequelize was used; however, currently, the Sequelize CLI will not work properly
2.  The current app does not have any error handling
3.  Cors was added, but needs to be configured
4.  Prettier was used to lint the code using the default configuration

## Folder Structure

![image](./assets/screenshots/folderstructure.png)

## Database

### Models

Following the MVC pattern models were created.

Current models:

- Business Profiles: representing all the business profiles without the ability to list services.
- Providers Profiles: business with listing services.
- User: contains all the user info
- Service: listing all the services.
- UserServices: organizing the services requested by the users.
- Contract: rules and relations between users and service providers should be subjected to.
- Reviews: reviews and ratings on all the services.
- Coupon: coupons to be redeemed.
- Assets: contains all the URLs for the assets that were uploaded.
- Favourite: holds the favorite services of the users

Other models :

- users_business_profiles
- users_providers_profiles

Some of the missing models :

- Transactions
- Posts
- Comments
- Categories
- Badges
- Events
- Locations
- Policies

Please note that the above model name might slightly differ

### Scripts Seeds And Files

Inside the Database Forlder, you will find many files including :

- dbIndex.js
- migrateAndSeed.js

dbIndex creates all the relations constraints inside a function and collects all the models to export the usefully, to use the models just import "db" and it will contain all the models.

```javascript I'm A tab
import db from "../database/dbIndex.js";
db.User.create(user);
```

migrateAndSeed is the script responsible for proper creation and seeding and constraints of the database,
since seeding the database with constraints will create errors.

"Basically you might add an entity of a foreign key that doesn't exist yet"

It works in three stages:

1. Creates the skeleton.
2. Seeds the data.
3. Apply the constraints.

However, this script will delete everything before in the database so it's locked to "test" or "dev" environments.

To run the script:

```
npm run dbInit
```

![image](./assets/screenshots/successSeed.png)

```javascript
dbInit: "node --env-file=dev.env ./database/migrateAndSeed.js",
```

### Notes :

- the dummy data are not logical nor realistic for example you might find a service with a lot of reviews that don't actually exist or a total rating for a provider that exceeds the actual review count.
- It's only for testing and development you can adjust the enviroment variables to meet toy demands.
- init file will be created in the future to reduce the import statements.

### Adding more models

1. Create the model in models folder
2. Add proper constraints to the dbIndex.js file
3. Add the model the the db object depnding if its needed or not
4. In case of seeds create the seeds file inside the seeds folder
5. register the file in the migrateAndSeed.js
6. make sure of following the pattren in the in migrateAndSeed

## Logging

The app has three loggers using winston logger and morgan, all of which loggers will collect the timestamps and the error stack if needed, the loggers follow the application environment which means their behavior might change depending on the environment further explanation blow.

### 1. Http Logger:

This logger will print on the console the incoming requests the response code and the response time and will save the log file with the same info, the logger is automatically implemented with the Morgon logger

### 2. Error Logger

Error logger is responsible for printing errors to the console and saving them locally, please note that in the `dev` environment the error stack will be printed and saved but in the `production` environment the error stack will not be printed instead it will print error notifications.

### 3. Debug Logger

Use this logger to print any information that you might find helpful during debugging, please note that in `production` the logger will catch nothing also in the debug logger no data will be saved

### 4. Info Logger

Info logger is not an independent logger however it utilizes the debug logger to save and print data, use cases are for informative non-sensitive important info like server start time stamp and server down.

### How To Use

first you can import each logger spreatly:

```js
import infoLogger from "./utils/loggers.js";
import errorLogger from "./utils/loggers.js";
import debugLogger from "./utils/loggers.js";
import httpLogger from "./utils/loggers.js";
```

- http logger will not be used manuly instaed its impeded with morgan package to collect data about requests to check how it works visit the `.\middlewares\morgan.middleware.js` file.

- Error logger: should recive the error only instance the logger will collect the message and the stack.
  ```js
  errorLogger(error);
  ```
- Info Logger:
  ```js
  infoLogger("server is shutting down");
  ```
- debugLogger:
  ```js
  infoLogger("Testing if the function was called correctly");
  ```

### Important to know

- The log file will be created daily and will be deleted after 14 days and cannot exceed 20mb.
- log are saved at `./log` directory, each file name will contain the level and the date: `errors-2025-07-06.log`.
- tThe Loggers will read the env file and set the log level.
- logs are not encrypted since no sensitive info exists in them, not collecting sensitive information is good, it will reduce the load on the server "since we are not encrypting them" also can easily be used in the future for analytics.

### Examples

For this example, i missed the database password in the env file wich will triger the error logger and the info logger
infoLogger.png;
![image](./assets/screenshots/infoLogger.png)
this mistake will print this on the console importnat to notice that two logger where used the error logger and the info logger note that the error stack will not be printed if the env was production like the example below

```
2025-07-06 19:26:47:2647 info:
 "Unable to connect to the database:", password authentication failed for user "postgres"
 server is shutting down
2025-07-06 19:26:47:2647 error:  password authentication failed for user "postgres" Error occurred please check the logs
```

however the error stack will be writen to the log file also the info log will be writen.

## JWT AND Cookies

This app will provide access tokens and refresh tokens

1. both their secrets and expiration will be in the `env` file.
2. The routes will utilize the JWT middleware where the token will be automatically verified and decrypted to `req.auth`

# Error handling

Following some of the common best code practices custom `Error` class was created and named `AppError`. to use it :

```js
import { AppError } from "./utils/error.class.js";
throw new AppError(404, "bad route", true);
```

### The parameters

```js
httpCode, message, isOperational;
```

1. httpCode is the response code the user will receive
2. message is the error message that will be logged
3. isOperational is boolean flag used to distinguish between operational errors and programming errors.

### Error middleware

```js
app.use(errorMiddleware);
```

this error middleware will receive the error and respond to the client and log the error

```js
app.use("/", (req, res, next) => {
  throw new AppError(404, "bad route", true);
});
```

Important to note in case of `async` error use `try catch` and then pass the error

Will crash the app

```js
❌
app.use("/", (req, res, next) => {
  Promise.resolve().then(() => {
    throw new AppError(404, "bad route", true);
 });
});
```

Use `try catch` or `.then` chains.

```js
✅
app.use("/", async (req, res, next) => {
  try {
    await Promise.resolve().then(() => {
      throw new AppError(404, "bad route", true)
 });
 } catch (error) {
    next(error);
 }
});

```

# Before Stripe

### Creating Services :

Please note that the super user or super admin is already created in the db and to use it just use the postman login [Super](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/example/46470876-24dfe4f1-63de-40da-bbf2-e47da257ee73?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574)

1. Create a Service Provider Account [Create Sp](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-38315b01-381d-4eb0-8bff-cacd5c6a749a?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574)
2. activate the account using the activation end point or adjust the database in the user table, using the end point as an admin you can either create an admin and activated first using the root account token or use the root account token to activate th SP directly [activate](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-bf9f4996-3fc6-4099-a2e1-1b2ca9750086?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574)
3. After you activate the SP u can create a service [create service](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-2e79e982-102a-49b0-8451-3d779e4f6fc7?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574).
4. finally you need to approve that service as an admin or superAdmin same as point 2 you can u use the endpoint in postman or edit the database [approve Service](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-19d07457-8e61-4e75-882b-2229a7f4e09f?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574).

### Buying a service

1. Create a Client account using postman [client](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-120b45b1-c277-4661-a654-e067082f8a27?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574).
2. Search for All The Services pick a service or many and copy there hashed ids [get All](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-02a8d1b8-76fd-4fc0-9b6c-214235d1199b?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574)
3. Add them to cart one by one [cart](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-7b6e1ef7-27dc-447a-9360-e610da74c82e?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574)
4. U now need to place an order however you need the cart ids please fetch you profile first [Profile](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-c241bcca-2aa0-4d93-bcbe-b01f1047a0d4?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574)
5. Now you can checkout [checkout](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-020524c4-92a8-42e5-9a28-be11fd049b39?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574) you can add an array of cart ids, please copy the order id.
6. Using the order id u can proceed to payment [Pay](https://germany-assist-developers.postman.co/workspace/germany-assist-backend~6fc3fc31-357e-4a37-8f5d-78191eea88fb/request/46470876-e5ed7243-4a7c-420d-a5e5-c421b2aa8ee3?action=share&source=copy-link&creator=46470876&active-environment=879320a9-5ece-4a85-8f26-80d11242f574) this will send back your order with current prices and create a payment intent that you can use to pay copy the payment intent only its basically the text before the secrete something like `pi_3S6FTDELmWjKj6gv0O96BXxR`

# Stripe payments

To Test it

🔴 Make sure u have stripe cli by confirming version `stripe -v`.

Step 1

please run this in a deferent terminal so it can redirect the calls to the local server make port.

`stripe listen --forward-to localhost:3000/payments/webhook`

step 2

Please replace the intent id and run to confirm the intent.

CMD

`stripe payment_intents confirm pi_3S6FTDELmWjKj6gv0O96BXxR --payment-method pm_card_visa`

BASH etc.

`stripe payment_intents confirm pi_3S6DoNELmWjKj6gv0w1IbBAF \
 --payment-method pm_card_visa`
