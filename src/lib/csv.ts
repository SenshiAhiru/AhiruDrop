/**
 * Convert a header list + rows into a UTF-8 BOM CSV string that opens cleanly in Excel.
 */
export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n") || val.includes(";")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => escape(cell == null ? "" : String(cell))).join(",")
    ),
  ];

  return "\uFEFF" + lines.join("\n");
}

export function csvResponse(filename: string, body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
