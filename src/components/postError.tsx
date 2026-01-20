import { ErrorComponent } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

function PostError({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

export default PostError;
