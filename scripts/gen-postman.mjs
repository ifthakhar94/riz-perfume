/**
 * Generates the Riz Perfume Postman collection (schema v2.1.0).
 * Run: node scripts/gen-postman.mjs
 */
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ---------- helpers ----------
const url = (segments, query) => {
  const enabled = (query ?? []).filter((q) => !q.disabled);
  const qs = enabled.length ? "?" + enabled.map((q) => `${q.key}=${q.value}`).join("&") : "";
  const u = {
    raw: `{{baseUrl}}/${segments.join("/")}${qs}`,
    host: ["{{baseUrl}}"],
    path: segments,
  };
  if (query && query.length) u.query = query;
  return u;
};

const saveId = (varName) =>
  [
    "// Auto-save the created record's id for later PATCH/DELETE requests",
    "try {",
    "  var d = pm.response.json();",
    `  if (d && d.data && d.data.id != null) pm.collectionVariables.set("${varName}", String(d.data.id));`,
    "} catch (e) {}",
  ].join("\n");

/**
 * Build a request item.
 * body: object (JSON.stringify) | string (used verbatim, may embed {{vars}}) | undefined
 */
const req = (name, method, segments, opts = {}) => {
  const { query, body, noauth, test, description } = opts;
  const request = { method, header: [], url: url(segments, query) };
  if (description) request.description = description;
  if (body !== undefined) {
    request.header.push({ key: "Content-Type", value: "application/json" });
    const raw = typeof body === "string" ? body : JSON.stringify(body, null, 2);
    request.body = { mode: "raw", raw, options: { raw: { language: "json" } } };
  }
  if (noauth) request.auth = { type: "noauth" };
  const item = { name, request };
  if (test) {
    item.event = [{ listen: "test", script: { type: "text/javascript", exec: test.split("\n") } }];
  }
  return item;
};

const folder = (name, items, description) => ({ name, description, item: items });

const Q = (key, value, disabled = false, description) => ({ key, value, disabled, description });

