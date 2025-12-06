
// export default async function handler(req: any, res: any) {
//   try {
//     const SCRIPT_URL = process.env.SCRIPT_URL!;
//     const API_SECRET = process.env.API_SECRET!;

//     const url = `${SCRIPT_URL}?action=availability&secret=${API_SECRET}`;

//     const response = await fetch(url);
//     const data = await response.json();

//     return res.status(200).json(data);
//   } catch (error) {
//     console.error("API availability error:", error);
//     return res.status(500).json({ success: false, error: String(error) });
//   }
// }
export default async function handler(req: any, res: any) {
  try {
    const SCRIPT_URL = process.env.SCRIPT_URL!;
    const API_SECRET = process.env.API_SECRET!;

    const url = `${SCRIPT_URL}?action=availability&secret=${API_SECRET}`;

    const response = await fetch(url);
    const json = await response.json();

    return res.status(200).json(json);
  } catch (error) {
    console.error("API availability error:", error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
