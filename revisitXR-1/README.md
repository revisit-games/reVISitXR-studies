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

`public/revisitXR-1/config.json` currently exposes four website trials:

- `revisitxr-0`
  Points at `assets/reVISitXR/index.html`
- `revisitxr-1`
  Points at `assets/reVISitXR/index.html?scene=1`
- `revisitxr-2`
  Points at `assets/reVISitXR/index.html?scene=2`
- `revisitxr-3`
  Points at `assets/reVISitXR/index.html?scene=3`

Optional scene URLs now supported by Repo A:

- `assets/reVISitXR/index.html`
  Default template scene
- `assets/reVISitXR/index.html?scene=0`
  Legacy Example 1 energy bar matrix
- `assets/reVISitXR/index.html?scene=1`
  Demo 1 scatterplot navigation baseline
- `assets/reVISitXR/index.html?scene=2`
  Demo 2 migration globe baseline
- `assets/reVISitXR/index.html?scene=2&map=flat`
  Demo 2 migration flat-map view
- `assets/reVISitXR/index.html?scene=2&map=both`
  Demo 2 globe and flat-map view
- `assets/reVISitXR/index.html?scene=3`
  Demo 3 immersive analytic workspace
- `assets/reVISitXR/index.html?scene=3&layout=focus`
  Demo 3 focused workspace layout
- `assets/reVISitXR/index.html?scene=3&layout=surround`
  Demo 3 surrounding workspace layout

Repo B stays intentionally thin in this round. It just points at the right built Repo A URL and lists whichever reactive ids the study sidebar should surface.

The generic XR reactive response ids are:

- `xrMode`
- `xrInteractionPhase`
- `xrGrabCount`
- `xrSessionCount`
- `xrLastEvent`
- `xrStateSummaryJson`

`revisitxr-1` also exposes Demo 1 scene-specific reactive ids:

- `xrDemoId`
- `xrTaskId`
- `xrNavMode`
- `xrOverviewVisible`
- `xrOverviewToggleCount`
- `xrScaleFactor`
- `xrSelectedPointCount`
- `xrSelectedPointIdsJson`
- `xrLastSelectedPointId`

`revisitxr-2` exposes Demo 2 geo-specific reactive ids:

- `xrDemoId`
- `xrTaskId`
- `xrGeoYear`
- `xrGeoDirectionMode`
- `xrGeoThreshold`
- `xrGeoFocusedCountryId`
- `xrGeoSelectedNodeId`
- `xrGeoSelectedFlowId`
- `xrGeoVisibleFlowCount`
- `xrGeoLabelsVisible`
- `xrGeoMapDisplayMode`
- `xrGeoGlobeYawDeg`

Those ids must continue to match `buildAnswerPayload()` plus the active scene controller's `getAnswerSummary()` hook in Repo A.

Demo 2 also accepts `map=globe|flat|both` in its website URL. The default study URL remains `assets/reVISitXR/index.html?scene=2`, which starts in `globe` mode; the panel button can cycle the map mode during the task, and `xrGeoMapDisplayMode` captures the active mode as a reactive answer.

`revisitxr-3` exposes Demo 3 workspace-specific reactive ids:

- `xrDemoId`
- `xrTaskId`
- `xrWorkspaceLayoutMode`
- `xrWorkspaceFocusedViewId`
- `xrWorkspaceSelectedViewId`
- `xrWorkspaceSelectedDatumId`
- `xrWorkspaceLinkedHighlight`
- `xrWorkspaceVisibleViewIdsJson`
- `xrWorkspacePinnedViewIdsJson`
- `xrWorkspacePanelLayoutJson`

Demo 3 is the multi-view analytic workspace trial. It uses the same Repo A iframe bridge and semantic replay pipeline, but the scene state is workspace-level provenance: layout mode, panel transforms, focused and selected view, linked region selection, pinned views, and task submission. The fixed study sequence places `revisitxr-3` after `revisitxr-2` and before the demographics pages.

## Demo 1 Local Data Bundle

Demo 1 uses only local files that live inside Repo A under `demo1/data/` after preparation:

- `demo1/data/gdp-per-capita-worldbank.csv`
- `demo1/data/gdp-per-capita-worldbank.metadata.json`
- `demo1/data/life-expectancy.csv`
- `demo1/data/life-expectancy.metadata.json`
- `demo1/data/co-emissions-per-capita.csv`
- `demo1/data/co-emissions-per-capita.metadata.json`
- optional `demo1/data/population-unwpp.csv`
- optional `demo1/data/population-unwpp.metadata.json`

