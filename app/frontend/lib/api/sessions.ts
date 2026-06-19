export type RequestType = "complaint" | "return";

export type EquipmentCategory =
  | "laptop"
  | "desktop_pc"
  | "smartphone"
  | "tablet"
  | "monitor"
  | "tv"
  | "printer"
  | "headphones"
  | "smartwatch"
  | "gaming_console"
  | "computer_accessory"
  | "other_electronics";

export type CreateSessionInput = {
  requestType: RequestType;
  equipmentCategory: EquipmentCategory;
  equipmentNameOrModel: string;
  purchaseDate: string;
  reason: string;
  image: File;
};

export type ApiFieldErrors = Partial<Record<keyof CreateSessionInput, string>>;

export type ApiErrorResponse = {
  code: string;
  messagePl: string;
  fieldErrors?: ApiFieldErrors;
  traceId?: string;
};

export type SessionResponse = {
  sessionId: string;
  requestType?: RequestType;
  status?: string;
  terminalState?: string;
  imageAttemptCount?: number;
  remainingImageAttempts?: number;
  latestDecision?: unknown;
  imageRetry?: unknown;
  messages?: unknown[];
};

type CreateSessionOptions = {
  fetcher?: typeof fetch;
  apiBaseUrl?: string;
};

export async function createSession(
  input: CreateSessionInput,
  options: CreateSessionOptions = {}
): Promise<SessionResponse> {
  const fetcher = options.fetcher ?? fetch;
  const apiBaseUrl =
    options.apiBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const formData = new FormData();

  formData.set("requestType", input.requestType);
  formData.set("equipmentCategory", input.equipmentCategory);
  formData.set("equipmentNameOrModel", input.equipmentNameOrModel);
  formData.set("purchaseDate", input.purchaseDate);
  formData.set("reason", input.reason);
  formData.set("image", input.image);

  const response = await fetcher(`${apiBaseUrl}/api/sessions`, {
    method: "POST",
    body: formData
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw normalizeApiError(body);
  }

  return body as SessionResponse;
}

function normalizeApiError(body: unknown): ApiErrorResponse {
  if (isApiErrorResponse(body)) {
    return body;
  }

  return {
    code: "INTERNAL_ERROR",
    messagePl: "Nie udało się wysłać zgłoszenia."
  };
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "messagePl" in value
  );
}
