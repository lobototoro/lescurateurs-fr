/**
 * # Editor Layout Route Component
 *
 * ## Overview
 *
 * The `RouteComponent` located in this file serves as the main layout wrapper for all editor routes within the application.
 * It provides authentication protection, session management, and a navigation menu based on user permissions.
 *
 * ## Component
 *
 * ### `RouteComponent`
 *
 * The main layout component for the editor section of the application.
 *
 * **Location:** `src/routes/editor/_layout.tsx`
 *
 * **Features:**
 * - Authentication middleware integration
 * - Session management via `authClient`
 * - Dynamic navigation menu based on user role and permissions
 * - Logout functionality
 * - Nested route rendering via `<Outlet />`
 *
 * ## Props
 *
 * This component does not accept any props directly. It derives all necessary data from:
 * - `authClient.useSession()` - User session data
 * - `useNavigate()` - Navigation function from TanStack Router
 *
 * ## State & Data
 *
 * ### Session Data
 *
 * The component accesses session data through `authClient.useSession()`:
 *
 * ```typescript
 * const { data: session } = authClient.useSession();
 * ```
 *
 * **Session Structure:**
 * ```typescript
 * interface Session {
 *   user: {
 *     role: string;           // User role ("admin" | "contributor")
 *     permissions: string[];  // Array of permission strings
 *     // ... other user properties
 *   };
 *   // ... other session properties
 * }
 * ```
 *
 * ## Methods
 *
 * ### `logout`
 *
 * Asynchronous function that handles user logout and redirects to the home page.
 *
 * **Signature:**
 * ```typescript
 * const logout = async (): Promise<void>
 * ```
 *
 * **Behavior:**
 * 1. Calls `authClient.signOut()`
 * 2. On success, navigates to `/` with `replace: true`
 *
 * ## Header Menu Component
 *
 * ### `HeaderMenu`
 *
 * A navigation component that dynamically renders menu items based on user permissions.
 *
 * **Location:** `src/components/editor-components/headerMenu.tsx`
 *
 * ### Props
 *
 * | Prop | Type | Description |
 * |------|------|-------------|
 * | `role` | `string` | User role ("admin" or "contributor") |
 * | `permissions` | `string[]` | Array of user permissions |
 * | `logoutAction` | `() => void` | Callback function for logout action |
 *
 * ### Permission Processing Logic
 *
 * The menu items are generated through a multi-step filtering process:
 *
 * #### Step 1: Filter Permissions by Role
 *
 * **For Admin Role:**
 * - Filters out: update:user, delete:user, delete:articles, validate:articles, ship:articles
 *
 * **For Contributor Role:**
 * - Uses all permissions without filtering
 *
 * #### Step 2: Transform Permissions for Menu Display
 *
 * **For Admin Role:**
 * - Replaces 4th item with "manage:articles"
 * - Adds "manage:user" at the end
 *
 * **For Contributor Role:**
 * - Replaces 4th item with "manage:articles"
 *
 * #### Step 3: Map Permissions to Menu Items
 *
 * Each permission is transformed into a navigation button:
 * - Splits permission by ":" to get action and resource
 * - Creates route path: `/editor/${action}${resource}`
 * - Displays icon via `iconMapper(permission)`
 *
 * ## Menu Items by Role
 *
 * ### Admin Role Menu
 *
 * | Permission | Menu Item | Route |
 * |------------|-----------|-------|
 * | `read:articles` | Hidden | - |
 * | `create:articles` | Createarticles | `/editor/createarticles` |
 * | `update:articles` | Updatearticles | `/editor/updatearticles` |
 * | `manage:articles` | Managearticles | `/editor/managearticles` |
 * | `manage:user` | Manageuser | `/editor/manageuser` |
 *
 * **Resulting Menu:**
 * ```
 * [Createarticles] [Updatearticles] [Managearticles] [Manageuser]
 * ```
 *
 * ### Contributor Role Menu
 *
 * | Permission | Menu Item | Route |
 * |------------|-----------|-------|
 * | `read:articles` | Hidden | - |
 * | `create:articles` | Createarticles | `/editor/createarticles` |
 * | `update:articles` | Updatearticles | `/editor/updatearticles` |
 * | `manage:articles` | Managearticles | `/editor/managearticles` |
 *
 * **Resulting Menu:**
 * ```
 * [Createarticles] [Updatearticles] [Managearticles]
 * ```
 *
 * ## Navigation Flow
 *
 * ### Menu Item Click Handler
 *
 * When a user clicks a menu item:
 * 1. **Trigger:** Button `onClick` event
 * 2. **Action:** Navigate to corresponding route
 * 3. **Parameters:** `{ to: "/editor/${transformedPermission}", replace: true }`
 *
 * ### Logout Flow
 *
 * 1. **Trigger:** Logout button click
 * 2. **Action:** Call `logout()` function
 * 3. **Process:** Sign out from auth session, navigate to `/`
 *
 * ## Route Configuration
 *
 * ```typescript
 * export const Route = createFileRoute("/editor/_layout")({
 *   component: RouteComponent,
 *   server: {
 *     middleware: [authMiddleware],  // Authentication required
 *   },
 * });
 * ```
 *
 * **Middleware:** All routes under `/editor/*` are protected by `authMiddleware`.
 *
 * ## Notes
 *
 * - **Permission Filtering:** The `read:articles` permission is intentionally hidden from the menu
 * - **Role-Based Display:** Admin users see additional menu items (manage:user)
 * - **Icon Mapping:** Each menu item displays an icon via the `iconMapper` utility
 * - **Session Guard:** The entire editor section is protected by authentication middleware
 */

import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import HeaderMenu from "@/components/editor-components/headerMenu";
// import { Button } from "@/components/ui/button";

import { authClient } from "lib/auth/auth-client";
import { authMiddleware } from "lib/auth/middleware";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/editor/_layout")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const logout = async () =>
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({
            to: "/",
            replace: true,
          });
        },
      },
    });

  return (
    <div className="w-3/4 m-auto">
      {session && (
        <section className="w-full h-full m-auto">
          <h1 className="text-4xl font-bold font-titles text-center w-full mt-4 mb-4">Les Curateurs: editor</h1>
          <div className="m-auto w-3/4">
            <Separator className="my-4" />
          </div>
          <HeaderMenu role={(session.user as any)?.role || ""} permissions={(session.user as any)?.permissions} logoutAction={logout} />
          <div className="m-auto w-3/4">
            <Separator className="my-4" />
          </div>
          <Outlet />
        </section>
      )}
    </div>
  );
}
