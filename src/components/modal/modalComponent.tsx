import { ModalManager, useModal, shadcnUiDialog, shadcnUiDialogContent } from "shadcn-modal-manager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ChoiceMode = {
  message: string;
  articleId: string;
  choice: boolean;
  updatedUserProps?: never;
  action: (articleId: string, choice: boolean) => Promise<void>;
};

type UserPropsMode = {
  message: string;
  articleId: string;
  choice?: never;
  updatedUserProps: { id: string; name: string; email: string; role: string; permissions: string[] };
  action: (updatedUserProps: { id: string; name: string; email: string; role: string; permissions: string[] }) => Promise<void>;
};

type ModalCompProps = ChoiceMode | UserPropsMode;

export const ModalComponent = ModalManager.create<ModalCompProps & Record<string, unknown>>(
  ({ message, articleId, choice, updatedUserProps, action }) => {
    // TODO: articleId should be "id" since it is now used by both article and user managment pages
    const modal = useModal();

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (typeof action === "function") {
        try {
          if (choice !== undefined) {
            await action(articleId, choice);
          } else if (updatedUserProps) {
            await action(updatedUserProps);
          }
        } catch (error) {
          console.error("Error executing action:", error);
        }
      }
      modal.close({ saved: true });
    };

    return (
      <Dialog {...shadcnUiDialog(modal)}>
        <DialogContent {...shadcnUiDialogContent(modal)} aria-describedby="confirmation-dialog-description">
          <DialogHeader>
            <DialogTitle>Confirmez votre choix</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {/* form fields */}
            <div className="p-4 border rounded">{message}</div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={modal.dismiss}>
                Cancel
              </Button>
              <Button type="submit">Validez</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
