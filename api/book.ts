export default async function handler(req: any, res: any) {

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const SCRIPT_URL = process.env.SCRIPT_URL!;
    const API_SECRET = process.env.API_SECRET!;

    const payload = {
      ...req.body,
      secret: API_SECRET,
    };

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("API book error:", error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
