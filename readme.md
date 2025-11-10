# Germany Assist Backend

Germany Assist Backend is the core backend API powering the Germany Assist platform — a place to connect with employers, promote your professional services, and start your career.  
It provides secure authentication, payments, timeline-based interactions, role-driven access management, and a complete logging and error-handling system.

---

## 🧩 Tech Stack

- **Runtime:** Node.js (Express)
- **ORM:** Sequelize (PostgreSQL)
- **Cache:** Redis
- **Auth:** JWT (Access + Refresh Tokens via Cookies)
- **Payments:** Stripe (test and live modes supported)
- **Logging:** Winston + Morgan
- **Testing:** Node.js native test runner + Sinon (stubbing) + Supertest (E2E)
- **Containerization:** Docker (planned for future deployment)

---

## ⚙️ Core Features

### 🔹 1. Timelines

- Each **service creation** automatically generates a **timeline**.
- Every service must always have **one active timeline**.
- Older timelines can be **archived** when new ones are created.
- Clients who purchase a service gain access to its timeline, allowing them to:
  - View content and posts.
  - Interact with the service provider.
  - Communicate with other users linked to that service.

---

### 🔹 2. Orders

- Orders are created:
  1. **Automatically** when a client buys a service (free or paid).
  2. **Automatically** by background workers when a payment is confirmed.
- Order states:
  1. 🟢 **Paid** – Payment confirmed.
  2. 🔵 **Refunded** – Payment returned to client.
  3. 🟠 **Fulfilled** – Service provider completed the service.
  4. 🟣 **Completed** – Provider received payment for the fulfilled service.

---

### 🔹 3. Roles and Permissions

- Supports **roles** and **permissions** for fine-grained access control.
- Permissions can be **assigned or revoked** based on authority and ownership.
- Users cannot assign permissions higher than their own.
- Role templates define default permissions for entities like admin, worker, and client.

---

### 🔹 4. Updates & Field Restrictions

- Certain fields like **email**, **reviews**, **phone numbers**, and **service descriptions** have restricted updates.
- Some fields can be **frozen** during ongoing transactions.
- Service updates may temporarily **withdraw approval** until reviewed.

---

### 🔹 5. Upload Assets Management

- Uploads are tracked in an **assets table**.
- Assets are linked to entities such as services or profiles.
- If an asset link is dropped, a worker will delete the file later.
- Rate limits or bandwidth restrictions may apply per uploader entity.

---

### 🔹 6. Summary Table

| Feature                   | Trigger / Action                      | Behavior Description         |
| ------------------------- | ------------------------------------- | ---------------------------- |
| **Timeline Creation**     | New service created                   | Auto-creates active timeline |
| **Timeline Archiving**    | Service updated or recreated          | Archives old timeline        |
| **Order Creation**        | Service purchase or confirmed payment | Generates linked order       |
| **Order State Update**    | Payment, refund, fulfillment          | Updates order state          |
| **Permission Management** | Admin or authorized user action       | Checked against template     |

---

## 🔐 Authentication

### Access & Refresh Tokens

- Uses **JWT** with access and refresh tokens.
- **Access tokens** are short-lived for API access.
- **Refresh tokens** are long-lived, stored securely in HTTP-only cookies in case of production its HTTPS.
- Middleware automatically validates and decrypts tokens into `req.auth`.

---

## 🧰 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Redis

Install and run Redis; add connection variables to .env.

### 3. Setup PostgreSQL

Install, create a database, and add connection variables to .env.

### 4. Environment File

Create dev.env using dev.env.txt as a template.
Use test.env for testing environments.

### 5. When all ready

Run the script `npm run dbInit`

---

## 🏃 Scripts

### Development

```
npm run dev
```

Runs the app in watch mode with dev.env.

### Database Initialization

```
npm run dbInit
```

1. Creates schema

2. Seeds initial data

3. Applies constraints

⚠️ Deletes existing data; only use in dev or test.

- super important since it seeds the categories and the permissions and creates the root account
- root account password is in the seed file

### Testing

```
npm test
npm run workflowTest
```

- Pre scripts run automatically.
- Supports Node test runner, Sinon, Supertest.

### Export & Seed

```
npm run export # Export DB to JSON
npm run seed # Seed DB from exported JSON
```

- Default path: ./database/seeds/data

---

## 🪵 Logging

### Loggers

1. HTTP Logger: Tracks requests/responses via Morgan.

2. Error Logger: Logs errors; shows stack in dev, minimal info in production.

3. Debug Logger: For development; disabled in production.

4. Info Logger: General information like server start/shutdown.

---

## 🧱 Error Handling

- Centralized middleware with custom AppError class:

```js
import { AppError } from "./utils/error.class.js";
throw new AppError(404, "Bad route", true);
```

```js
 throw new AppError([status code],[message], [operational:true/false],[public message]);
```

- When handling errors in the error middleware if the error has public message only the public message will be sent to the user.

## 💳 Payments (Stripe)

`/pay` endpoint takes service ID to create payment intents and get client secrets.

**Local testing:**

```bash
stripe listen --forward-to localhost:3000/payments/webhook
stripe payment_intents confirm pi_xxx --payment-method pm_card_visa
```

- Dont forget to install stripe cli and provide the secret key and the webhook secret
