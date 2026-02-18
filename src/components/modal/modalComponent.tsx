import { ModalManager, useModal, shadcnUiDialog, shadcnUiDialogContent } from "shadcn-modal-manager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModalCompProps {
  message: string;
  articleId: string;
  choice: boolean;
  action: (id: string, choice?: boolean) => void;
}

export const ModalComponent = ModalManager.create<ModalCompProps & Record<string, unknown>>(({ message, articleId, choice, action }) => {
  console.log("modal raised ", message, articleId, choice, action);
  const modal = useModal();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    action(articleId, choice);
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
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
