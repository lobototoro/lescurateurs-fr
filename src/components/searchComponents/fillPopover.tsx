import { JSX } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { preventClickActions } from "@/lib/utils/utils";

/*
 * This component is used to display the group of buttons in the popover when clicking on an article in the pagination.
 * It receives the article data and the function to handle the actions of the buttons as props.
 * The buttons are:
 * - Valider / Dé-valider: to validate or invalidate an article
 * - Déployer / Mettre offline: to deploy or take offline an article
 * - Supprimer / Restaurer: to delete or restore an article (if the article is already marked for deletion, it will show "Restaurer" instead of "Supprimer")
 */
export const FillPopover = ({
  articleData,
  handleGroupButtonsActions,
}: {
  articleData: any;
  handleGroupButtonsActions: (articleId: string, actionType: string) => void;
}): JSX.Element => {
  const id = articleData?.id;

  const validationLabel = articleData?.validated ? "Dé-valider" : "Valider";
  const shipLabel = articleData?.shipped ? "Mettre offline" : "Déployer";
  const deleteLabel = articleData?.id.search(/^markfordeletion\|/) !== -1 ? "Restaurer" : "Supprimer";

  return (
    <ButtonGroup orientation="horizontal">
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          preventClickActions(event);
          handleGroupButtonsActions(id, validationLabel);
        }}
      >
        {validationLabel}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          preventClickActions(event);
          handleGroupButtonsActions(id, shipLabel);
        }}
      >
        {shipLabel}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          preventClickActions(event);
          handleGroupButtonsActions(id, deleteLabel);
        }}
      >
        {deleteLabel}
      </Button>
    </ButtonGroup>
  );
};
