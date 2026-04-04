import { TrrackedProvenance } from '../../store/types';

const ROOT_LABEL = 'Root';
const UNLABELED_LABEL = 'Unlabeled Event';
const ZERO_WIDTH_PATTERN = /[\u200B-\u200D\uFEFF]/g;
const COLOR_PALETTE = ['#4269d0', '#ff725c', '#6cc5b0', '#3ca951', '#ff8ab7', '#a463f2', '#97bbf5', '#9c6b4e'];

const EVENT_TYPE_LABELS: Record<string, string> = {
  'scene-state-change': 'Update Scene State',
  'pointer-state-sample': 'Sample Pointer State',
  'camera-transform-sample': 'Sample Camera Transform',
  'object-transform-sample': 'Sample Object Transform',
  'object-grab-start': 'XR Grab Start',
  'object-grab-end': 'XR Grab End',
  'session-start': 'Session Start',
  'session-end': 'Session End',
  'mode-change': 'Mode Change',
  'camera-reset': 'Camera Reset',
};

type ProvenanceNodeLike = {
  event?: string;
  id?: string;
  label?: string;
  parent?: string | null;
};

function titleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(' ');
}

export function sanitizeLegendText(rawValue: string | null | undefined) {
  return (rawValue || '')
    .replace(ZERO_WIDTH_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeLegendLabel(rawLabel: string | null | undefined) {
  const trimmed = sanitizeLegendText(rawLabel);

  if (!trimmed) {
    return '';
  }

  if (/^Change Example 1 Year To \d{4}$/.test(trimmed)) {
    return 'Change Example 1 Year';
  }

  if (/^Update Scene State$/i.test(trimmed)) {
    return 'Update Scene State';
  }

  if (/^Select (?!Example 1 Datum$).+/.test(trimmed)) {
    return 'Select Example 1 Datum';
  }

  return trimmed;
}

function getFallbackEventLabel(node: ProvenanceNodeLike) {
  const eventType = sanitizeLegendText(node.event);

  if (!eventType) {
    return '';
  }

  if (EVENT_TYPE_LABELS[eventType]) {
    return EVENT_TYPE_LABELS[eventType];
  }

  return titleCase(eventType);
}

export function getProvenanceNodeLegendLabel(node: ProvenanceNodeLike | undefined) {
  const directLabel = normalizeLegendLabel(node?.label);

  if (directLabel) {
    return directLabel;
  }

  const fallbackEventLabel = normalizeLegendLabel(getFallbackEventLabel(node || {}));

  if (fallbackEventLabel) {
    return fallbackEventLabel;
  }

  if (node?.parent === null || node?.parent === undefined) {
    return ROOT_LABEL;
  }

  return UNLABELED_LABEL;
}

export function hasRenderableProvenanceGraph(graph: TrrackedProvenance | undefined) {
  const nodes = graph?.nodes;

  if (!nodes) {
    return false;
  }

  if (nodes instanceof Map) {
    return nodes.size > 0;
  }

  return Object.keys(nodes).length > 0;
}

export function buildProvenanceLegendColorMap(graphs: Array<TrrackedProvenance | undefined>) {
  const colorMap = new Map<string, string>();
  colorMap.set(ROOT_LABEL, '#efb118');

  let colorIndex = 0;

  graphs
    .filter((graph): graph is TrrackedProvenance => hasRenderableProvenanceGraph(graph))
    .forEach((graph) => {
      Object.values(graph.nodes || {}).forEach((node) => {
        const label = getProvenanceNodeLegendLabel(node as ProvenanceNodeLike) || UNLABELED_LABEL;

        if (!colorMap.has(label)) {
          colorMap.set(label, COLOR_PALETTE[colorIndex]);
          colorIndex = (colorIndex + 1) % COLOR_PALETTE.length;
        }
      });
    });

  if (!colorMap.has(UNLABELED_LABEL)) {
    colorMap.set(UNLABELED_LABEL, '#9498a0');
  }

  return colorMap;
}
