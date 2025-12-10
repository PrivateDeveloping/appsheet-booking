const SHEET_NAME = 'Bookings';
const API_SECRET = 'a1b3c5d7e9f01234567890fedcba9876';

function doGet(e) {
  // 🔐 Authorization check
  if (!e.parameter.secret || e.parameter.secret !== API_SECRET) {
    return jsonResponse({ success: false, error: "Unauthorized" });
  }

  const action = e.parameter.action;

  if (action === 'availability') {
    return getAvailability();
  }

  return jsonResponse({ success: false, error: "Invalid action" });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 🔐 Authorization check
    if (!data.secret || data.secret !== API_SECRET) {
      return jsonResponse({ success: false, error: "Unauthorized" });
    }

    if (data.action === "book") {
      const result = bookDate(data);
      return jsonResponse({ success: result.success, data: { booking: result.booking }, error: result.error });
    }

    return jsonResponse({ success: false, error: "Invalid action" });

  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function getAvailability() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  const dates = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    dates.push({
      date: Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      status: row[1] || 'available',
      bookedBy: row[2] || null,
      email: row[3] || null,
      bookedAt: row[4] || null,
    });
  }

  return jsonResponse({ success: true, data: { dates } });
}

// function bookDate(data) {
//   const { date, name, email } = data;

//   if (!date || !name || !email) {
//     return { success: false, error: "Missing fields" };
//   }

//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
//   const rows = sheet.getDataRange().getValues();

//   let rowIndex = -1;

//   for (let i = 1; i < rows.length; i++) {
//     const sheetDate = Utilities.formatDate(rows[i][0], Session.getScriptTimeZone(), "yyyy-MM-dd");

//     if (sheetDate === date) {
//       rowIndex = i + 1;

//       if (rows[i][1] === "booked") {
//         return { success: false, error: "This date is already booked" };
//       }

//       break;
//     }
//   }

//   if (rowIndex === -1) {
//     return { success: false, error: "Date not found" };
//   }

//   const timestamp = new Date().toISOString();

//   sheet.getRange(rowIndex, 2).setValue("booked");
//   sheet.getRange(rowIndex, 3).setValue(name);
//   sheet.getRange(rowIndex, 4).setValue(email);
//   sheet.getRange(rowIndex, 5).setValue(timestamp);

//   return {
//     success: true,
//     booking: { date, status: "booked", bookedBy: name }
//   };
// }
function bookDate(data) {
  const { date, name, phone, email } = data;

  // ➜ Phone is now required, email is optional
  if (!date || !name || !phone) {
    return { success: false, error: "Missing required fields (date, name, phone)" };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Bookings");
  const rows = sheet.getDataRange().getValues();

  let firstEmptyRow: number | null = null;
  let bookedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const [rowDate, slot, rowName] = rows[i];

    if (rowDate === date) {
      const isBooked = rowName && rowName.toString().trim().length > 0;

      if (isBooked) {
        bookedCount++;
      } else if (!firstEmptyRow) {
        firstEmptyRow = i + 1; // Sheet is 1-indexed
      }
    }
  }

  if (bookedCount >= 5) {
    return { success: false, error: "This date is fully booked" };
  }

  if (!firstEmptyRow) {
    return { success: false, error: "No empty slot found for this date" };
  }

  const timestamp = new Date().toISOString();

  // Columns: Date | Slot | Name | Phone | Email | BookedAt
  sheet.getRange(firstEmptyRow, 3).setValue(name);
  sheet.getRange(firstEmptyRow, 4).setValue(phone);
  sheet.getRange(firstEmptyRow, 5).setValue(email || "");
  sheet.getRange(firstEmptyRow, 6).setValue(timestamp);

  return {
    success: true,
    booking: {
      date,
      slot: bookedCount + 1,
      name,
      phone,
      email: email || null,
    }
  };
}


function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function initializeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Clear sheet
  sheet.clear();

  // Header row
  sheet.appendRow(["Date", "Status", "BookedBy", "Email", "BookedAt"]);

  // Get current date
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth(); // 0 = January

  // Generate 3 full months
  for (let m = 0; m < 3; m++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
      sheet.appendRow([dateStr, "available", "", "", ""]);
    }

    // Move to next month
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  // ✨ Format the sheet to look professional
  formatSheet(sheet);
}
function formatSheet(sheet) {
  const HEADER_BG = "#1E3A5F";
  const HEADER_TEXT = "#FFFFFF";
  const ALT_ROW = "#F7F9FB";
  const WHITE = "#FFFFFF";
  const BOOKED_BG = "#FFE5E5";
  const BOOKED_TEXT = "#B00020";
  
  const DATE_FORMAT = "yyyy-MM-dd";

  const range = sheet.getDataRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();

  if (numRows === 0) return;

  //
  // 1️⃣ FIRST: Format HEADER (height, padding, color)
  //
  const header = sheet.getRange(1, 1, 1, numCols);
  header.setFontWeight("bold");
  header.setFontColor(HEADER_TEXT);
  header.setBackground(HEADER_BG);
  header.setHorizontalAlignment("center");
  sheet.setRowHeight(1, 32); // Taller header
  header.setBorder(false, false, true, false, false, false, HEADER_BG, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  //
  // 2️⃣ ZEBRA STRIPING (on raw values BEFORE resizing)
  //
  const body = sheet.getRange(2, 1, numRows - 1, numCols);
  const backgrounds = [];

  for (let r = 2; r <= numRows; r++) {
    backgrounds.push(
      (r % 2 === 0) ? Array(numCols).fill(ALT_ROW) : Array(numCols).fill(WHITE)
    );
  }

  body.setBackgrounds(backgrounds);

  //
  // 3️⃣ BOOKED highlighting
  //
  const values = body.getValues();
  const updatedBG = body.getBackgrounds();
  const updatedFont = [];

  for (let i = 0; i < values.length; i++) {
    const status = values[i][1]; // Column B

    if (status === "booked") {
      updatedBG[i] = Array(numCols).fill(BOOKED_BG);
      updatedFont.push(Array(numCols).fill(BOOKED_TEXT));
    } else {
      updatedFont.push(Array(numCols).fill("#000000"));
    }
  }

  body.setBackgrounds(updatedBG);
  body.setFontColors(updatedFont);

  //
  // 4️⃣ COLUMN WIDTH OPTIMIZATION (BIG FIX)
  //
  sheet.setColumnWidth(1, 120);  // Date
  sheet.setColumnWidth(2, 110);  // Status
  sheet.setColumnWidth(3, 180);  // BookedBy
  sheet.setColumnWidth(4, 230);  // Email (important!)
  sheet.setColumnWidth(5, 200);  // BookedAt

  //
  // 5️⃣ ALIGNMENTS + FORMATS
  //
  sheet.getRange(2, 1, numRows - 1, 1).setHorizontalAlignment("center"); // Dates centered
  sheet.getRange(2, 1, numRows - 1, 1).setNumberFormat(DATE_FORMAT);

  sheet.getRange(2, 2, numRows - 1, 1).setHorizontalAlignment("center"); // Status centered & bold
  sheet.getRange(2, 2, numRows - 1, 1).setFontWeight("bold");

  sheet.setFrozenRows(1); // Freeze header
}
