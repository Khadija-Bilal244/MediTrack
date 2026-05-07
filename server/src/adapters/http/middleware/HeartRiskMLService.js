/**
 * HeartRiskMLService
 *
 * Secondary adapter — calls the Python Flask microservice that loads
 * heart_model.pkl and scaler.pkl.
 *
 * Used by PredictHeartRiskUseCase so the domain layer never touches
 * HTTP directly.
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

export class HeartRiskMLService {
  async predict(inputs) {
    let response;
    try {
      response = await fetch(`${ML_SERVICE_URL}/predict`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(inputs),
      });
    } catch (networkErr) {
      throw new Error(
        "Heart risk ML service is unreachable. " +
        "Ensure the Python microservice is running. " +
        `(${networkErr.message})`
      );
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ML service returned ${response.status}: ${body}`);
    }

    const data = await response.json();

    if (data.error) throw new Error(`ML service error: ${data.error}`);

    return {
      risk:        data.risk,          // 0 | 1
      label:       data.label,         // "Low Risk" | "High Risk"
      probability: data.probability ?? null,
    };
  }
}
