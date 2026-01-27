import type { UrlsTypes } from "./formMarkup";
import { UrlObjectItem } from "./addUrlsItem";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { preventClickActions } from "@/lib/utils/utils";

export type CustomFormInputs = {
  type: UrlsTypes;
  url: string;
  credits?: string;
}[];

export function AddUrlsObjects({
  urls,
  updateUrls,
  addInputs,
  removeInputs,
}: {
  urls: CustomFormInputs;
  updateUrls: (newUrl: { type: UrlsTypes; url: string; credits?: string }, index: number) => void;
  addInputs: () => void;
  removeInputs: () => void;
}) {
  return (
    <div className="flex flex-col w-full" data-testid="url-inputs-container">
      {urls?.map(({ type, url, credits }, index: number) => (
        <UrlObjectItem key={urls[index].url || `add-url-${index}`} type={type} url={url} credits={credits} index={index} addUrls={updateUrls} />
      ))}
      <div className="w-full left flex flex-row mt-6">
        <Button
          variant="outline"
          className="mr-7"
          onClick={(e) => {
            preventClickActions(e);
            addInputs();
          }}
        >
          <Plus color="white" size={24} />
        </Button>
        <Button
          variant="outline"
          onClick={(e) => {
            preventClickActions(e);
            removeInputs();
          }}
        >
          <Minus color="white" size={24} />
        </Button>
      </div>
    </div>
  );
}
