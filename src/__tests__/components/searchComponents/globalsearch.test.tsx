import { SlugsSearchComponent } from "@/components/searchComponents/globalsearch";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, vi, beforeEach, expect } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockSearchResults = [
  { id: 1, title: "Article 1", slug: "article-1" },
  { id: 2, title: "Article 2", slug: "article-2" },
];

const mockSlugsSearchServerfn = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-start", () => {
  const createServerFnMock = vi.fn(() => {
    const mockFn = async (...args: unknown[]) => mockSlugsSearchServerfn(...args);
    const chain = {
      inputValidator: vi.fn().mockReturnThis(),
      handler: vi.fn().mockImplementation(function(this: unknown) {
        return mockFn;
      }),
    };
    mockFn.inputValidator = chain.inputValidator;
    mockFn.handler = chain.handler;
    return mockFn;
  });
  return { createServerFn: createServerFnMock };
});

describe("SlugsSearchComponent", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("Should render the search form with correct title", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      expect(screen.getByText("Rechercher un article")).toBeInTheDocument();
    });

    it("Should render the search description", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      expect(screen.getByText("Entrez un terme de recherche")).toBeInTheDocument();
    });

    it("Should render the search input field", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("name", "searchTerm");
    });

    it("Should render the submit button", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const button = screen.getByRole("button", { name: "Rechercher" });
      expect(button).toBeInTheDocument();
    });

    it("Should render with empty initial input value", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("Should render FieldLabel for search term", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      expect(screen.getByText("Terme de recherche")).toBeInTheDocument();
    });

    it("Should render FieldSeparator", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const separator = document.querySelector('[data-slot="field-separator"]');
      expect(separator).toBeInTheDocument();
    });

    it("Should render button with ml-4 class for spacing", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const button = screen.getByRole("button", { name: "Rechercher" });
      expect(button).toHaveClass("ml-4");
    });

    it("Should render section element as container", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const section = document.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("Should render form element", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("Should render fieldset element", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const fieldset = document.querySelector("fieldset");
      expect(fieldset).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("Should update input value when user types", async () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "test search");
      expect((input as HTMLInputElement).value).toBe("test search");
    });

    it("Should allow user to clear and retype", async () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "initial");
      expect((input as HTMLInputElement).value).toBe("initial");

      await user.clear(input);
      await user.type(input, "new");
      expect((input as HTMLInputElement).value).toBe("new");
    });

    it("Should allow typing special characters", async () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "test@#$%");
      expect((input as HTMLInputElement).value).toBe("test@#$%");
    });
  });

  describe("Form Structure", () => {
    it("Should have form element", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });

    it("Should have input with id attribute", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "searchTerm");
    });

    it("Should have input with name attribute", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("name", "searchTerm");
    });

    it("Should have button with type submit", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const button = screen.getByRole("button", { name: "Rechercher" });
      expect(button).toHaveAttribute("type", "submit");
    });
  });

  describe("resetFromParent Effect", () => {
    it("Should reset form when resetFromParent is true", async () => {
      const setResetFromParent = vi.fn();

      const { rerender } = render(
        <SlugsSearchComponent
          setArticlesList={vi.fn()}
          resetFromParent={false}
          setResetFromParent={setResetFromParent}
        />
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "some text");

      rerender(
        <SlugsSearchComponent
          setArticlesList={vi.fn()}
          resetFromParent={true}
          setResetFromParent={setResetFromParent}
        />
      );

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe("");
      });

      expect(setResetFromParent).toHaveBeenCalledWith(false);
    });

    it("Should not reset form when resetFromParent is false", async () => {
      const { rerender } = render(
        <SlugsSearchComponent
          setArticlesList={vi.fn()}
          resetFromParent={false}
        />
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "some text");

      rerender(
        <SlugsSearchComponent
          setArticlesList={vi.fn()}
          resetFromParent={false}
        />
      );

      expect((input as HTMLInputElement).value).toBe("some text");
    });

    it("Should call setResetFromParent with false when resetFromParent becomes true", async () => {
      const setResetFromParent = vi.fn();

      const { rerender } = render(
        <SlugsSearchComponent
          setArticlesList={vi.fn()}
          resetFromParent={false}
          setResetFromParent={setResetFromParent}
        />
      );

      rerender(
        <SlugsSearchComponent
          setArticlesList={vi.fn()}
          resetFromParent={true}
          setResetFromParent={setResetFromParent}
        />
      );

      await waitFor(() => {
        expect(setResetFromParent).toHaveBeenCalledWith(false);
      });
    });

    it("Should not throw when setResetFromParent is undefined", () => {
      const { rerender } = render(
        <SlugsSearchComponent
          setArticlesList={vi.fn()}
          resetFromParent={false}
        />
      );

      expect(() => {
        rerender(
          <SlugsSearchComponent
            setArticlesList={vi.fn()}
            resetFromParent={true}
          />
        );
      }).not.toThrow();
    });
  });

  describe("Component Props", () => {
    it("Should accept setArticlesList prop", () => {
      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("Should work without optional props", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Rechercher" })).toBeInTheDocument();
    });

    it("Should work with all optional props provided", () => {
      render(
        <SlugsSearchComponent
          setArticlesList={vi.fn()}
          resetFromParent={false}
          setResetFromParent={vi.fn()}
        />
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("Should accept different setArticlesList implementations", () => {
      const customSetArticlesList = vi.fn((articles: unknown[]) => {
        console.log("Custom handler called with:", articles.length, "items");
      });
      render(<SlugsSearchComponent setArticlesList={customSetArticlesList} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("Should have input accessible by role", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("Should have button accessible by role and name", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const button = screen.getByRole("button", { name: "Rechercher" });
      expect(button).toBeInTheDocument();
    });

    it("Should have label associated with input", () => {
      render(<SlugsSearchComponent setArticlesList={vi.fn()} />);
      const input = screen.getByRole("textbox");
      const label = screen.getByText("Terme de recherche");
      expect(label).toHaveAttribute("for", "searchTerm");
      expect(input).toHaveAttribute("id", "searchTerm");
    });
  });

  describe("Form Submission", () => {
    it("Should submit form with search term", async () => {
      mockSlugsSearchServerfn.mockResolvedValue(mockSearchResults);

      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSlugsSearchServerfn).toHaveBeenCalledWith({ data: { searchTerm: "test" } });
      });
    });

    it("Should set articles list when results are returned", async () => {
      mockSlugsSearchServerfn.mockResolvedValue(mockSearchResults);

      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(setArticlesList).toHaveBeenCalledWith(mockSearchResults);
      });
    });

    it("Should show toast error when no results found", async () => {
      const { toast } = await import("sonner");
      mockSlugsSearchServerfn.mockResolvedValue([]);

      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "nonexistent");

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Aucun résultat trouvé pour ce terme de recherche.");
      });
    });

    it("Should set empty array when no results found", async () => {
      mockSlugsSearchServerfn.mockResolvedValue([]);

      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "nonexistent");

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(setArticlesList).toHaveBeenCalledWith([]);
      });
    });

    it("Should show toast error when search fails", async () => {
      const { toast } = await import("sonner");
      mockSlugsSearchServerfn.mockRejectedValue(new Error("Network error"));

      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Erreur lors de la recherche. Veuillez réessayer.");
      });
    });

    it("Should handle whitespace-only search term", async () => {
      const { toast } = await import("sonner");

      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "   ");

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Le terme de recherche est requis.");
      });
    });

    it("Should submit form via button click", async () => {
      mockSlugsSearchServerfn.mockResolvedValue(mockSearchResults);

      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSlugsSearchServerfn).toHaveBeenCalled();
      });
    });
  });

  describe("Server Function Validation", () => {
    it("Should validate empty search term", async () => {
      const { toast } = await import("sonner");
      mockSlugsSearchServerfn.mockResolvedValue([]);

      const setArticlesList = vi.fn();
      render(<SlugsSearchComponent setArticlesList={setArticlesList} />);

      const form = document.querySelector("form");
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Le terme de recherche est requis.");
      });
    });
  });
});
