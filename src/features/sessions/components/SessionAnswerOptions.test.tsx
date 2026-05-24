// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import SessionAnswerOptions from "./SessionAnswerOptions";
import type { AnswerOption, SessionQuestion } from "../types";

const question: SessionQuestion = {
  position: 1,
  stable_id: "2025-04_B_001",
  number: 1,
  body: "גוף שאלה",
  options: {
    א: "אפשרות ראשונה",
    ב: "אפשרות שניה",
    ג: "אפשרות שלישית",
    ד: "אפשרות רביעית",
  },
  status: "active",
  reference: null,
  correct_answer: null,
  answer: null,
};

afterEach(() => {
  cleanup();
});

describe("SessionAnswerOptions", () => {
  test("allows eliminating an answer without selecting it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <SessionAnswerOptions
        question={question}
        mode="practice"
        disabled={false}
        displaySelected={null}
        answerSubmitted={false}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "פסול תשובה ב" }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText("אפשרות שניה")).toHaveClass("line-through");
  });

  test("selecting an eliminated answer removes the strike", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <SessionAnswerOptions
        question={question}
        mode="exam"
        disabled={false}
        displaySelected={null}
        answerSubmitted={false}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "פסול תשובה ג" }));
    expect(screen.getByText("אפשרות שלישית")).toHaveClass("line-through");

    await user.click(
      screen.getByRole("button", { name: /אפשרות שלישית/ }),
    );

    expect(onSelect).toHaveBeenCalledWith("ג");
    expect(screen.getByText("אפשרות שלישית")).not.toHaveClass("line-through");
  });

  test("clicking the selected answer again clears the selected marking", async () => {
    const user = userEvent.setup();

    const SelectionHarness = () => {
      const [selected, setSelected] = useState<AnswerOption | null>(null);

      return (
        <SessionAnswerOptions
          question={question}
          mode="practice"
          disabled={false}
          displaySelected={selected}
          answerSubmitted={false}
          onSelect={(option) =>
            setSelected((current) => (current === option ? null : option))
          }
        />
      );
    };

    render(<SelectionHarness />);

    const option = screen.getByRole("button", { name: /אפשרות ראשונה/ });

    await user.click(option);
    expect(option).toHaveAttribute("aria-pressed", "true");

    await user.click(option);
    expect(option).toHaveAttribute("aria-pressed", "false");
    expect(option).not.toHaveClass("surface-muted");
    expect(option).not.toHaveClass("border-strong");
    expect(option).not.toHaveFocus();
  });
});
