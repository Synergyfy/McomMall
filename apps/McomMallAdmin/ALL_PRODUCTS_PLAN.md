# All Products Page: Achievement Plan

## 1. Overview & Strategy

**Goal:** Create a new "All Products" page in the admin dashboard to display all products from all businesses on the platform.

**Strategy:** We will follow the established pattern of creating a dedicated service hook, defining accurate TypeScript types based on the provided JSON response, and building a new page component to display the data in a table. This will be added to the main admin navigation.

---

## 2. Phase 1: Create Data Fetching Layer

**Goal:** Implement the necessary service hook and type definitions to fetch product data from the backend.

1.  **Locate Service Files:**
    *   **Action:** Identify the directory for product-related services.
    *   **Likely Path:** `/home/user/McomMallAdmin/service/store/products/`

2.  **Define Product Types:**
    *   **File to Create/Modify:** `/home/user/McomMallAdmin/service/store/products/types.ts`
    *   **Action:** Analyze `response/product.json` and create a new set of interfaces (`AdminProduct`, `ProductBusiness`) that accurately represent the data structure, including the nested `business` object.

3.  **Create `useGetAllProducts` Hook:**
    *   **File to Create/Modify:** `/home/user/McomMallAdmin/service/store/products/hook.ts`
    *   **Action:** Create a new `getAllProducts` async function that performs a GET request to the `admin/products` endpoint. Wrap this in a `useGetAllProducts` React Query hook.

---

## 3. Phase 2: Build the UI Page

**Goal:** Create a new page component to display the fetched product data.

1.  **Create Page File:**
    *   **File to Create:** `/home/user/McomMallAdmin/app/admin/all-products/page.tsx`
    *   **Action:** Create a new page component that will serve as the main view for all products.

2.  **Implement Table View:**
    *   **Action:** Inside the new page component, use the `useGetAllProducts` hook to fetch the data.
    *   Render the data in a `Table` component, similar to the `All-Services` and `All-Orders` pages.
    *   **Columns to include:** Image, Product Name, Business Name, Price, Status, SKU.

3.  **Handle Loading and Error States:**
    *   **Action:** Implement UI states to show a loading indicator while data is being fetched and display a clear error message if the API call fails.

---

## 4. Phase 3: Navigation

**Goal:** Make the new page accessible from the admin dashboard navigation.

1.  **Update Menu Items:**
    *   **File to Modify:** `/home/user/McomMallAdmin/lib/menu-items.ts`
    *   **Action:** Add a new entry to the `adminMenuItems` array for "All Products", linking to the `/admin/all-products` route and using an appropriate icon like `ShoppingBag`.

---

## 5. Phase 4: Verification

**Goal:** Ensure the new page works correctly.

1.  **Manual Test:**
    *   **Action:** Navigate to the "All Products" page in the admin dashboard.
    *   **Expected Result:** The page should load, and the table should correctly display the product data fetched from the `admin/products` endpoint.
