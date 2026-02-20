import type React from "react";
import { PenLine, SquarePen, FolderCog, UserRoundPlus, UserCog, WifiOff, Ban } from "lucide-react";

/* hardcoded names of icon, chosen arbitrarily */
export const iconMapper = (permissionLabel: string): React.ReactElement => {
  switch (permissionLabel) {
    case "create:articles":
      return <PenLine color="white" size={18} />;
    case "update:articles":
      return <SquarePen color="white" size={18} />;
    case "manage:articles":
      return <FolderCog color="white" size={18} />;
    case "create:user":
      return <UserRoundPlus color="white" size={18} />;
    case "manage:user":
      return <UserCog color="white" size={18} />;
    case "enable:maintenance":
      return <WifiOff color="white" size={18} />;
    default:
      return <Ban color="white" size={18} />; // Default icon
  }
};