The recommended prep workflow is:

1. Place the downloaded OWID files in Repo A.
2. Keep them under `demo1/data/`.
3. Rebuild Repo A.
4. Copy Repo A `dist/` into `public/revisitXR-1/assets/reVISitXR/`.

There are no runtime OWID network fetches in Demo 1. If a required local file is missing, the scene shows an explanatory fallback panel instead of rendering the scatterplot.

## Demo 3 Local Data Bundle

Demo 3 uses copied local OWID files that live inside Repo A under `demo3/data/`:

- `demo3/data/gdp-per-capita-worldbank.csv`
- `demo3/data/gdp-per-capita-worldbank.metadata.json`
- `demo3/data/life-expectancy.csv`
- `demo3/data/life-expectancy.metadata.json`
- `demo3/data/co-emissions-per-capita.csv`
- `demo3/data/co-emissions-per-capita.metadata.json`
- `demo3/data/population-unwpp.csv`
- `demo3/data/population-unwpp.metadata.json`

The Demo 3 loader joins country-year rows by 3-letter ISO code, uses OWID region labels from the GDP file, and computes population-weighted regional aggregates for the representative task. The current copied bundle supports the `2000` to `2023` comparison window and requires no runtime downloads.

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
- Demo 1 replay restores semantic scatterplot state such as nav mode, overview visibility, scale, selection, and task submission instead of replaying per-point motion
- Demo 3 replay restores semantic workspace state such as layout mode, panel transforms, focus, selected datum, linked highlighting, pinned panels, and task submission instead of replaying raw drag motion
- Example 1's adaptive panel height remains a live runtime convenience in Repo A; replayed panel transforms only change when authored panel interactions commit semantic scene state

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
- `demo1/`
- `demo3/`
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

Before those comparisons, Repo B now strips zero-width characters and collapses repeated whitespace so a provenance node can no longer create a visually blank legend entry just because its raw label contains invisible text.

The helper also normalizes noisy historical labels such as:

- `Change Example 1 Year To 1975` -> `Change Example 1 Year`

This matters because stable labels keep the within-task legend readable and prevent dozens of almost-identical color categories from appearing during year scrubbing or other dense semantic updates.

Color mapping is now built across the current trial's provenance graphs instead of only the `stimulus` graph, so the default scene (`revisitxr-0`) and Example 1 both benefit from the same fallback and grouping logic.

The audio-analysis replay view also now resets its local Trrack instance, current node, and saved stimulus replay state whenever the participant, task, or active stimulus graph changes. That reset is important because otherwise stale replay state from one task can leak into the next task's analysis view, which is what made `revisitxr-1` appear to lose its own timeline while still showing old `revisitxr-0` context.

Repo ownership for this package:

- Repo A owns replay rendering, replay tooltip state, the replay avatar, and paused-analysis viewport chrome
- Repo B owns study composition, the website component wrapper, and forwarding `PROVENANCE` plus `ANALYSIS_CONTROL` into the iframe
- this scene-authoring phase only required one small Repo B runtime change: query-safe iframe URL construction so `?scene=1` survives the added `trialid` and `id` params

## Manual Deploy Checklist

1. Rebuild Repo A.
2. Copy Repo A `dist/` contents into `public/revisitXR-1/assets/reVISitXR/`.
3. Rebuild or rerun Repo B.
4. Open `revisitXR-1` in study mode and verify reactive summaries.
5. If you want the paper-facing scatterplot, point the website component at `assets/reVISitXR/index.html?scene=1`.
6. If you want the migration globe baseline, use `assets/reVISitXR/index.html?scene=2`.
7. If you want the analytic workspace, use `assets/reVISitXR/index.html?scene=3`.
8. If you want the legacy energy demo, use `assets/reVISitXR/index.html?scene=0`.
9. Open analysis replay and verify play/pause interaction plus replay pointer visuals.
10. Verify the `USER SIGHT` avatar appears only in analysis replay and follows the replayed participant pose.
11. Verify the orange paused banner and border appear only while replay is paused and local free-camera movement is allowed.
12. Confirm that paused analyst interaction still does not create new participant provenance or extra reactive answers.
