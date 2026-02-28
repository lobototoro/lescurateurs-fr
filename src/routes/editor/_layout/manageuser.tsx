import { deleteUser, getAllUsers, updateUser } from "@/lib/users/users-functions";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import type { user } from "db/schema";

import { Suspense, useCallback, useEffect, useId, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { UpdateMarkupForm } from "@/components/editor-components/updateMarkupForm";
import { FieldSeparator } from "@/components/ui/field";
import { ModalManager } from "shadcn-modal-manager";
import { ModalComponent } from "@/components/modal/modalComponent";
import { toast } from "sonner";
import { DisplayUsersList } from "@/components/editor-components/displayUsersList";

export type User = typeof user.$inferSelect;
export type UpdatedUserValues = {
  name: string;
  id: string;
  email: string;
  permissions: string[];
  role: "admin" | "contributor";
};

export const Route = createFileRoute("/editor/_layout/manageuser")({
  component: RouteComponent,
});

export const getUsersListServer = createServerFn<"GET", User[]>({
  method: "GET",
}).handler(async (): Promise<User[]> => {
  return (await getAllUsers()) as User[];
});

export const updateUserServer = createServerFn({
  method: "POST",
})
  .inputValidator((data: UpdatedUserValues) => data)
  .handler(async ({ data }) => {
    return await updateUser(data);
  });

export const deleteUserServer = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    console.log("in delete user server ", data.id);
    return await deleteUser(data.id);
  });

function RouteComponent() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UpdatedUserValues | null>(null);
  const [toBeDeleted, setToBeDeleted] = useState<string | null>(null);

  const handleDeleteResult = useCallback(async (func: any, userId: string): Promise<void> => {
    try {
      const actionResponse = await func({ data: { id: userId } });
      if (actionResponse.isSuccess) {
        toast.success("Utilisateur effacé !");
      }
    } catch (error) {
      console.error("Deleting user failed", error);
      toast.error("Echec de l'effacement");
    }
  }, []);

  const handleDeleteUser = useCallback(
    async (id: string): Promise<void> => {
      const modalRef = ModalManager.open(ModalComponent, {
        data: {
          message: "Etes-vous sûr de vouloir effacer cet utilisateur ?",
          articleId: null,
          updatedUserProps: id,
          action: async (userId: string) => {
            await handleDeleteResult(deleteUserServer, userId);
          },
        },
      });
      await modalRef.afterClosed();
    },
    [handleDeleteResult],
  );

  const handleUpdateResult = useCallback(async (func: any, updates: UpdatedUserValues): Promise<void> => {
    try {
      const actionResponse = await func({ data: updates });
      if (actionResponse.isSuccess) {
        toast.success("Update de l'utilisateur réussié !");
      }
    } catch (error) {
      console.error("Update de l'utilisateur a échouée", error);
      toast.error("Update de l'utilisateur a échouée");
    }
  }, []);

  const handleUpdateUser = useCallback(
    async (updatedUser: UpdatedUserValues): Promise<void> => {
      const modalRef = ModalManager.open(ModalComponent, {
        data: {
          message: "Etes-vous sûr de vouloir soumettre ces changements ?",
          articleId: null,
          updatedUserProps: updatedUser,
          action: async (updatedUserProps: UpdatedUserValues) => {
            await handleUpdateResult(updateUserServer, updatedUserProps);
          },
        },
      });
      await modalRef.afterClosed();
    },
    [handleUpdateResult],
  );

  const getUsersList = useCallback(async () => {
    const userslist = await getUsersListServer();
    if (userslist.length > 0) {
      setUsersList(userslist);
    }
  }, []);

  useEffect(() => {
    const startAction = async () => {
      await getUsersList();
    };

    startAction();
  }, [getUsersList]);

  useEffect(() => {
    if (toBeDeleted) {
      handleDeleteUser(toBeDeleted);
    }
  }, [toBeDeleted, handleDeleteUser]);

  return (
    <section className="w-3/4 mx-auto">
      <Suspense fallback={<Spinner />}>
        <DisplayUsersList users={usersList} selectedUserAction={setSelectedUser} setDeletedUserAction={setToBeDeleted} />
      </Suspense>
      <FieldSeparator className="mt-2 mb-4" />
      {selectedUser && <UpdateMarkupForm user={selectedUser} onSubmit={handleUpdateUser} />}
    </section>
  );
}