// ---------- folders ----------
const items = [
  folder("Health", [req("Health check", "GET", ["health"], { noauth: true })]),

  folder(
    "Auth",
    [
      req("Register", "POST", ["auth", "register"], {
        noauth: true,
        description:
          'Public self-registration (always role USER). An authenticated ADMIN may also pass "role": "ADMIN" to create an admin.',
        body: {
          fullname: "Test User",
          email: "user@example.com",
          phoneNumber: "+8801700000000",
          password: "Password123!",
          district: "Dhaka",
          addressLine: "123 Road",
        },
      }),
      req("Login (admin)", "POST", ["auth", "login"], {
        noauth: true,
        description:
          "On success, the collection test script stores data.accessToken into {{accessToken}} automatically.",
        body: { email: "{{adminEmail}}", password: "{{adminPassword}}" },
      }),
      req("Refresh token", "POST", ["auth", "refresh"], {
        noauth: true,
        description:
          "Uses the httpOnly refresh cookie set at login (Postman sends it automatically). Refreshes {{accessToken}}.",
      }),
      req("Logout", "POST", ["auth", "logout"], { noauth: true }),
      req("Me", "GET", ["auth", "me"], { description: "Current authenticated user." }),
    ],
    "Authentication. Login first — the token is captured automatically.",
  ),

  folder("Users", [
    req("List users", "GET", ["users"], {
      query: [Q("page", "1"), Q("pageSize", "20")],
      description: "Admin only.",
    }),
  ]),

  folder("Categories", [
    req("List categories", "GET", ["categories"], {
      noauth: true,
      query: [Q("includeInactive", "true", true, "Admin-style listing incl. inactive")],
      description: "Public.",
    }),
    req("Create category", "POST", ["categories"], {
      body: { name: "Oud", isActive: true },
      test: saveId("categoryId"),
    }),
    req("Update category", "PATCH", ["categories", "{{categoryId}}"], {
      body: { name: "Oud (Premium)", isActive: true },
    }),
    req("Delete category", "DELETE", ["categories", "{{categoryId}}"]),
  ]),

  folder("Sizes", [
    req("List sizes", "GET", ["sizes"], { noauth: true }),
    req("Create size", "POST", ["sizes"], { body: { name: "50ml" }, test: saveId("sizeId") }),
    req("Update size", "PATCH", ["sizes", "{{sizeId}}"], { body: { name: "60ml" } }),
    req("Delete size", "DELETE", ["sizes", "{{sizeId}}"]),
  ]),

  folder("Types", [
    req("List types", "GET", ["types"], { noauth: true }),
    req("Create type", "POST", ["types"], {
      body: { name: "Eau de Parfum" },
      test: saveId("typeId"),
    }),
    req("Update type", "PATCH", ["types", "{{typeId}}"], { body: { name: "Extrait de Parfum" } }),
    req("Delete type", "DELETE", ["types", "{{typeId}}"]),
  ]),

  folder("Products", [
    req("List products", "GET", ["products"], {
      noauth: true,
      query: [
        Q("page", "1"),
        Q("pageSize", "10"),
        Q("search", "oud", true),
        Q("categoryId", "1", true),
        Q("includeInactive", "true", true),
      ],
      description: "Public list. Filters are optional (toggle the disabled query params).",
    }),
    req("Get product by slug", "GET", ["products", "{{productSlug}}"], {
      noauth: true,
      description: "Public. Set {{productSlug}} to a real slug.",
    }),
    req("Get product by id (admin)", "GET", ["products", "by-id", "{{productId}}"], {
      description: "Admin only — returns inactive products too.",
    }),
    req("Create product", "POST", ["products"], {
      test: saveId("productId"),
      body: [
        "{",
        '  "name": "Midnight Oud",',
        '  "slug": "midnight-oud",',
        '  "imageUrl": null,',
        '  "imageAlt": null,',
        '  "metaTitle": "Midnight Oud — Riz Perfume",',
        '  "metaDescription": "A deep, smoky oud fragrance.",',
        '  "ogTitle": "Midnight Oud",',
        '  "ogDescription": "<p>A deep, smoky oud fragrance.</p>",',
        '  "ogImageUrl": null,',
        '  "inspiredBy": "",',
        '  "topNotes": ["Bergamot", "Saffron"],',
        '  "middleNotes": ["Rose", "Oud"],',
        '  "baseNotes": ["Amber", "Musk"],',
        '  "mainAccords": ["Woody", "Smoky"],',
        '  "description": "<p>Rich oud composition.</p>",',
        '  "isActive": true,',
        '  "categoryIds": [{{categoryId}}],',
        '  "relatedProductIds": []',
        "}",
      ].join("\n"),
    }),
    req("Update product", "PATCH", ["products", "{{productId}}"], {
      body: { name: "Midnight Oud (v2)", isActive: true },
    }),
    req("Delete product", "DELETE", ["products", "{{productId}}"]),
  ]),

  folder(
    "Variants",
    [
      req("List variants (by product)", "GET", ["variants"], {
        query: [Q("productId", "{{productId}}")],
        description: "Admin only. productId is required.",
      }),
      req("Create variant", "POST", ["variants"], {
        test: saveId("variantId"),
        body: [
          "{",
          '  "productId": {{productId}},',
          '  "sizeId": {{sizeId}},',
          '  "typeId": {{typeId}},',
          '  "price": 2500,',
          '  "sku": "MO-50-EDP",',
          '  "stockQuantity": 100,',
          '  "isActive": true',
          "}",
        ].join("\n"),
      }),
      req("Update variant", "PATCH", ["variants", "{{variantId}}"], {
        body: { price: 2700, stockQuantity: 80 },
      }),
      req("Delete variant", "DELETE", ["variants", "{{variantId}}"]),
    ],
    "Admin only.",
  ),

  folder(
    "Variant Costs",
    [
      req("List variant costs (by variant)", "GET", ["variant-costs"], {
        query: [Q("productVariantId", "{{variantId}}")],
        description: "Admin only. productVariantId is required.",
      }),
      req("Create variant cost", "POST", ["variant-costs"], {
        test: saveId("variantCostId"),
        body: [
          "{",
          '  "productVariantId": {{variantId}},',
          '  "rawMaterialCost": 400,',
          '  "bottleCost": 120',
          "}",
        ].join("\n"),
      }),
      req("Update variant cost", "PATCH", ["variant-costs", "{{variantCostId}}"], {
        body: { rawMaterialCost: 450, bottleCost: 130 },
      }),
      req("Delete variant cost", "DELETE", ["variant-costs", "{{variantCostId}}"]),
    ],
    "Internal cost data — admin only.",
  ),

  folder("Courier Charges", [
    req("List courier charges", "GET", ["courier-charges"], {
      noauth: true,
      query: [
        Q("zone", "inside_dhaka", true, "inside_dhaka | outside_dhaka"),
        Q("deliveryType", "home_delivery", true, "home_delivery | courier_pickup"),
      ],
      description: "Public.",
    }),
    req("Create courier charge", "POST", ["courier-charges"], {
      test: saveId("courierChargeId"),
      description:
        "zone: inside_dhaka | outside_dhaka. deliveryType: home_delivery | courier_pickup.",
      body: {
        courier: "Pathao",
        zone: "inside_dhaka",
        deliveryType: "home_delivery",
        charge: 60,
        quantityToMultiplyCharge: 1,
      },
    }),
    req("Update courier charge", "PATCH", ["courier-charges", "{{courierChargeId}}"], {
      body: { charge: 80 },
    }),
    req("Delete courier charge", "DELETE", ["courier-charges", "{{courierChargeId}}"]),
  ]),

  folder("Orders", [
    req("Create order (checkout)", "POST", ["orders"], {
      noauth: true,
      test: saveId("orderId"),
      description:
        "Public, guest-capable checkout. Send a Bearer token to attach the order to a user. Eligible active offers apply automatically.",
      body: [
        "{",
        '  "username": "John Doe",',
        '  "email": "john@example.com",',
        '  "phone": "+8801711111111",',
        '  "district": "Dhaka",',
        '  "addressLine": "House 1, Road 2",',
        '  "courierChargeId": {{courierChargeId}},',
        '  "items": [',
        '    { "productVariantId": {{variantId}}, "quantity": 1 }',
        "  ]",
        "}",
      ].join("\n"),
    }),
    req("List orders", "GET", ["orders"], {
      query: [
        Q("page", "1"),
        Q("pageSize", "10"),
        Q("status", "PENDING", true, "PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELED"),
      ],
      description: "Admin only.",
    }),
    req("Get order", "GET", ["orders", "{{orderId}}"], {
      description: "Admin only (includes cost).",
    }),
    req("Update order status", "PATCH", ["orders", "{{orderId}}", "status"], {
      description:
        "status: PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELED. CANCELED restores stock.",
      body: { status: "CONFIRMED" },
    }),
    req("Update order delivery", "PATCH", ["orders", "{{orderId}}", "delivery"], {
      description: "status: PENDING|DISPATCHED|DELIVERED|CANCELED.",
      body: { status: "DISPATCHED", canceledReason: null },
    }),
  ]),

  folder("Offers", [
    req("List active offers", "GET", ["offers", "active"], {
      noauth: true,
      description: "Public — currently-live offers.",
    }),
    req("List offers", "GET", ["offers"], { description: "Admin only — all offers." }),
    req("Create offer", "POST", ["offers"], {
      test: saveId("offerId"),
      description:
        "type: FREE_DELIVERY | PRODUCT_PERCENT | ORDER_PERCENT | FLAT_DISCOUNT_TK. For percent types, value is 0–100 and discountUpToAmount caps it.",
      body: {
        name: "Eid Special",
        type: "ORDER_PERCENT",
        value: 10,
        minOrderAmount: 1000,
        discountUpToAmount: 500,
        isActive: true,
        startDate: "2026-01-01T00:00:00.000Z",
        endDate: "2027-01-01T00:00:00.000Z",
      },
    }),
    req("Update offer", "PATCH", ["offers", "{{offerId}}"], {
      body: { value: 15, isActive: true },
    }),
    req("Delete offer", "DELETE", ["offers", "{{offerId}}"]),
  ]),

  folder(
    "Expense Categories",
    [
      req("List expense categories", "GET", ["expense-categories"], {
        query: [Q("includeInactive", "true", true)],
        description: "Admin only.",
      }),
      req("Create expense category", "POST", ["expense-categories"], {
        test: saveId("expenseCategoryId"),
        body: { name: "Raw Materials", description: "Oud, alcohol, fixatives", isActive: true },
      }),
      req("Update expense category", "PATCH", ["expense-categories", "{{expenseCategoryId}}"], {
        body: { name: "Raw Materials & Bottles" },
      }),
      req("Delete expense category", "DELETE", ["expense-categories", "{{expenseCategoryId}}"]),
    ],
    "Admin only.",
  ),

  folder(
    "Expenses",
    [
      req("List expenses", "GET", ["expenses"], {
        query: [
          Q("page", "1"),
          Q("pageSize", "10"),
          Q("categoryId", "1", true),
          Q("from", "2026-01-01", true, "YYYY-MM-DD"),
          Q("to", "2026-12-31", true, "YYYY-MM-DD"),
        ],
        description: "Admin only.",
      }),
      req("Create expense", "POST", ["expenses"], {
        test: saveId("expenseId"),
        body: [
          "{",
          '  "expenseCategoryId": {{expenseCategoryId}},',
          '  "expenseDate": "2026-06-01",',
          '  "amount": 5000,',
          '  "description": "Oud oil purchase",',
          '  "vendorName": "Supplier Co",',
          '  "paymentMethod": "bKash",',
          '  "transactionReference": "TXN123",',
          '  "invoiceNumber": "INV-001"',
          "}",
        ].join("\n"),
      }),
      req("Update expense", "PATCH", ["expenses", "{{expenseId}}"], { body: { amount: 5500 } }),
      req("Delete expense", "DELETE", ["expenses", "{{expenseId}}"]),
    ],
    "Admin only.",
  ),

  folder(
    "Investments",
    [
      req("List investments", "GET", ["investments"], {
        query: [Q("page", "1"), Q("pageSize", "10")],
        description: "Admin only.",
      }),
      req("Create investment", "POST", ["investments"], {
        test: saveId("investmentId"),
        body: {
          investorName: "Mr. Rahman",
          amount: 100000,
          transactionMedium: "Bank transfer",
          transactionFromAccount: "ACC-1001",
          receivedAccount: "ACC-2002",
          proofDetails: "Deposit slip #123",
          updateReason: "Initial capital",
        },
      }),
      req("Update investment", "PATCH", ["investments", "{{investmentId}}"], {
        body: { amount: 120000, updateReason: "Top-up" },
      }),
      req("Delete investment", "DELETE", ["investments", "{{investmentId}}"]),
    ],
    "Admin only.",
  ),
];

