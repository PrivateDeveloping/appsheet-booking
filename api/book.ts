// export default async function handler(req: any, res: any) {

//   if (req.method !== "POST") {
//     return res.status(405).json({ success: false, error: "Method not allowed" });
//   }

//   try {
//     const SCRIPT_URL = process.env.SCRIPT_URL!;
//     const API_SECRET = process.env.API_SECRET!;

//     const payload = {
//       ...req.body,
//       secret: API_SECRET,
//     };

//     const response = await fetch(SCRIPT_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const data = await response.json();
//     return res.status(200).json(data);
//   } catch (error) {
//     console.error("API book error:", error);
//     return res.status(500).json({ success: false, error: String(error) });
//   }
// }
// api/book.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { date, name, email } = req.body;

  if (!date || !name || !email) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  // Build the request to Google Apps Script
  const response = await fetch(process.env.SCRIPT_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "book",
      date,
      name,
      email,
      secret: process.env.API_SECRET // optional but recommended
    }),
  });

  const result = await response.json().catch(() => null);

  if (!result || result.success !== true) {
    return res.status(500).json({
      success: false,
      error: result?.error || "Failed to book date",
    });
  }

  return res.status(200).json(result);
}

