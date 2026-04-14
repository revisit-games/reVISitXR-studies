# reVISit-XR Study Integration

This repo documents how the [reVISit-XR Stimulus Package](https://github.com/revisit-games/reVISitXR-scene1) builds are wired into the [reVISit](https://revisit.dev/) study repo. This package is part of [WPI VIEW Lab](https://wpivis.github.io/)'s broader reVISit-XR project.

## What This Package Expects

The XR stimuli were built from [reVISit-XR Stimulus Package](https://github.com/revisit-games/reVISitXR-scene1).

The study package in this repo (the reVISit-XR Study) embeds that stimulus through a normal reVISit `website` component:

- `public/revisitXR-1/config.json`

After rebuilding XR study stimuli, you should replace the content in `public/revisitXR-1/assets/reVISitXR/` with your newest built contents (`dist/`) from the [reVISit-XR Stimulus Package](https://github.com/revisit-games/reVISitXR-scene1).

## Website Component Config

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

Those ids must continue to match `buildAnswerPayload()` plus the active scene controller's `getAnswerSummary()` hook in the reVISit-XR Stimulus Package.

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

Demo 3 is the multi-view analytic workspace trial. It uses the same reVISit-XR Stimulus Package iframe bridge and semantic replay pipeline, but the scene state is workspace-level provenance: layout mode, panel transforms, focused and selected view, linked region selection, pinned views, and task submission.

`revisitxr-4` exposes Demo 4 situated AR overlay reactive ids:

- `xrDemoId`
- `xrTaskId`
- `xrArPlacementConfirmed`
- `xrArPlacementMode`
- `xrArPlacementSource`
- `xrArSurfaceDetected`
- `xrArMetricId`
- `xrArTimeIndex`
- `xrArLayerMode`
- `xrArLabelsVisible`
- `xrArSelectedSiteId`
- `xrArFocusedSiteId`
- `xrArDetailExpanded`
- `xrArInteractionModality`
- `xrArGazeDwellCount`
- `xrArHandSelectCount`
- `xrArVisibleSiteCount`
- `xrArAnchorTransformJson`

Demo 4 is the Campus Commons Monitoring Overlay trial. It asks participants to place an AR-first footprint, inspect local site markers, switch metric and time slice, use gaze-dwell or hand-ray activation, and submit the site with the highest midday CO2 reading.

`revisitxr-5` exposes Demo 5 landmark scale reactive ids:

- `xrDemoId`
- `xrTaskId`
- `xrVisceralLandmarkSetId`
- `xrVisceralSelectedLandmarkId`
- `xrVisceralComparisonMode`
- `xrVisceralViewpointPresetId`
- `xrVisceralAnnotationsVisible`
- `xrVisceralHumanReferenceVisible`
- `xrVisceralShadowCueVisible`
- `xrVisceralRulerCueVisible`
- `xrVisceralQuantLabelsVisible`
- `xrVisceralStateSummaryJson`
- `xrStateSummaryJson`

Demo 5 is the Landmark Scale Visceralization trial. It asks participants to compare authored landmark scale views and submit the tallest landmark.

`revisitxr-6` exposes Demo 6 game replay reactive ids:

- `xrDemoId`
- `xrTaskId`
- `xrGameScore`
- `xrGameCombo`
- `xrGameComboMax`
- `xrGameHits`
- `xrGameMisses`
- `xrGameAccuracy`
- `xrGameBombHits`
- `xrGameRoundSeed`
- `xrGameRoundState`
- `xrGameElapsedMs`
- `xrGameLastEvent`

Demo 6 is the Slice Rush mini-game replay trial. It asks participants to play one deterministic fruit-slicing round, avoid bombs, and submit the final score. The sidebar intentionally exposes scalar game responses only; compact semantic replay state remains in XR provenance rather than large reactive JSON blobs.

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

## Existing Iframe Messages

The website component still uses the existing channels:

- child -> parent: `WINDOW_READY`, `READY`, `ANSWERS`, `PROVENANCE`
- parent -> child: `STUDY_DATA`, `ANSWERS`, `PROVENANCE`, `ANALYSIS_CONTROL`

No wrapper HTML is required. The bridge lives inside the reVISit-XR Stimulus Package.

## Where To Customize Things

If you want to change what gets logged or replayed, make those changes in the reVISit-XR Stimulus Package first:

- `replayVisualConfig.js`
- `logging/xrLoggingSchema.js`
- `logging/xrSerialization.js`
- `logging/xrStudyLogger.js`
- `main.js`

Use this repo (the reVISit-XR Study) mainly for:

- study config
- response ids shown in the sidebar
- forwarding analysis control to the iframe
- replay timeline display normalization and legend presentation

If replay timelines become too dense or immersive interaction starts dropping frames, tune the reVISit-XR Stimulus Package first:

- `logging/xrLoggingSchema.js`
- `logging/xrSerialization.js`
- `logging/xrStudyLogger.js`
- `scenes/core/sceneRegistry.js`
- `demo1/`
- `demo3/`
- `example1/`

Timeline density is primarily a the reVISit-XR Stimulus Package logging-policy issue. The reVISit-XR Study repo only adds a lightweight runtime normalization layer for legend display labels and shared color categories.

## Replay Legend Labels

Replay legend labels are no longer derived from raw `node.label` alone.

This repo (the reVISit-XR Study) now normalizes display labels through:

- `src/components/audioAnalysis/provenanceLegendLabels.ts`

Current display-label precedence:

1. trimmed `node.label`
2. fallback derived from `node.event`
3. `Root` for root nodes
4. `Unlabeled Event` as a final safe fallback

Repo ownership for this package:

- The reVISit-XR Stimulus Package owns replay rendering, replay tooltip state, the replay avatar, and paused-analysis viewport chrome
- The reVISit-XR Study (this repo) owns study composition, the website component wrapper, and forwarding `PROVENANCE` plus `ANALYSIS_CONTROL` into the iframe

## Manual Deploy Checklist

1. Rebuild the reVISit-XR Stimulus Package.
2. Copy the reVISit-XR Stimulus Package `dist/` contents into `public/revisitXR-1/assets/reVISitXR/`.
3. Rebuild or rerun the reVISit-XR Study.
4. Open `revisitXR-1` in study mode and verify reactive summaries.
5. Open analysis replay and verify play/pause interaction plus replay pointer visuals.
6. Verify the `USER SIGHT` avatar appears only in analysis replay and follows the replayed participant pose.
7. Verify the orange paused banner and border appear only while replay is paused and local free-camera movement is allowed.
8. Confirm that paused analyst interaction still does not create new participant provenance or extra reactive answers.



---

# reVISit study – Interactive, Web-Based User Studies.  

Create your own interactive, web-based data visualization user studies by cloning/forking and editing configuration files and adding stimuli in the `public` folder. 

reVISit introduces reVISit.spec a DSL for specifying study setups (consent forms, training, trials, etc) for interactive web based studies. You describe your experimental setup in reVISit.spec, add your stimuli as images, forms, html pages, or React components, build and deploy – and you're ready to run your study. For tutorials and documentation, see the [reVISit website](https://revisit.dev). 

## Build Instructions

To run this demo experiment locally, you will need to install node on your computer. 

* Clone `https://github.com/revisit-studies/study`
* Run `yarn install`. If you don't have yarn installed, run `npm i -g yarn`. 
* To run locally, run `yarn serve`.
* Go to [http://localhost:8080](http://localhost:8080) to view it in your browser. The page will reload when you make changes. 

## Release Instructions

Releasing reVISit.dev happens automatically when a PR is merged into the `main` branch. The name of the pull request should be the title of the release, e.g. `v1.0.0`. Releasing creates a tag with the same name as the PR, but the official GitGub release should be created manually. The `main` branch is protected and requires two reviews before merging.

The workflow for release looks as follows:
Develop features on feature branch
| PRs
Dev branch
| PR (1 per release)
Main branch
| Run release workflow on merge
References are updated and commit is tagged