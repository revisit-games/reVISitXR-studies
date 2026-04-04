# reVISit-XR Study Integration

This folder documents how the `revisitXR-1` website component is wired into the reVISit study repo.

## What This Package Expects

The XR stimulus itself lives in Repo A:

- `dev/reVISitXRexample1`

The study package in Repo B embeds that stimulus through a normal reVISit `website` component:

- `public/revisitXR-1/config.json`

There is still no automatic deployment step between the two repos. After rebuilding Repo A, you must manually copy the built `dist/` contents into:

- `public/revisitXR-1/assets/reVISitXR/`

That manual copy step still applies after the replay-visual refinement. Repo B does not build or bundle Repo A automatically.

## Website Component Config

`public/revisitXR-1/config.json` points the website stimulus at:

- `assets/reVISitXR/index.html`

Optional scene URLs now supported by Repo A:

- `assets/reVISitXR/index.html`
  Default template scene
- `assets/reVISitXR/index.html?scene=1`
  Example 1 energy bar matrix
- `assets/reVISitXR/index.html?scene=2`
  Example 2 placeholder
- `assets/reVISitXR/index.html?scene=3`
  Example 3 placeholder

`config.json` stays on the default path in this round. Repo B simply embeds whichever Repo A URL you choose.

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

`IframeController.tsx` now constructs local iframe URLs with `new URL(...)` plus `searchParams.set(...)`, so existing query strings are preserved correctly. For example:

- `assets/reVISitXR/index.html`
  becomes `assets/reVISitXR/index.html?trialid=...&id=...`
- `assets/reVISitXR/index.html?scene=1`
  becomes `assets/reVISitXR/index.html?scene=1&trialid=...&id=...`

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

The current replay visuals are analysis-only:

- floating controller-ray tooltips
- a replay `USER SIGHT` head avatar with facing arrow
- an orange paused-analysis frame and top-center banner

Those visuals live in Repo A and do not add new reactive answer ids by default.

## Existing Iframe Messages

The website component still uses the existing channels:

- child -> parent: `WINDOW_READY`, `READY`, `ANSWERS`, `PROVENANCE`
- parent -> child: `STUDY_DATA`, `ANSWERS`, `PROVENANCE`, `ANALYSIS_CONTROL`

No wrapper HTML is required. The bridge lives inside Repo A.

## Where To Customize Things

If you want to change what gets logged or replayed, make those changes in Repo A first:

- `replayVisualConfig.js`
- `logging/xrLoggingSchema.js`
- `logging/xrSerialization.js`
- `logging/xrStudyLogger.js`
- `main.js`

Use Repo B mainly for:

- study config
- response ids shown in the sidebar
- forwarding analysis control to the iframe
- replay timeline display normalization and legend presentation

If replay timelines become too dense or immersive interaction starts dropping frames, tune Repo A first:

- `logging/xrLoggingSchema.js`
- `logging/xrSerialization.js`
- `logging/xrStudyLogger.js`
- `scenes/core/sceneRegistry.js`
- `example1/`

Timeline density is primarily a Repo A logging-policy issue. Repo B only adds a lightweight runtime normalization layer for legend display labels and shared color categories.

## Replay Legend Labels

Replay legend labels are no longer derived from raw `node.label` alone.

Repo B now normalizes display labels through:

- `src/components/audioAnalysis/provenanceLegendLabels.ts`

Current display-label precedence:

1. trimmed `node.label`
2. fallback derived from `node.event`
3. `Root` for root nodes
4. `Unlabeled Event` as a final safe fallback

The helper also normalizes noisy historical labels such as:

- `Change Example 1 Year To 1975` -> `Change Example 1 Year`

This matters because stable labels keep the within-task legend readable and prevent dozens of almost-identical color categories from appearing during year scrubbing or other dense semantic updates.

Color mapping is now built across the current trial's provenance graphs instead of only the `stimulus` graph, so the default scene (`revisitxr-0`) and Example 1 both benefit from the same fallback and grouping logic.

Repo ownership for this package:

- Repo A owns replay rendering, replay tooltip state, the replay avatar, and paused-analysis viewport chrome
- Repo B owns study composition, the website component wrapper, and forwarding `PROVENANCE` plus `ANALYSIS_CONTROL` into the iframe
- this scene-authoring phase only required one small Repo B runtime change: query-safe iframe URL construction so `?scene=1` survives the added `trialid` and `id` params

## Manual Deploy Checklist

1. Rebuild Repo A.
2. Copy Repo A `dist/` contents into `public/revisitXR-1/assets/reVISitXR/`.
3. Rebuild or rerun Repo B.
4. Open `revisitXR-1` in study mode and verify reactive summaries.
5. If you want an authored scene instead of the template, point the website component at `assets/reVISitXR/index.html?scene=1`, `?scene=2`, or `?scene=3`.
6. Open analysis replay and verify play/pause interaction plus replay pointer visuals.
7. Verify the `USER SIGHT` avatar appears only in analysis replay and follows the replayed participant pose.
8. Verify the orange paused banner and border appear only while replay is paused and local free-camera movement is allowed.
9. Confirm that paused analyst interaction still does not create new participant provenance or extra reactive answers.
