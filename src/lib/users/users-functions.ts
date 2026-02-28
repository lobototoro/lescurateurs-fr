import { fixedDb } from "db/drizzle";
import { eq } from "drizzle-orm";

import { user } from "db/schema";
import type { CustomResponseT } from "@/lib/articles/articles-functions";
import type { UpdatedUserValues } from "@/routes/editor/_layout/manageuser";

/**
 * Module for user database operations.
 *
 * This module provides functions to manage users in the database with the following capabilities:
 * - Create a new user
 * - Update an existing user
 * - Delete an existing user
 * - Retrieve all users
 *
 * Important notes:
 * - Session, account and verification tables are not to be modified directly
 * - User creation uses signup function from drizzle & better-auth
 * - User updates only affect a restricted set of fields (name, image, updated_at, role, permissions)
 * - User deletion removes the user record from the database
 *
 * @packageDocumentation
 */

/**
 * Creates a new user in the database.
 *
 * This function inserts a new user record into the database with the provided user data.
 * It returns a standardized response object indicating success or failure.
 *
 * @param userObject - The user data to insert. Must conform to the user table schema.
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const newUser = {
 *   id: "user_123",
 *   name: "John Doe",
 *   email: "john@example.com",
 *   // ... other user properties
 * };
 * const response = await createUser(newUser);
 * if (response.isSuccess) {
 *   console.log("User created successfully");
 * }
 * ```
 */
export const createUser = async (userObject: typeof user.$inferInsert): Promise<CustomResponseT> => {
  try {
    await fixedDb.insert(user).values(userObject);

    console.log("User created successfully");

    return {
      isSuccess: true,
      status: 201,
      message: "User created successfully",
    };
  } catch (error) {
    console.error("User creation failed:", error);

    return {
      isSuccess: false,
      status: 400,
      message: "Failed to create user",
    };
  }
};

/**
 * Updates an existing user in the database.
 *
 * This function updates specific fields of a user record identified by its ID.
 * Only a restricted set of fields can be updated: name, image, updated_at, role, permissions.
 * It returns a standardized response object indicating success or failure.
 *
 * @param id - The unique identifier of the user to update.
 * @param userChanges - An object containing the fields to update and their new values.
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const userId = "user_123";
 * const updates = {
 *   name: "Jane Doe",
 *   updated_at: new Date()
 * };
 * const response = await updateUser(userId, updates);
 * if (response.isSuccess) {
 *   console.log("User updated successfully");
 * }
 * ```
 */
export const updateUser = async (userChanges: UpdatedUserValues): Promise<CustomResponseT> => {
  const { id, name, email, role, permissions } = userChanges;

  try {
    await fixedDb
      .update(user)
      .set({
        name,
        email,
        role,
        permissions,
      })
      .where(eq(user.id, id));

    console.log("User updated successfully");

    return {
      isSuccess: true,
      status: 200,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("User update failed:", error);

    return {
      isSuccess: false,
      status: 400,
      message: "Failed to update user",
    };
  }
};

/**
 * Deletes a user from the database.
 *
 * This function removes a user record from the database using the user's unique identifier.
 * It returns a standardized response object indicating success or failure.
 *
 * @param id - The unique identifier of the user to delete.
 * @returns {Promise<CustomResponseT>} A promise that resolves to a response object indicating success or failure.
 *
 * @example
 * ```typescript
 * const userId = "user_123";
 * const response = await deleteUser(userId);
 * if (response.isSuccess) {
 *   console.log("User deleted successfully");
 * }
 * ```
 */
export const deleteUser = async (id: string): Promise<CustomResponseT> => {
  try {
    await fixedDb.delete(user).where(eq(user.id, id));

    console.log("User deleted successfully");

    return {
      isSuccess: true,
      status: 200,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("User deletion failed:", error);

    return {
      isSuccess: false,
      status: 400,
      message: "Failed to delete user",
    };
  }
};

/**
 * Retrieves all users from the database.
 *
 * This function queries the database for all user records and returns them as an array.
 * In case of an error, it returns a standardized response object indicating the failure.
 *
 * @returns {Promise<(typeof user.$inferSelect)[] | CustomResponseT>} A promise that resolves to either an array of users or a response object indicating failure.
 *
 * @example
 * ```typescript
 * const result = await getAllUsers();
 * if (Array.isArray(result)) {
 *   console.log(`Found ${result.length} users`);
 * } else if (!result.isSuccess) {
 *   console.error("Failed to fetch users:", result.message);
 * }
 * ```
 */
export const getAllUsers = async (): Promise<(typeof user.$inferSelect)[] | CustomResponseT> => {
  try {
    const users = await fixedDb.select().from(user);

    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);

    return {
      isSuccess: false,
      status: 500,
      message: "Failed to fetch users",
    };
  }
};
