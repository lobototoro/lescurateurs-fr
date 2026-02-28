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
          <li
            key={`${user.id}-${idx}`}
            className="cursor-pointer  bg-black hover:bg-gray-700 focus:outline-4 focus:outline-offset-4 focus:outline-bg-gray-700 active:bg-bg-gray-300 p-2"
          >
            <Popover>
              <PopoverTrigger asChild>
                <span className="text-white">{user.name}</span>
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
