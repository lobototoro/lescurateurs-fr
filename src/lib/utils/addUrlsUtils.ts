import type { UrlsTypes } from "@/components/editor-components/formMarkup";

/* gathering of utilities fn for inputs in create article and update article
 *  it is a pseudo hook
 */
export const addRemoveInputsFactory = (
  urlsArray: Array<{ type: UrlsTypes; url: string; credits?: string }> = [],
  valueSetter: (newUrls: Array<{ type: UrlsTypes; url: string; credits?: string }>) => void,
) => {
  const initialUrls = {
    type: "website" as UrlsTypes,
    url: "",
    credits: "",
  };
  const addInputs = () => {
    const urls = urlsArray;
    valueSetter([...urls, initialUrls]);
  };
  const removeInputs = () => {
    if (urlsArray.length > 1) {
      // valueSetter('urls', JSON.stringify(urlsArray.slice(0, -1)));
      valueSetter(urlsArray.slice(0, -1));
    }
  };
  const updateUrls = (newUrl: { type: UrlsTypes; url: string; credits?: string }, index: number) => {
    const newUrls = [...urlsArray];
    newUrls[index] = newUrl;

    // valueSetter('urls', JSON.stringify(newUrls));
    valueSetter(newUrls);
  };

  return [addInputs, removeInputs, updateUrls] as const;
};
