# FinanceDataAPI

Finance Data Processing and Access Control Backend

## How to Run Locally

1. Install all required dependencies:
   ```bash
   npm install
   ```

2. Start the development server (runs with nodemon):
   ```bash
   npm run dev
   ```

3. Seed the database with sample users and financial records:
   ```bash
   npm run seed
   ```

## Interactive API Documentation
Once the server is running, you can test all endpoints directly from your browser using Swagger UI:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

## Running Tests
The project includes a full integration test suite using Jest and an in-memory MongoDB server. To run the automated tests:
```bash
npm run test
```
