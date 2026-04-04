# Finance Data API
*Finance Data Processing and Access Control Backend*

**Developer:** Shishpal Polampally  
**Email:** shishpalpolampally@gmail.com  
**Role:** Backend Developer Intern - Zorvyn Assignment

## Project Overview
This is a robust, clean, and scalable backend API built for a finance dashboard system. It handles the storage, management, and analytical aggregation of financial entries alongside a strict Role-Based Access Control (RBAC) mechanism.

Built with **Node.js, Express.js, and MongoDB**, the architecture focuses cleanly on separation of concerns, maintainability, and data integrity.

## Core Features Implemented
- **User and Role Management**: Built a fully functional user identity system with secure JWT authentication. Includes provisions for creating users and restricting actions based on defined tiers: `viewer`, `analyst`, and `admin`.
- **Financial Records CRUD**: Full Create, Read, Update, and Delete lifecycles over financial records. Supported exclusively by rigorous schema constraints.
- **Record Filtering (by date, category, type)**: Fetching ledgers supports robust categorical filtering, date-range bounding (ISO8601), and semantic type matching (`income` vs `expense`).
- **Dashboard Summary APIs (totals, trends)**: Integrated highly performant MongoDB aggregation pipelines (`$group`, `$match`, `$project`) enabling category-wise totals, net balances, recent activity, and chronological weekly/monthly trends.
- **Role Based Access Control**: Advanced hierarchical middleware intercepting unauthorized interactions (e.g., Viewers cannot read raw datasets; Analysts cannot mutate data; only Admins possess full management / destructive privileges).
- **Input Validation and Error Handling**: Implemented `express-validator` to aggressively scrub payloads before controller execution. Abstracted unhandled exceptions into isolated logical middleware (`ApiError`/`ApiResponse`).
- **Data Persistence (Database)**: Handled gracefully via the Mongoose ODM hooked to MongoDB. Features native ACID compliance/Transactions ensuring safe concurrency during nested document updates.

