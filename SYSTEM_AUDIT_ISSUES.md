# 🛠️ GarageSaaS - Enterprise System Audit & Remediation Backlog

> **System Target:** 100 Tenants | 1,000 Orders/Day per Tenant (100,000 Orders/Day Total, ~36.5 Million Transactions/Year) | 24/7/365 High Availability

---

## 1. Security Audit (අතිශය බරපතල ආරක්ෂක අවදානම්)

### 🚨 1.1 CRITICAL: Path Traversal / Arbitrary File Download
- **අදාළ ගොනුව:** [routes/tenant.php:26-32](file:///e:/Projects/Done%20Projects/GarageSaaS/routes/tenant.php#L26-L32)
- **ගැටලුව:** `/tenant-media/{path}` රූට් එකේ `where('path', '.*')` සහ කිසිදු auth middleware එකක් නැතිව `storage_path("app/public/{$path}")` පාවිච්චි කර ඇත.
- **බලපෑම:** ඕනෑම බාහිර පුද්ගලයෙකුට `GET /tenant-media/../../.env` ලෙස request එකක් යවා application root එකේ ඇති database passwords, `APP_KEY`, mail credentials ඇතුළු සියලුම රහස්‍ය තොරතුරු බාගත කරගත හැක (Critical CVE-level Information Disclosure).
- **විසඳුම:** `realpath()` පාවිච්චි කර file path එක strictly `storage/app/public` ඇතුලත පමණක් පිහිටන බව තහවුරු කිරීම සහ directory traversal patterns (`..`) සම්පූර්ණයෙන්ම reject කිරීම.

---

### ⚠️ 1.2 Rate Limiting නැතිකම (Brute Force & DoS Susceptibility)
- **අදාළ ගොනු:** [routes/tenant.php](file:///e:/Projects/Done%20Projects/GarageSaaS/routes/tenant.php) (විශේෂයෙන් `tenant.login`, `owner.pos.storeJob`, `owner.orders.payments.store`)
- **ගැටලුව:** Login සහ තීරණාත්මක Order / Payment mutation endpoints සඳහා කිසිදු rate limiting middleware එකක් (`throttle`) යොදා නැත.
- **බලපෑම:** Brute force login attacks මඟින් passwords හැක් කිරීමේ අවදානම සහ client scripts හරහා automated rapid requests එවා database connection pool එක exhaust කර මුළු system එක crash කිරීමේ හැකියාව පවතී.
- **විසඳුම:** `throttle:5,1` (Login සඳහා) සහ සාමාන්‍ය authenticated APIs සඳහා `throttle:120,1` වැනි නිසි rate limiters ක්‍රියාත්මක කිරීම.

---

### ⚠️ 1.3 Multi-Tenant Cache Collision
- **අදාළ ගොනුව:** [config/tenancy.php:32](file:///e:/Projects/Done%20Projects/GarageSaaS/config/tenancy.php#L32)
- **ගැටලුව:** `Stancl\Tenancy\Bootstrappers\CacheTenancyBootstrapper` එක comment කර disable කර ඇත.
- **බලපෑම:** Tenants 100 ම එකම global cache namespace එක share කරයි. එක් garage එකක cache කරන settings, session counters හෝ sequence numbers තවත් tenant කෙනෙකුට overwrite වීම හෝ leak වීම සිදුවිය හැක.
- **විසඳුම:** Redis cache driver එක සමඟ tenant cache tagging හෝ dynamic tenant prefixing (`tenant_{id}_`) configure කිරීම.

---

## 2. Performance & Concurrency Audit (Load & Scale)

### 🚨 2.1 CRITICAL: Stock Decrement Race Condition
- **අදාළ ගොනුව:** [app/Http/Controllers/GarageOwner/JobWorkspaceItemController.php:80-87](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/JobWorkspaceItemController.php#L80-L87)
- **ගැටලුව:** `Inventory::find($request->item_id)` හරහා row lock එකක් නොමැතිව stock එක පරීක්ෂා කර decrement කරනු ලබයි.
- **බලපෑම:** එකම item එකෙන් 1ක් පමණක් ඉතිරිව තිබියදී cashiers හෝ mechanics දෙදෙනෙකු එකම තත්පරයේදී checkout කළහොත්, දෙදෙනාටම quantity = 1 පෙනී දෙදෙනාම decrement කරයි. එවිට stock එක -1 වී inventory balance එක corrupt වේ.
- **විසඳුම:** Pessimistic lock (`lockForUpdate()`) හෝ Atomic guarded decrement (`Inventory::where('id', $id)->where('quantity', '>=', $qty)->decrement('quantity', $qty)`) යෙදීම.

---

### ⚠️ 2.2 Missing Database Composite Indexes (Filesort Performance Drop)
- **අදාළ ගොනු:** 
  - `service_jobs` table
  - `invoices` table
  - `deleted_orders` table
- **ගැටලුව:** `Invoice::where('garage_id', $garageId)->orderBy('id', 'desc')` සහ `Job::where('garage_id', $garageId)->orderBy('id', 'desc')` නිතර run වුවද, database එකේ ඇත්තේ `(garage_id, status)` සහ `(garage_id, created_at)` indexes පමණි. `(garage_id, id)` index එක නැත.
- **බලපෑම:** Orders දහස් ගණනක් එකතු වන විට MySQL වලට `filesort` කිරීමට සිදුවී query time එක millisecond ගණනක සිට තත්පර ගණනක් දක්වා ඉහළ ගොස් CPU 100% spike වේ.
- **විසඳුම:** `(garage_id, id)` composite index එක අදාළ tables වලට migration එකක් මඟින් ඇතුළත් කිරීම.

---

### ⚠️ 2.3 Quadratic `whereHas` Queries in Reports
- **අදාළ ගොනුව:** [app/Http/Controllers/GarageOwner/ReportController.php:37-58](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/ReportController.php#L37-L58)
- **ගැටලුව:** `invoices` table එකේදීම `garage_id` තිබියදී `Invoice::whereHas('job', ...)` සහ `Payment::whereHas('invoice.job', ...)` ලෙස 2-tier nested `EXISTS` subqueries run කරයි.
- **බලපෑම:** මසකට orders 30,000ක් ඇති garage එකක Reports page එක load වීමට තත්පර 10–15ක් ගතවී database engine එක freeze වේ.
- **විසඳුම:** `invoices.garage_id` කෙලින්ම query කිරීම සහ Payments වලට composite index හෝ direct relation හරහා query එක optimize කිරීම.

---

## 3. Database Design & Data Integrity Audit

### 🚨 3.1 `job_items` Table එකේ `inventory_id` Foreign Key එකක් නැතිකම
- **අදාළ ගොනුව:** [app/Http/Controllers/GarageOwner/JobWorkspaceItemController.php:154-159](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/JobWorkspaceItemController.php#L154-L159)
- **ගැටලුව:** Job එකකින් item එකක් remove කරද්දී හෝ quantity අඩු කරද්දී stock එක ආපසු එකතු කරන්නේ `Inventory::where('item_name', $item->description)->first()` ලෙස නමෙන් සෙවීමෙනි.
- **බලපෑම:** කිසියම් අයෙකු item description එක වෙනස් කළහොත් (උදා: vehicle note එකක් ඇතුලත් කලහොත්) හෝ එකම නම ඇති items වෙනත් categories වල තිබුණහොත්, වැරදි item එකක stock වැඩිවේ හෝ stock එක කිසිසේත්ම restore නොවේ.
- **විසඳුම:** `job_items` table එකට `inventory_id` (foreign key) column එකක් එකතු කර, inventory restore logic එක `inventory_id` මත පදනම් කිරීම.

---

### ⚠️ 3.2 Decimal vs Integer Validation Mismatch
- **අදාළ ගොනු:** 
  - [app/Http/Controllers/GarageOwner/OrderController.php:224](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/OrderController.php#L224)
  - [app/Http/Controllers/GarageOwner/InventoryController.php:37, 74](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/InventoryController.php#L37)
- **ගැටලුව:** Database එකේ `quantity` column එක `decimal(10,2)` ලෙස වෙනස් කර තිබුණද, Controllers වල තවමත් validate කරන්නේ `'quantity' => 'required|integer'` ලෙසයි.
- **බලපෑම:** තෙල් ලීටර් 1.5ක් හෝ හෝස් මීටර් 0.5ක් වැනි fractional quantities ඇතුළත් කළ විට client හට HTTP 422 `"The quantity must be an integer."` validation error එක ලැබේ.
- **විසඳුම:** Controller validations සියල්ල `'quantity' => 'required|numeric|min:0.01'` ලෙස යාවත්කාලීන කිරීම.

---

### ⚠️ 3.3 GRN Direct Courier Stock Inconsistency & Missing Total Calculation
- **අදාළ ගොනුව:** [app/Http/Controllers/GarageOwner/InventoryController.php:51-61](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/InventoryController.php#L51-L61)
- **ගැටලුව:** Courier එකෙන් එන බඩු Job එකකට assign කරද්දී:
  1. `$job->total_cost` සහ `$job->invoice->total_amount` recalculate නොවේ.
  2. Inventory record එකට stock එක එකතු වී, එම stock එකම job එකටත් assign වීම නිසා double inventory recording ඇතිවේ.
  3. `DB::transaction()` නොමැති නිසා එකක් සාර්ථක වී අනෙක fail වුවහොත් data desync වේ.
- **විසඳුම:** `DB::transaction()` ඇතුලත Job Item එක එකතු කර, Job & Invoice Total recalculate කර, stock allocation එක නිවැරදි කිරීම.

---

## 4. Pagination, Chunking & Hybrid Sorting Audit

### ⚠️ 4.1 Orders Table Sorting & Duplication Bug
- **අදාළ ගොනු:**
  - [app/Http/Controllers/GarageOwner/OrderController.php:43-48](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/OrderController.php#L43-L48)
  - [resources/js/Pages/GarageOwner/Orders/OrdersTable.jsx:9](file:///e:/Projects/Done%20Projects/GarageSaaS/resources/js/Pages/GarageOwner/Orders/OrdersTable.jsx#L9)
- **ගැටලුව:** 
  1. Frontend එකේදී `[...(invoices?.data || []), ...(deletedOrders || [])].sort((a, b) => b.id - a.id)` ලෙස වෙනස් tables දෙකක auto-increment IDs එකිනෙකට සංසන්දනය කර sort කරයි.
  2. Server එකෙන් `DeletedOrder::take(50)` ලෙස සෑම request එකකටම එකම deleted orders 50 එවයි.
- **බලපෑම:** 
  1. `invoices.id` සහ `deleted_orders.id` වෙනස් sequence නිසා orders අක්‍රමිකව මිශ්‍ර වේ.
  2. User කෙනෙක් Orders පිටුවේ Page 2, Page 3, Page 4 යන ඕනෑම page එකකට ගිය විටත් මුලින් පෙනුණු Deleted Orders 50 ම නැවත නැවතත් පෙන්වයි (Pagination duplicate bug).
- **විසඳුම:** Deleted Orders සඳහා වෙනම Tab එකක් හෝ වෙනම server-side paginated query එකක් හඳුන්වා දීම.

---

## 5. Error Handling & Observability Audit

### ⚠️ 5.1 Raw SQL Error Leakage to End-Users
- **අදාළ ගොනුව:** [bootstrap/app.php:33-40](file:///e:/Projects/Done%20Projects/GarageSaaS/bootstrap/app.php#L33-L40)
- **ගැටලුව:** API/JSON requests වලදී unhandled exception එකක් ආ විට කෙලින්ම `$e->getMessage()` return කරයි.
- **බලපෑම:** Production environment එකකදී database syntax errors, table names, hostnames සහ internal query parameters client browser එකට leak වේ (Security & Information Disclosure risk).
- **විසඳුම:** Exception එක server log එකට incident UUID එකක් සමඟ record කර, client හට sanitized user-friendly message එකක් සහ incident reference ID එකක් පමණක් ලබාදීම.

---

## 6. Power Cut & Signal Loss Resilience Audit (විදුලිය විසන්ධි වීම සහ අන්තර්ජාල සංඥා නැතිවීම්)

### 🚨 6.1 Unsaved Form State Loss on Power / Browser Crash
- **අදාළ ගොනු:** [resources/js/Pages/GarageOwner/POS.jsx](file:///e:/Projects/Done%20Projects/GarageSaaS/resources/js/Pages/GarageOwner/POS.jsx) (New Job Modal), [resources/js/Pages/GarageOwner/Orders/OrderPaymentModal.jsx](file:///e:/Projects/Done%20Projects/GarageSaaS/resources/js/Pages/GarageOwner/Orders/OrderPaymentModal.jsx), Job Workspace Notes
- **ගැටලුව:** Form fields වල data තබා ඇත්තේ React in-memory state (`useState`) වල පමණි. Garage එකේ විදුලිය විසන්ධි වූ විට හෝ පරිගණකය restart වූ විට cashier/mechanic ටයිප් කරමින් සිටි Customer details, vehicle numbers සහ notes සියල්ල ක්ෂණිකව නැතිවී යයි.
- **බලපෑම:** Cashier හට නැවත සියලු විස්තර මුල සිට ටයිප් කිරීමට සිදුවේ (Data loss & User frustration).
- **විසඳුම:** `localStorage` Auto-Draft mechanism එකක් හඳුන්වා දීම. Form fields වල data ටයිප් කරන විට ස්වයංක්‍රීයව browser storage එකේ තාවකාලිකව save කර තබා, power ආ පසු හෝ page reload වූ විට "Restore Draft" option එක ලබාදීම හෝ auto-populate කිරීම. Form එක submit වූ පසු draft එක clear කිරීම.

---

### ⚠️ 6.2 Missing Offline & Signal Drop Detection
- **අදාළ ගොනු:** Frontend Layouts (`AuthenticatedLayout.jsx`)
- **ගැටලුව:** Garage එකේ 4G dongle එක හෝ Wi-Fi router එක drop වූ විට හෝ signal lost වූ විට user ට ඒ බව පෙන්වන්නේ නැත. User දිගටම "Save", "Add Payment" හෝ "Complete Job" click කරයි. Request එක network fail වී browser error එකක් හෝ infinite loading spinner එකක් පෙන්වයි.
- **බලපෑම:** User සිතන්නේ data save වුණා කියාය, නමුත් request එක server එකට ගොස් නැත.
- **විසඳුම:** Global Network Offline Banner එකක් (`navigator.onLine` event listener) යෙදීම. Signal නැතිවූ වහාම තිරයේ ඉහළ රතු පැහැති *"⚠️ අන්තර්ජාල සම්බන්ධතාවය විසන්ධි වී ඇත. කරුණාකර නැවත සම්බන්ධ වන තුරු රැඳී සිටින්න"* පණිවිඩයක් පෙන්වා සියලු submission buttons lock කිරීම. Connection නැවත ලැබුණු පසු ස්වයංක්‍රීයව banner එක අයින් කිරීම.

---

## 7. Universal Database Transactions Audit (Zero Partial Writes Guarantee)

### 🚨 7.1 Multi-Step Controllers Without `DB::transaction()`
- **අදාළ ගොනු:**
  - [app/Http/Controllers/GarageOwner/OrderController.php:123-143](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/OrderController.php#L123-L143) (`destroy` method: `DeletedOrder::create` + `$invoice->delete`)
  - [app/Http/Controllers/GarageOwner/OrderController.php:169-213](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/OrderController.php#L169-L213) (`updatePayment`: `$payment->update` + `$invoice->update` + `JobTimeline::create`)
  - [app/Http/Controllers/GarageOwner/OrderController.php:215-261](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/OrderController.php#L215-L261) (`updateItem`: `$item->update` + `$invoice->update` + `JobTimeline::create`)
  - [app/Http/Controllers/GarageOwner/OrderController.php:263-289](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/OrderController.php#L263-L289) (`deleteItem`: `$item->delete` + `$invoice->update` + `JobTimeline::create`)
  - [app/Http/Controllers/GarageOwner/InventoryController.php:32-64](file:///e:/Projects/Done%20Projects/GarageSaaS/app/Http/Controllers/GarageOwner/InventoryController.php#L32-L64) (`store`: `Inventory::create` + `JobItem::create`)
- **ගැටලුව:** මේ කිසිදු method එකක `DB::transaction()` හෝ `DB::beginTransaction()` නොමැත!
- **බලපෑම:** Server එක හෝ database එක විදුලිය විසන්ධි වීමක් හෝ crash වීමක් සිදුවුවහොත්, හෝ timeline එක insert වෙද්දී error එකක් ආවොත්, පළමු update එක සිදුවී දෙවැන්න සිදුනොවේ (Partial State Corruption). උදාහරණයක් ලෙස order එක delete නොවී deleted table එකට පමණක් වැටීම, නැතහොත් item එකේ මිල වෙනස් වී invoice එකේ total එක පරණ එකම පැවතීම.
- **විසඳුම:** System එකේ Database tables එකකට වඩා update වන සෑම තැනකටම අනිවාර්යයෙන්ම `DB::transaction(function() { ... })` යෙදීම. කිසියම් අසාර්ථක වීමකදී මුළු transaction එකම auto-rollback වන බවට සහතික වීම.

---

## 8. Double-Click & Rapid Multi-Submission Prevention Audit

### 🚨 8.1 Millisecond-Level Double-Click Vulnerability
- **අදාළ ගොනු:**
  - [resources/js/Pages/GarageOwner/Orders/OrderPaymentModal.jsx](file:///e:/Projects/Done%20Projects/GarageSaaS/resources/js/Pages/GarageOwner/Orders/OrderPaymentModal.jsx) ("Add Payment" button)
  - [resources/js/Pages/GarageOwner/Jobs/Partials/JobCart.jsx:97](file:///e:/Projects/Done%20Projects/GarageSaaS/resources/js/Pages/GarageOwner/Jobs/Partials/JobCart.jsx#L97) ("Complete & Generate Order" button)
  - [resources/js/Pages/GarageOwner/Jobs/Partials/JobCart.jsx:60,71](file:///e:/Projects/Done%20Projects/GarageSaaS/resources/js/Pages/GarageOwner/Jobs/Partials/JobCart.jsx#L60) (Quantity +/- buttons)
  - [resources/js/Pages/GarageOwner/POS.jsx:495](file:///e:/Projects/Done%20Projects/GarageSaaS/resources/js/Pages/GarageOwner/POS.jsx#L495) ("Start Job" button)
- **ගැටලුව:**
  1. `disabled={processing}` යොදා තිබුණද, Inertia/React state එක `processing = true` බවට render වීමට තත්පරයෙන් සියයෙන් පංගුවක (10ms–50ms) latency එකක් ඇත. නොඉවසිලිමත් cashier කෙනෙක් mouse එක දෙවරක් click කළහොත් (double-click), click events දෙකම server එකට යයි.
  2. `JobCart.jsx` හි "Complete & Generate Order" button එක `<Link method="post">` එකක් වන අතර එහි කිසිදු `disabled` check එකක් හෝ click lock එකක් නොමැත.
  3. Backend එකේ duplicate submission prevent කිරීමට Idempotency Key එකක් හෝ atomic lock එකක් නොමැත.
- **බලපෑම:** එකම payment එක දෙපාරක් වැටී customer ට double charge වීම, එකම job එකට invoice දෙකක් හැදීම, හෝ එකම item එක double add වීම.
- **විසඳුම:**
  1. **Frontend Synchronous Lock (0ms Ref Lock):** Button click එක සිදු වූ සැනින් `isSubmittingRef.current = true` ලෙස synchronous lock එකක් දමා millisecond 1ක් ඇතුළත එන ඊළඟ click සියල්ල ignore කිරීම.
  2. **Global Button Component:** සියලුම action buttons සඳහා click කළ සැණින් visual spinner එකක් දමා disabled කරන standard reusable `SafeButton` component එකක් භාවිතා කිරීම.
  3. **Backend Idempotency Token:** Payment processing වැනි critical endpoints වලට form එකෙන් client-generated unique `idempotency_token` එකක් යවා, එම token එකෙන් duplicate requests තත්පර කිහිපයක් යනතුරු reject කිරීම.

---

## 📋 Action Plan & Implementation Priority

| ප්‍රමුඛතාවය | කාර්යය (Task) | තත්ත්වය | විස්තරය (Resolution Details) |
| :---: | :--- | :---: | :--- |
| **P0 (Critical)** | 1.1 `/tenant-media/{path}` Path Traversal Security Fix | ✅ Completed | `realpath()` confinement and directory traversal protection implemented |
| **P0 (Critical)** | 2.1 Atomic & Locked Inventory Decrement (Race Condition Fix) | ✅ Completed | Guarded atomic decrement `where('quantity', '>=', $qty)` implemented in `JobWorkspaceItemController` |
| **P0 (Critical)** | 7.1 All Write Operations wrapped in `DB::transaction()` | ✅ Completed | `OrderController`, `InventoryController`, `InventoryLocationController` wrapped in transactions |
| **P0 (Critical)** | 8.1 Frontend 0ms Synchronous Click-Locking & SafeButton | ✅ Completed | Created `SafeButton.jsx` with synchronous ref-locking and integrated across Modals and Cart |
| **P0 (Critical)** | 3.1 `job_items` table එකට `inventory_id` FK එකතු කිරීම | ✅ Completed | Tenant migration created and executed; `JobItem` model updated with relation |
| **P0 (Critical)** | 3.2 Decimal Quantity Validations | ✅ Completed | Fixed in `OrderController`, `InventoryController` (`numeric|min:0.01`) |
| **P1 (High)** | 6.1 Form Auto-Save & LocalStorage Draft Recovery | ✅ Completed | Created `useFormDraft.js` hook and integrated into POS Start Job modal |
| **P1 (High)** | 6.2 Global Network Status Banner (Offline/Signal Lost detector) | ✅ Completed | Created `NetworkStatusBanner.jsx` and integrated in `AuthenticatedLayout.jsx` |
| **P1 (High)** | 2.2 Database Composite Indexes `(garage_id, id)` එකතු කිරීම | ✅ Completed | Tenant migration executed on `service_jobs`, `invoices`, `deleted_orders`, `cashbook_transactions` |
| **P1 (High)** | 2.3 `ReportController` Query Optimization (`whereHas` ඉවත් කිරීම) | ✅ Completed | Eliminated nested subqueries in `ReportController` using direct indexed queries |
| **P1 (High)** | 3.3 GRN Direct Courier Job Total Recalculation & Transaction | ✅ Completed | Automated total cost recalculation & wrapped in transaction in `InventoryController` |
| **P1 (High)** | 4.1 Orders Table Deleted Orders Pagination & Sorting Fix | ✅ Completed | Dedicated Active/Deleted tabs with independent server-side pagination |
| **P2 (Medium)** | 1.2 Rate Limiting Middleware (`throttle`) යෙදීම | ✅ Completed | Added `throttle:6,1` on login and `throttle:180,1` on tenant session routes |
| **P2 (Medium)** | 5.1 Exception Handling Sanitization & Incident ID | ✅ Completed | Configured in `bootstrap/app.php` with unique Incident UUIDs |
| **P2 (Medium)** | 1.3 Tenant Cache Separation Configuration | ✅ Completed | Dynamic tenant cache prefixing on `TenancyInitialized` in `TenancyServiceProvider` |

