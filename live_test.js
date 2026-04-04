const https = require("https");
const http = require("http");

const BASE_URL = "https://finance-data-api-sigma.vercel.app/api";

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (e) => reject(e));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runLiveTests = async () => {
  console.log("🚀 Starting Live API Tests against Vercel...");
  try {
    // 1. Health Check
    console.log("\n[1] Testing Health Endpoint...");
    const health = await makeRequest("GET", "/../health");
    console.log(`Status: ${health.status} => `, health.body);
    if (health.status !== 200) throw new Error("Health check failed");

    // Randomize emails to avoid conflict if already registered
    const randomSalt = Math.floor(Math.random() * 100000);
    const adminEmail = `admin_${randomSalt}@test.com`;

    // 2. Register User (Viewer by default)
    console.log("\n[2] Registering User...");
    const register = await makeRequest("POST", "/auth/register", {
      name: "Live Admin User",
      email: adminEmail,
      password: "password123",
      role: "admin", // Try to register as admin (though depending on route logic it might just register)
    });
    console.log(`Status: ${register.status} => `, register.body);
    if (register.status === 500) {
        console.log("❌ 500 Error: Did you forget to set MONGODB_URI in Vercel environment variables?");
        return;
    }

    // 3. Login
    console.log("\n[3] Logging in...");
    const login = await makeRequest("POST", "/auth/login", {
      email: adminEmail,
      password: "password123",
    });
    console.log(`Status: ${login.status} => Success: ${login.body.success}`);
    const token = login.body.data?.token;
    if (!token) throw new Error("Could not acquire token. Stopping tests.");

    // 4. Create Record (Needs Admin, if the registration bypass didn't make them admin, this might 403, but let's test)
    console.log("\n[4] Creating Record (Admin)...");
    const create = await makeRequest("POST", "/records", {
      amount: 450,
      type: "income",
      category: "Freelance",
      date: new Date().toISOString(),
      description: "Live test record"
    }, token);
    console.log(`Status: ${create.status} => `, create.body);

    // 5. Get Records
    console.log("\n[5] Fetching Records...");
    const records = await makeRequest("GET", "/records", null, token);
    console.log(`Status: ${records.status} => Expected 200, got data length:`, records.body.data ? records.body.data.length : records.body);

    // 6. Get Dashboard Summary
    console.log("\n[6] Fetching Dashboard Summary...");
    const dash = await makeRequest("GET", "/dashboard/summary", null, token);
    console.log(`Status: ${dash.status} => `, dash.body);

    console.log("\n✅ All live tests completed.");
  } catch (err) {
    console.error("\n❌ Live Test Failed:", err.message);
  }
};

runLiveTests();