// ---------- collection ----------
const collection = {
  info: {
    _postman_id: randomUUID(),
    name: "Riz Perfume API",
    description:
      "Riz Perfume backend API.\n\n## Quick start\n1. Set the `baseUrl` variable if your API is not on http://localhost:4000/api.\n2. Run **Auth → Login (admin)**. The access token is captured into `{{accessToken}}` automatically and sent as a Bearer token on every protected request.\n3. The refresh token is an httpOnly cookie — Postman stores it automatically, so **Auth → Refresh token** works with no setup.\n4. Each **Create …** request saves the new record's id (e.g. `{{productId}}`, `{{orderId}}`) so the matching Update/Delete requests work immediately.\n\nPublic endpoints (no token needed): product/category/size/type/courier-charge reads, active offers, and order checkout.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  auth: { type: "bearer", bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }] },
  event: [
    {
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [
          "// Collection-wide: capture access token from any auth response",
          "try {",
          "  var json = pm.response.json();",
          "  if (json && json.data && json.data.accessToken) {",
          '    pm.collectionVariables.set("accessToken", json.data.accessToken);',
          "    if (json.data.user && json.data.user.id != null) {",
          '      pm.collectionVariables.set("userId", String(json.data.user.id));',
          "    }",
          "  }",
          "} catch (e) {}",
        ],
      },
    },
  ],
  variable: [
    { key: "baseUrl", value: "http://localhost:4000/api", type: "string" },
    { key: "adminEmail", value: "admin@rizperfume.com", type: "string" },
    { key: "adminPassword", value: "ChangeMe123!", type: "string" },
    { key: "accessToken", value: "", type: "string" },
    { key: "userId", value: "", type: "string" },
    { key: "productId", value: "1", type: "string" },
    { key: "productSlug", value: "midnight-oud", type: "string" },
    { key: "variantId", value: "1", type: "string" },
    { key: "variantCostId", value: "1", type: "string" },
    { key: "categoryId", value: "1", type: "string" },
    { key: "sizeId", value: "1", type: "string" },
    { key: "typeId", value: "1", type: "string" },
    { key: "courierChargeId", value: "1", type: "string" },
    { key: "orderId", value: "1", type: "string" },
    { key: "offerId", value: "1", type: "string" },
    { key: "expenseCategoryId", value: "1", type: "string" },
    { key: "expenseId", value: "1", type: "string" },
    { key: "investmentId", value: "1", type: "string" },
  ],
  item: items,
};

const outDir = join(ROOT, "postman");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "Riz-Perfume.postman_collection.json");
writeFileSync(outFile, JSON.stringify(collection, null, 2) + "\n");

const count = items.reduce((n, f) => n + f.item.length, 0);
console.log(`Wrote ${outFile}`);
console.log(`Folders: ${items.length} · Requests: ${count}`);
