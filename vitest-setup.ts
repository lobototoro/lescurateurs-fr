/// <reference types="vitest" />
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

vi.mock("next/font/google", () => ({
  Alegreya: () => ({
    style: {
      fontFamily: "mocked",
    },
  }),
  Raleway: () => ({
    style: {
      fontFamily: "mocked",
    },
  }),
}));

// keeping the next line as an example
// vi.stubEnv('NEXT_DATABASE_NAME', 'test_db');

afterEach(() => {
  cleanup();
});
