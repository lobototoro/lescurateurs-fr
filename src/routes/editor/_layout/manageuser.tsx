import { deleteUser, getAllUsers, updateUser } from "@/lib/users/users-functions";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "motion/react";

import type { user } from "db/schema";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { UpdateMarkupForm } from "@/components/editor-components/updateMarkupForm";
import { FieldSeparator } from "@/components/ui/field";
import { ModalManager } from "shadcn-modal-manager";
import { ModalComponent } from "@/components/modal/modalComponent";
import { toast } from "sonner";
import { DisplayUsersList } from "@/components/editor-components/displayUsersList";
import { box } from "@/routes/editor/_layout/updatearticles";
import { Button } from "@/components/ui/button";
import { preventClickActions } from "@/lib/utils/utils";

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
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const getUsersList = useCallback(async () => {
    const userslist = await getUsersListServer();
    if (userslist.length > 0) {
      setUsersList(userslist);
    }
  }, []);

  const handleDeleteResult = useCallback(
    async (func: any, userId: string): Promise<void> => {
      try {
        const actionResponse = await func({ data: { id: userId } });
        if (actionResponse.isSuccess) {
          toast.success("Utilisateur effacé !");
          setIsVisible(true);
          getUsersList();
        }
      } catch (error) {
        console.error("Deleting user failed", error);
        toast.error("Echec de l'effacement");
      }
    },
    [getUsersList],
  );

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

  const handleUpdateResult = useCallback(
    async (func: any, updates: UpdatedUserValues): Promise<void> => {
      try {
        const actionResponse = await func({ data: updates });
        if (actionResponse.isSuccess) {
          toast.success("Update de l'utilisateur réussié !");
          setSelectedUser(null);
          setIsVisible(true);
          getUsersList();
        }
      } catch (error) {
        console.error("Update de l'utilisateur a échouée", error);
        toast.error("Update de l'utilisateur a échouée");
      }
    },
    [getUsersList],
  );

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

  useEffect(() => {
    const startAction = async () => {
      await getUsersList();
    };

    startAction();
  }, [getUsersList]);

  useEffect(() => {
    if (selectedUser) {
      setIsVisible(false);
    }
    if (toBeDeleted) {
      setIsVisible(false);
      handleDeleteUser(toBeDeleted);
    }
  }, [selectedUser, toBeDeleted, handleDeleteUser]);

  return (
    <section className="w-3/4 mx-auto">
      <AnimatePresence initial={false}>
        {isVisible ? (
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} style={box} key="box">
            <Suspense fallback={<Spinner />}>
              <DisplayUsersList users={usersList} selectedUserAction={setSelectedUser} setDeletedUserAction={setToBeDeleted} />
            </Suspense>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <FieldSeparator className="mt-2 mb-4" />
      {selectedUser && (
        <div className="w-full flex flex-col">
          <UpdateMarkupForm user={selectedUser} onSubmit={handleUpdateUser} />
          <Button
            onClick={(e) => {
              preventClickActions(e);
              setSelectedUser(null);
              setIsVisible(true);
            }}
            className="mt-6 self-start w-1/4"
          >
            Retour à la liste
          </Button>
        </div>
      )}
    </section>
  );
}
