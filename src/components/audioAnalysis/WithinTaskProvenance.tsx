import * as d3 from 'd3';

import {
  Affix, Popover, Button, Stack, Group, ColorSwatch,
} from '@mantine/core';
import { useMemo } from 'react';
import { TrrackedProvenance } from '../../store/types';
import { getProvenanceNodeLegendLabel } from './provenanceLegendLabels';

const RECT_HEIGHT = 15;
const RECT_WIDTH = 3;

export function WithinTaskProvenance({
  colorMap,
  currentNode,
  height,
  provenance,
  showLegend = false,
  xScale,
}: {
  colorMap: Map<string, string>;
  currentNode: string | null;
  height: number;
  provenance: TrrackedProvenance;
  showLegend?: boolean;
  xScale: d3.ScaleLinear<number, number>;
}) {
  const currentNodeLabel = useMemo(
    () => (currentNode && provenance?.nodes?.[currentNode]
      ? getProvenanceNodeLegendLabel(provenance.nodes[currentNode])
      : null),
    [currentNode, provenance],
  );

  return (
    <g style={{ cursor: 'pointer' }}>
      {provenance ? Object.entries(provenance.nodes || {}).map((entry) => {
        const [nodeId, node] = entry;
        const label = getProvenanceNodeLegendLabel(node);

        return (
          <g key={nodeId}>
            <rect
              fill={colorMap.get(label) || '#9498a0'}
              opacity={node.id === currentNode ? 1 : 0.7}
              x={xScale(node.createdOn) - RECT_WIDTH / 2}
              y={height / 2 - RECT_HEIGHT / 2}
              width={RECT_WIDTH}
              height={RECT_HEIGHT}
            />
          </g>
        );
      }) : null}
      {currentNode && provenance && provenance.nodes[currentNode]
        ? (
          <rect
            fill={colorMap.get(currentNodeLabel || '') || '#9498a0'}
            x={xScale(provenance.nodes[currentNode].createdOn) - RECT_WIDTH / 2}
            y={height / 2 - RECT_HEIGHT / 2}
            width={RECT_WIDTH}
            height={RECT_HEIGHT}
          />
        )
        : null}
      {showLegend ? (
        <Affix position={{ bottom: 10, left: 10 }}>
          <Popover width={220} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Button>Show Legend</Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                {
                  Array.from(colorMap.keys()).map((key) => (
                    <Group key={key}>
                      <ColorSwatch color={colorMap.get(key) || '#9498a0'} />
                      <span>{key}</span>
                    </Group>
                  ))
                }
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Affix>
      ) : null}
    </g>
  );
}