## Live Deployment & Testing
The backend is fully deployed and accessible via Vercel. 
👉 **Base URL:** [https://finance-data-api-sigma.vercel.app](https://finance-data-api-sigma.vercel.app)

*(A `live_test.js` script is included in the directory to quickly run end-to-end tests against the live deployment instead of localhost).*

## Codebase Architecture & File Structure
The codebase follows a modularized, domain-driven structure wherein each feature has isolated responsibilities.

```
src/
├── app.js                   # Application initialization, global middleware, & route mounting
├── config/                  # Configuration files (Database connections, etc.)
├── middleware/              # Reusable middleware (Auth, RBAC, Data Validation, Error Handlers)
├── models/                  # Mongoose Schema definitions (User, FinancialRecord, AuditLog)
├── modules/                 # Domain-driven modules
│   ├── auth/                # Authentication logic (register, login, me)
│   ├── dashboard/           # Aggregation logic and analytical endpoints
│   ├── records/             # Financial records CRUD logic
│   └── users/               # Admin panel user management
└── utils/                   # Helper functions (Async handlers, Custom Error classes)
```

## API Routes & Input Formats
Data inputs require JSON application payloads (`application/json`). Authentication uses Bearer JWT (`Authorization: Bearer <token>`).

### 1. Auth Module (`/api/auth`)
Handles identity and token generation.
- `POST /register`: Registers a new user.
  - **Input**: `{ "name": "string", "email": "string", "password": "string(min:6)" }`
- `POST /login`: Authenticates an existing user.
  - **Input**: `{ "email": "string", "password": "string" }`
- `GET /me`: Returns the currently authenticated user profile. (Requires Token).

### 2. Users Module (`/api/users`) - *Admin Only*
Handles system back-office user management.
- `GET /`: Lists all users.
  - **Query Params**: `?role=(viewer|analyst|admin)&isActive=(true|false)&page=1&limit=20`
- `POST /`: Directly provisions a new user with specific privileges.
  - **Input**: `{ "name": "string", "email": "string", "password": "string", "role": "viewer|analyst|admin" }`
- `PATCH /:id/role`: Modifies an existing user's role.
  - **Input**: `{ "role": "viewer|analyst|admin" }`
- `PATCH /:id/status`: Modifies an existing user's active status.
  - **Input**: `{ "isActive": boolean(true|false) }`

### 3. Financial Records Module (`/api/records`) - *Analysts & Admins*
Handles the ledger of truth. *Admins* possess write permissions; *Analysts* possess read permissions.
- `GET /`: Lists paginated ledger records.
  - **Query Params**: `?type=(income|expense)&category=string&search=string&startDate=ISO8601&endDate=ISO8601&page=1&limit=20`
- `GET /:id`: Retrieves a single record globally.
- `POST /`: Creates a new ledger entry.
  - **Input**: `{ "amount": number(>0), "type": "income|expense", "category": "string", "date": "ISO8601 Date", "description": "string (optional)" }`
- `PATCH /:id`: Updates an existing entry (fields are strictly optional).
  - **Input**: `{ "amount": number, "type": "income|expense", "category": "string", "date": "ISO8601 Date", "description": "string" }`
- `DELETE /:id`: Soft deletes a record, flipping the active toggle.

### 4. Dashboard Module (`/api/dashboard`)
Provides pre-computed analytical views for the frontend via MongoDB aggregations.
- `GET /summary`: Returns global balances (`totalIncome`, `totalExpense`, `netBalance`) and counts.
- `GET /recent`: Returns an array of the latest un-deleted ledger records.
  - **Query Params**: `?limit=number (default:10)`
- `GET /categories`: Returns aggregations split comprehensively by category amounts. (*Analyst / Admin*)
- `GET /monthly`: Returns statistical aggregation mapped by month index. (*Analyst / Admin*)
  - **Query Params**: `?year=YYYY`
- `GET /weekly`: Returns historical trailing weekly snapshots. (*Analyst / Admin*)

## Setup Process
1. Clone the repository and install all required dependencies:
   ```bash
   npm install
   ```
2. Initialize your environment variables. Ensure MongoDB is running locally or provide a URI string.
   ```bash
   cp .env.example .env
   ```
3. Start the development server (runs with nodemon):
   ```bash
   npm run dev
   ```
4. Seed the database with sample users (admin, analyst, viewer) and sample financial records:
   ```bash
   npm run seed
   ```

## Running Tests
A full integration test suite guarantees API reliability. It spins up an isolated `mongodb-memory-server` and utilizes Jest & Supertest. To run the automated checks:
```bash
npm run test
```

## Technical Decisions and Trade-offs
**Framework & Database Choice:**
- **Node.js & Express.js**: Chosen for its fast, non-blocking I/O capabilities, which are perfectly suited for heavy JSON data manipulation and RESTful routing where concurrent throughput is essential.
- **MongoDB & Mongoose**: Chosen explicitly to leverage NoSQL's aggregation framework. The pipelines (`$group`, `$match`, `$project`) are incredibly robust and faster for constructing complex categorical or chronological dashboard statistics compared to building massive relational SQL `JOIN` logic.

**Implementation Trade-offs & Architecture:**
1. **JSON Web Tokens (JWT) vs Stateful Sessions**: I purposely opted for stateless JWTs over traditional Stateful Session-IDs. *Trade-off*: While JWTs are drastically easier to uniformly horizontally scale without a centralized memory instance, immediately revoking a specific user's corrupted token mid-session technically requires a blacklist mechanism via Redis. Given the scope of this assignment, the lightweight agility of JWTs greatly outweighed the overhead of implementing dedicated memory stores.
2. **ACID Transactions vs Eventual Consistency**: Whenever a financial record is modified via the service layers, an `AuditLog` tracking instance is synchronously fired inside a Native MongoDB Transaction. *Trade-off*: This inherently mandates uncompromised data sequence integrity at a marginal reduction of massive-scale write-throughput. For financial data, integrity is vastly superior to extreme throughput.
3. **Offset Pagination vs Cursor Pagination**: *Trade-off*: I opted for traditional Offset/Limit pagination (`skip()` & `limit()`) paired alongside total document counts. While offset pagination physically degrades at enormous scale margins, it provides the front-end dashboard the necessary metadata to seamlessly render predictable fractional 'Pages', which is a massive usability win.
4. **Hierarchical RBAC Model**: I mathematically modeled access via rank integers (`Viewer: 1, Analyst: 2, Admin: 3`). This cleanly avoids massively duplicative middleware checks.
5. **Non-Destructive Deletions**: Assumed soft-deletion mechanisms were absolutely necessary. Financial records are never truly dropped from the active disk, preserving referential integrity against accidental data loss.

## Additional Notes
- **Setup Prerequisites**: Because the application utilizes true MongoDB ACID Transactions for its Audit layer, your MongoDB Database **must** be configured as a Replica Set (such as a standard MongoDB Atlas cluster). Standalone local MongoDB installations will reject transactions. *(Note: The Jest automated tests use `mongodb-memory-server` which spins up a replica set simulation automatically).*
- **Automated Live Verifications**: Included in the root is a `live_test.js` script. Simply execute `node live_test.js` to run a suite of end-to-end integration verifications traversing the actual Vercel cloud deployment endpoints locally.
- **Areas for Improvement**: If scaled to a high-traffic enterprise level, the `/api/dashboard/*` analytical routines would ideally be offloaded to a Redis caching layer to avoid constantly calculating mathematical totals directly on the primary Disk storage.

---
*Developed as an engineering assignment.*
