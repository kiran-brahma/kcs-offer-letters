# Appointment Letter Generator — Knighthood Corporate Services

Client-side Next.js app. Staff upload a CSV/Excel of employees, the app generates
appointment letters as PDFs — individually or merged into one file. **No data is
ever sent to a server**; parsing, PDF generation and hashing all run in the browser.

## Setup

This project uses [pnpm](https://pnpm.io). If you don't have it:

```bash
npm install -g pnpm
```

Then install dependencies and start:

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

### Logo (one manual step)

Save the company logo as **`public/logo.png`** (square PNG, transparent background,
at least 200×200). Without it the letterhead falls back to text only — nothing breaks.

## Input file

CSV or `.xlsx` / `.xls`, first sheet, one header row. Required columns:

| Column | Accepted header spellings |
| --- | --- |
| Name | Name, Full Name, Employee Name |
| Employee ID | Employee ID, Emp ID, Employee Code |
| Date of Joining | Date of Joining, DOJ, Joining Date |
| Designation | Designation, Role, Position, Job Title |

Column order does not matter. Dates accept `dd/mm/yyyy`, `yyyy-mm-dd`, Excel date
cells or Excel serial numbers; all print as `01 April 2026`. Rows with a missing
field are highlighted and skipped, the rest still generate.

Sample: [`public/sample-employees.csv`](public/sample-employees.csv)

## Outputs

- **Download** per row — one PDF per employee.
- **Download merged PDF** — all letters in one file, each starting on a new page.
- **Download all separately** — loops through every letter (browser may ask to allow
  multiple downloads).
- **Export issuance register (CSV)** — name, ID, DOJ, designation, reference number
  and full hash for every letter issued. Keep this; it is the HR record.

## Tamper check

Each letter carries a random reference number (`KCS/APP/<year>/<8 hex>`) and a
SHA-256 hash printed in the closing block. The hash is computed over:

```
KCS|v1|NAME|EMPLOYEE ID|DATE OF JOINING|DESIGNATION|REFERENCE NO
```

(uppercased, whitespace collapsed — see `lib/hash.js`).

Change any of those five fields in the PDF and the printed hash no longer matches.
The **Verify** page recomputes the hash from typed details and compares it against
the printed one.

Scope of the guarantee: it proves those five particulars are unaltered — it is not a
digital signature and does not stop someone copying an entire genuine letter. Keeping
the issuance register lets you also confirm that a reference number was actually issued.

`DOC_VERSION` in `lib/company.js` is part of the hash input. Bumping it invalidates
every previously issued hash — only change it if the hash scheme itself changes.

## Deploy (Vercel)

```bash
npx vercel
```

Or push to GitHub and import the repo at vercel.com — no environment variables, no
database, nothing to configure. Every page is statically prerendered.

## Editing the letter text

The full letter body lives in [`lib/letter.js`](lib/letter.js) as a pdfmake content
array. Fonts/sizes/colours are in the `STYLES` object in [`lib/pdf.js`](lib/pdf.js).
Company name and address are in [`lib/company.js`](lib/company.js).
