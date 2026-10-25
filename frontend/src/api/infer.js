import { API_BASE } from "./config";

export async function askModel(question) {
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: question }),
  });

  const data = await response.json();
  return data.output;
}
