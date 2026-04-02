# reVISit-XR Study Integration

This folder documents how the `revisitXR-1` website component is wired into the reVISit study repo.

## What This Package Expects

The XR stimulus itself lives in Repo A:

- `dev/reVISitXRexample1`

The study package in Repo B embeds that stimulus through a normal reVISit `website` component:

- `public/revisitXR-1/config.json`

There is still no automatic deployment step between the two repos. After rebuilding Repo A, you must manually copy the built `dist/` contents into:

- `public/revisitXR-1/assets/reVISitXR/`

## Website Component Config

`public/revisitXR-1/config.json` points the website stimulus at:

- `assets/reVISitXR/index.html`

The current reactive response ids are:

- `xrMode`
- `xrInteractionPhase`
- `xrGrabCount`
- `xrSessionCount`
- `xrLastEvent`
- `xrStateSummaryJson`

Those ids must continue to match `buildAnswerPayload()` in Repo A.

## How Analysis Control Reaches The Iframe

The analysis replay package now forwards an explicit message to website stimuli:

- `@REVISIT_COMMS/ANALYSIS_CONTROL`

That payload is derived in:

- `src/controllers/ComponentController.tsx`

and forwarded in:

- `src/controllers/IframeController.tsx`

Payload shape:

```ts
{
  mode: 'study' | 'analysis';
  isPlaying: boolean;
  participantId?: string | null;
  trialId?: string;
  allowLocalInteractionWhenPaused: true;
}
```

Current behavior:

- study mode: the iframe can record provenance and reactive summaries
- analysis mode, paused: the iframe allows temporary local desktop interaction
- analysis mode, playing: the iframe blocks local interaction and applies recorded participant replay snapshots
- analysis mode always suppresses new participant logging from viewer interactions

## Existing Iframe Messages

The website component still uses the existing channels:

- child -> parent: `WINDOW_READY`, `READY`, `ANSWERS`, `PROVENANCE`
- parent -> child: `STUDY_DATA`, `ANSWERS`, `PROVENANCE`, `ANALYSIS_CONTROL`

No wrapper HTML is required. The bridge lives inside Repo A.

## Where To Customize Things

If you want to change what gets logged or replayed, make those changes in Repo A first:

- `logging/xrLoggingSchema.js`
- `logging/xrSerialization.js`
- `logging/xrStudyLogger.js`
- `main.js`

Use Repo B mainly for:

- study config
- response ids shown in the sidebar
- forwarding analysis control to the iframe

## Manual Deploy Checklist

1. Rebuild Repo A.
2. Copy Repo A `dist/` contents into `public/revisitXR-1/assets/reVISitXR/`.
3. Rebuild or rerun Repo B.
4. Open `revisitXR-1` in study mode and verify reactive summaries.
5. Open analysis replay and verify play/pause interaction plus replay pointer visuals.
