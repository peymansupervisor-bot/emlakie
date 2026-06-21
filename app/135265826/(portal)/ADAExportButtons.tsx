'use client';

interface Violation {
  id: string;
  impact: string | null;
  description: string;
  helpUrl: string;
  nodes: number;
}

interface PageRecord {
  run_id: string;
  page_path: string;
  violation_count: number;
  critical_count: number;
  serious_count: number;
  passes: number;
  incomplete: number;
  violations: Violation[];
  axe_version: string;
  scanned_at: string;
}

export default function ADAExportButtons({ records }: { records: PageRecord[] }) {
  function downloadCSV() {
    const rows: string[][] = [
      ['Scanned At (PT)', 'Run ID', 'Page', 'Violation ID', 'Impact', 'Description', 'Elements Affected', 'axe Version', 'Help URL'],
    ];

    for (const record of records) {
      const date = new Date(record.scanned_at).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      if (record.violations.length === 0) {
        rows.push([date, record.run_id, record.page_path, '—', '—', 'No violations', '0', record.axe_version, '']);
      } else {
        for (const v of record.violations) {
          rows.push([
            date,
            record.run_id,
            record.page_path,
            v.id,
            v.impact ?? 'unknown',
            v.description,
            String(v.nodes),
            record.axe_version,
            v.helpUrl,
          ]);
        }
      }
    }

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emlakie-ada-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printLog() {
    window.print();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={downloadCSV}
        className="rounded-xl px-4 py-2 text-sm font-bold bg-gray-700 text-white hover:bg-gray-600 transition"
      >
        ⬇ Download CSV
      </button>
      <button
        onClick={printLog}
        className="rounded-xl px-4 py-2 text-sm font-bold bg-gray-700 text-white hover:bg-gray-600 transition"
      >
        🖨 Print Log
      </button>
    </div>
  );
}
