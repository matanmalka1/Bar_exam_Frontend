import axios from "axios";
import { describe, expect, test } from "vitest";
import { extractApiError } from "./api-errors";

const make422 = (detail: string) =>
  Object.assign(new axios.AxiosError("unprocessable"), {
    response: {
      status: 422,
      data: {
        error: {
          code: "unprocessable_entity",
          message: detail,
          details: { detail },
        },
      },
    },
  });

describe("extractApiError — 422 mappings", () => {
  test('"no active mistakes" maps to Hebrew', () => {
    const err = make422("no active mistakes to practice");
    expect(extractApiError(err)).toBe("אין טעויות פעילות לתרגול");
  });

  test('"no bookmarked questions" maps to Hebrew', () => {
    const err = make422("no bookmarked questions to practice");
    expect(extractApiError(err)).toBe("אין סימניות לתרגול");
  });

  test('"insufficient" maps to generic insufficient message', () => {
    const err = make422("insufficient part B questions for exam");
    expect(extractApiError(err)).toBe("אין מספיק שאלות זמינות לצירוף הזה");
  });

  test('"exceed" maps to count-exceeds message', () => {
    const err = make422("question_count exceeds available question pool");
    expect(extractApiError(err)).toBe("אין מספיק שאלות לכמות שבחרת");
  });
});
