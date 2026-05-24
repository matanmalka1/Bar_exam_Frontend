import { z } from "zod";

const formatZodPath = (path: PropertyKey[]): string =>
  path.length > 0 ? path.map(String).join(".") : "response";

const formatZodError = (error: z.ZodError): string =>
  error.issues
    .map((issue) => `${formatZodPath(issue.path)}: ${issue.message}`)
    .join("; ");

export const parseApiResponse = <T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string,
): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(
      `[API validation failed] ${context}: ${formatZodError(result.error)}`,
      result.error.flatten(),
    );
    throw new Error(`Invalid API response: ${context}`);
  }

  return result.data;
};
