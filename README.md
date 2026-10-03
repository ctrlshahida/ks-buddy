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

## Personalised demo

The current demo uses the requested cream background (`#FBF6EA`) and burgundy text (`#6B1E2E`), with a friendly robot Buddy and a single-account demo entry screen (not real authentication).

The home screen is voice-first using browser speech recognition, with typing, a follow-up reflection and optional browser text-to-speech. Availability depends on the browser and microphone permissions; recognition may send audio to the browser provider. No Whisper or live AI calls are made. Use Chrome/Edge if the in-app browser does not provide recognition.

Upload custom KSB CSVs in **My requirements**: `code,description,target`. The evidence target defaults to five activity references. The first personal KSB upload replaces starter requirements; later uploads merge by code. Coverage is an illustrative reference-count tracker, not an assessment of competence.

Objectives and KPIs accept `title,target,current,unit`. Their numeric trackers use imported values; conversations do not invent numeric KPI measurements. Historical activity imports provide a column-mapping preview for different export formats. `counts` is treated as off-the-job learning; `check`, `needs info` and `does not count` are not included automatically.

Requirements, profile details, objectives, KPIs and activities persist in the local SQLite workspace. Your real logo can replace the temporary brand mark later.

### Apprentice X pack

The pack overview describes ST0411 Project manager (integrated degree), Level 6, and 25 KSBs. The actual reference and testing files have not yet been supplied. Import `ksbs.csv` as requirements and `test_days.csv` as activity history when available. The UI currently starts with illustrative requirements; it does not claim they are the ST0411 set. No Supabase connection is configured.

The required attribution is included in the app footer: Contains public sector information licensed under the Open Government Licence v3.0. KSB data from Skills England, ST0411.
