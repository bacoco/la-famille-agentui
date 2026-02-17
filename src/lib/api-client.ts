import { APIBackend } from '@/types/backend';

export interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a non-streaming chat completion request.
 */
export async function chatCompletion(
  backend: APIBackend,
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const url = `${backend.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (backend.authToken) {
    headers['Authorization'] = `Bearer ${backend.authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), backend.timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...request, stream: false }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `Chat completion failed (${response.status}): ${errorBody || response.statusText}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Send a streaming chat completion request. Returns the raw Response so the
 * caller can pass it to parseSSEStream() for incremental consumption.
 */
export async function chatCompletionStream(
  backend: APIBackend,
  request: ChatCompletionRequest,
  signal?: AbortSignal
): Promise<Response> {
  const url = `${backend.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (backend.authToken) {
    headers['Authorization'] = `Bearer ${backend.authToken}`;
  }

  // Combine user-provided abort signal with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), backend.timeoutMs);

  // If the caller provides a signal, forward its abort to our controller
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...request, stream: true }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `Streaming chat completion failed (${response.status}): ${errorBody || response.statusText}`
      );
    }

    // Clear the timeout once we start receiving the stream -- the connection
    // is alive and the SSE consumer will handle further timeouts or aborts.
    clearTimeout(timeoutId);

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Check the health of a backend by hitting its /health endpoint.
 * The base URL is expected to end with /v1, so we strip that for the health check.
 */
export async function checkHealth(backend: APIBackend): Promise<boolean> {
  const baseWithoutVersion = backend.baseUrl.replace(/\/v1\/?$/, '');
  const url = `${baseWithoutVersion}/health`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List available models from a backend.
 */
export async function listModels(backend: APIBackend): Promise<string[]> {
  const url = `${backend.baseUrl}/models`;

  const headers: Record<string, string> = {};
  if (backend.authToken) {
    headers['Authorization'] = `Bearer ${backend.authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // OpenAI-compatible format: { data: [{ id: "model-name", ... }, ...] }
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((m: { id: string }) => m.id);
    }

    return [];
  } catch {
    return [];
  }
}
