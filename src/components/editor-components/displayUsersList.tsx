import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import type { User } from "@/routes/editor/_layout/manageuser";
import { useId } from "react";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";
import { preventClickActions } from "@/lib/utils/utils";

export const DisplayUsersList = ({
  users,
  selectedUserAction,
  setDeletedUserAction,
}: {
  users: User[];
  selectedUserAction: any;
  setDeletedUserAction: any;
}): React.ReactElement => {
  return (
    <ul id={`users-list-${useId()}`}>
      {users?.map((user, idx) => {
        return (
          <li key={`${user.id}-${idx}`}>
            <Popover>
              <PopoverTrigger asChild>
                <h2 className="cursor-pointer bg-black hover:bg-violet-600 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500 active:bg-violet-700">
                  {user.name}
                </h2>
              </PopoverTrigger>
              <PopoverContent align="start">
                <PopoverHeader>
                  <PopoverTitle>Actions</PopoverTitle>
                  <PopoverDescription className="mb-6">Choisissez une action à effectuer sur l'utilisateur sélectionné.</PopoverDescription>
                </PopoverHeader>
                <ButtonGroup orientation="horizontal">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      preventClickActions(event);
                      selectedUserAction({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        permissions: user.permissions as string[],
                      });
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      preventClickActions(event);
                      setDeletedUserAction(user.id);
                    }}
                  >
                    Delete
                  </Button>
                </ButtonGroup>
              </PopoverContent>
            </Popover>
          </li>
        );
      })}
    </ul>
  );
};
