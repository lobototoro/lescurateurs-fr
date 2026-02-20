import { ClientOnly } from "@tanstack/react-router";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./rte.css";

export default function RTE(props: { "field-id": string; className?: string; "data-testid": string; value: any; onChange: (value: any) => void }) {
  return (
    <ClientOnly>
      <ReactQuill id={props["field-id"]} theme="snow" value={props.value} onChange={props.onChange}>
        <div className={`custom-text-area ${props.className}`} data-testid={props["data-testid"]} />
      </ReactQuill>
    </ClientOnly>
  );
}
