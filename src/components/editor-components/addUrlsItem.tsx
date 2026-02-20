import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { UrlsTypes } from "./formMarkup";
import { preventClickActions } from "@/lib/utils/utils";

export function UrlObjectItem({
  type,
  url,
  credits,
  index,
  addUrls,
}: {
  type?: UrlsTypes;
  url?: string;
  credits?: string;
  urls?: { type: UrlsTypes; url: string; credits?: string }[];
  index: number;
  addUrls?: (newUrl: { type: UrlsTypes; url: string; credits?: string }, index: number) => void;
}) {
  const [selectedValue, setSelectedValue] = React.useState<UrlsTypes>(type || UrlsTypes.WEBSITE);
  const [givenUrl, setGivenUrl] = React.useState<string>(url || "");
  const [givenCredits, setGivenCredits] = React.useState<string>(credits || "");
  const [toBeUpdated, setToBeUpdated] = React.useState<boolean>(false);

  return (
    <div className="flex flex-row w-full mb-6">
      <div className="flex flex-col w-1/4">
        <label htmlFor={`type-${index}`} className="text-sm font-light mb-4">
          Selectionnez un type
        </label>
        <div className="select">
          <Select
            data-testid="select-type"
            name={`type-${index}`}
            value={selectedValue || UrlsTypes.WEBSITE}
            onValueChange={(value: string) => {
              setToBeUpdated(true);
              setSelectedValue(value as UrlsTypes);
            }}
          >
            <SelectTrigger className="w-3/4">
              <SelectValue placeholder="Selectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Types</SelectLabel>
                <SelectItem value={UrlsTypes.WEBSITE}>website</SelectItem>
                <SelectItem value={UrlsTypes.VIDEOS}>videos</SelectItem>
                <SelectItem value={UrlsTypes.AUDIO}>audio</SelectItem>
                <SelectItem value={UrlsTypes.SOCIAL}>sociaux</SelectItem>
                <SelectItem value={UrlsTypes.IMAGE}>image</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col w-1/4 mr-4">
        <label className="mb-4 text-sm font-light" htmlFor={`url-${index}`}>
          url
        </label>
        <Input
          name={`url-${index}`}
          id={`url-${index}`}
          value={givenUrl || ""}
          onChange={(e) => {
            setToBeUpdated(true);
            setGivenUrl(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col w-1/4">
        <label className="mb-4 text-sm font-light" htmlFor={`credits-${index}`}>
          crédits
        </label>
        <Input
          name={`credits-${index}`}
          id={`credits-${index}`}
          value={givenCredits || ""}
          onChange={(e) => {
            setToBeUpdated(true);
            setGivenCredits(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col w-1/4 center items-center justify-end">
        <Button
          variant={toBeUpdated ? "destructive" : "outline"}
          className="w-1/2 text-sm font-light"
          onClick={(e) => {
            preventClickActions(e);
            setToBeUpdated(false);
            addUrls?.(
              {
                type: selectedValue,
                url: givenUrl,
                credits: givenCredits,
              },
              index,
            );
          }}
        >
          Ajoutez
        </Button>
      </div>
    </div>
  );
}
