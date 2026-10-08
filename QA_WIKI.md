# GarageSaaS - Knowledge Base & QA Wiki

This document serves as the central knowledge base and QA testing workflow for the GarageSaaS platform. Developers must update this document when introducing new features or modifying business logic, and QA testers will use this as their primary guide for manual testing.

---

## 📋 QA Testing Workflow

### For Developers:
1. When a new feature is developed, add a new entry under the **Feature Logs & Test Cases** section.
2. Clearly explain the **Business Logic** (how it works behind the scenes).
3. Provide step-by-step **QA Test Steps**.
4. Set the status to `🟡 Pending QA`. 

### For QA / Testers:
1. Check this document for any features marked as `🟡 Pending QA`.
2. Follow the **QA Test Steps** precisely in the staging/local environment.
3. If everything works as expected, change the status to `🟢 Passed`.
4. If there are bugs, change the status to `🔴 Failed` and add notes describing the issue.

---

## 🚀 Feature Logs & Test Cases

### 📝 Template (Copy this for new features)
```markdown
### [Feature Name]
- **Date Added:** YYYY-MM-DD
- **Developer:** [Name]
- **Status:** 🟡 Pending QA / 🟢 Passed / 🔴 Failed
- **Business Logic:** 
  - Briefly explain the core logic here (e.g., "Calculates commission by taking 10% of total labor cost.").
- **QA Test Steps:**
  1. [Step 1: e.g., Login as Garage Owner]
  2. [Step 2: e.g., Go to Jobs -> Create Job]
  3. [Expected Result: e.g., The total should update automatically]
- **QA Notes:** (Leave blank for QA tester to fill out)
```

---

### [Example Entry] Line Count Refactoring (<200 lines limit)
- **Date Added:** 2026-10-01
- **Developer:** System
- **Status:** 🟢 Passed
- **Business Logic:** 
  - All large React (JSX) files were modularized into smaller partials. No file in the project should exceed 200 lines of code to maintain strict architectural standards.
- **QA Test Steps:**
  1. Navigate through all major pages (Appointments, Jobs, Suppliers, Users, Settings).
  2. Perform basic CRUD operations (Create, Edit, Delete) on modals to ensure state management was not broken during refactoring.
  3. Verify the layout and UI remain exactly as before.
- **QA Notes:** All files successfully verified under 200 lines using shell scripts. Modals function perfectly.

---

### [Example Entry] Role-Based Access Control (RBAC)
- **Date Added:** 2026-09-30
- **Developer:** System
- **Status:** 🟢 Passed
- **Business Logic:** 
  - Users have roles: `super_admin`, `garage_owner`, `garage_staff`, `vehicle_owner`.
  - `super_admin` can see all branches.
  - `garage_owner` and `garage_staff` are scoped strictly to their `garage_id`.
- **QA Test Steps:**
  1. Login as a Super Admin. Ensure you can see the Branches menu and all garages.
  2. Login as a Garage Owner. Ensure you CANNOT see the Branches menu and only see your specific garage data.
- **QA Notes:** Works as expected.

---

*Note: Future high-value features like Digital Vehicle Inspections (DVI), Parts Supplier Integrations, and Predictive Maintenance will be documented here upon implementation.*
