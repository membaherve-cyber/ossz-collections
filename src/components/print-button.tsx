"use client";

export function PrintButton() {
  return (
    <div className="mb-6 flex justify-end gap-2 print:hidden">
      <button type="button" onClick={() => window.print()} className="btn btn-primary btn-sm">
        Print
      </button>
    </div>
  );
}
