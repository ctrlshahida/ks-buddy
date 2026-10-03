# ks-buddy

A clickable apprenticeship evidence prototype centred on talking to Buddy about your day. Review suggested Knowledge, Skills and Behaviours (KSB) mappings, track evidence coverage, import CSV activities and generate progress reports.

## Run locally

Requires Python 3; no extra packages or VS Code setup needed.

```sh
python3 server.py
```

Open http://127.0.0.1:4173 in your browser. Keep the server running while using the app.

## Features

- Conversation-led daily capture with editable simulated KSB suggestions
- Individual evidence trackers and KSB timelines
- CSV/JSON import with validation and row selection
- Progress reports, text downloads and printing to PDF
- SQLite persistence for reviewed activities
- Optional sample data, separate from your own record

## Import format

CSV requires `date` (YYYY-MM-DD) and `work` (or `description`). Optional columns: `learning`, `hours`, `project`, `otj`, `codes`, `evidence`. Separate KSB codes with semicolons, for example `K1;S3`. Use the in-app example download to see the format.

## Prototype limitations

Buddy's analysis uses local rules, not a live AI service. KSB descriptions are illustrative; evidence coverage is not a prediction of passing. Attachments save filenames/references only. This local server has no user authentication and binds to localhost.

Your activity database is stored outside the app source folder, in a `work` directory two levels above it. Imported data, databases, runtime files and Sites metadata are excluded from Git. The interface can be opened without the server, but saving and loading records require it.

## Files

- `dist/`: HTML, CSS, JavaScript and favicon
- `server.py`: local preview and SQLite API
