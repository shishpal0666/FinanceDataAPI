# Finance Data API
*Finance Data Processing and Access Control Backend*

## Project Overview
This is a robust, clean, and scalable backend API built for a finance dashboard system. It handles the storage, management, and analytical aggregation of financial entries alongside a strict Role-Based Access Control (RBAC) mechanism.

Built with **Node.js, Express.js, and MongoDB**, the architecture focuses cleanly on separation of concerns, maintainability, and data integrity.

## Core Features Implemented
- **User & Role Management**: Secure user creation with JWT authentication (`bcryptjs`). Strict enforcement of `viewer`, `analyst`, and `admin` roles.
- **Financial Records Management**: Full CRUD operations bolstered by regex search functionalities, categorical filtering, and date-range limiters.
- **Dashboard Summary Aggregations**: Highly performant MongoDB aggregation pipelines (`$group`, `$match`, `$project`) enabling category-wise totals, recent activity, and chronological trends (weekly/monthly charts).
- **Advanced Access Control Logic**: A hierarchical middleware intercepting unauthorized actions (e.g., Viewers cannot read raw individual records; Analysts cannot create/edit data; only Admins possess destructive data privileges).
- **Validation & Error Boundaries**: Implemented `express-validator` to scrub and guarantee payload requirements. Abstracted error funnels into isolated middleware classes (`ApiError`/`ApiResponse`).
- **Data Persistence & ACID Transactions**: Utilizes the Mongoose ODM. Relies heavily on MongoDB sessions/transactions for multi-document operations (such as creating an `AuditLog` precisely alongside a `FinancialRecord` edit).

## API Documentation
The API is completely documented dynamically via OpenAPI 3.0 (Swagger). 
Once the server is booted, visit the interactive user interface to explore endpoints, schemas, and parameter requirements:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

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

## Architectural Assumptions Made
1. **Hierarchical RBAC Model**: I assumed that access rights intrinsically operate hierarchically. An *Admin* fully inherits the reading permissions of an *Analyst*, and an *Analyst* inherits the dashboard capabilities of a *Viewer*. This allows for clean mathematical mapping of permissions via `ROLE_RANK` integers (`Viewer: 1, Analyst: 2, Admin: 3`), avoiding duplicated middleware checks.
2. **Audit Accountability Requirements**: Because this is a simulated *Financial System*, strict accountability is absolutely crucial. I assumed that any destructive action or state modification (creating users, changing roles, mutating financial ledgers) must be historically traceable. Therefore, an `AuditLog` model engine was established natively into the standard mutation processes.
3. **Admin User-Provisioning Methods**: I assumed that while a public registration endpoint exists (defaulting safely to a `viewer` classification), Administrators require a discrete and authoritative internal endpoint (`POST /api/users`) to instantiate fully-fledged Analysts or other Admins independently.
4. **Non-Destructive Data Retention**: I assumed soft-deletion mechanisms were necessary over raw hard-deletions. Financial records are never truly dropped from the active disk. Instead, an `isDeleted` flag is toggled. This guarantees historical referential integrity and prevents accidental catastrophic data loss.

## Tradeoffs Considered
1. **JSON Web Tokens (JWT) vs Stateful Sessions**: I purposely opted for stateless JWTs over traditional Stateful Session-IDs. 
   - *Tradeoff*: While JWTs are drastically easier to uniformly horizontally scale without a centralized memory instance, immediately revoking a specific user's corrupted token mid-session before expiration technically requires a blacklist mechanism via Redis. Given the scope of this assignment, the lightweight agility of JWTs greatly outweighed the overhead of implementing dedicated memory stores.
2. **ACID Transactions vs Eventual Consistency**: Whenever a financial record is modified via the service layers, an `AuditLog` tracking instance is synchronously fired inside a MongoDB Transaction. 
   - *Tradeoff*: This inherently mandates uncompromitted data sequence integrity at a marginal reduction of massive-scale write-throughput, and necessitates a MongoDB Replica Set configuration. For financial data, data integrity is vastly superior to extreme throughput.
3. **Offset Pagination vs Cursor Pagination**: Cursor-based pagination is typically optimal for millions of datasets. 
   - *Tradeoff*: I opted for traditional Offset/Limit pagination (`skip()` & `limit()`) paired alongside total document counts. While offset pagination physically degrades at enormous scale margins, it provides the front-end dashboard the necessary metadata to seamlessly render fractional 'Pages' out of the box, which is a massive usability win for dashboard tooling.

---
*Developed as an engineering assignment.*
