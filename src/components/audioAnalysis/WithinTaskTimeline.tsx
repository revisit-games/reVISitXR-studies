import {
  useMemo,
} from 'react';
import * as d3 from 'd3';
import { ParticipantData } from '../../storage/types';
import { TrrackedProvenance } from '../../store/types';
import { WithinTaskProvenance } from './WithinTaskProvenance';
import { buildProvenanceLegendColorMap } from './provenanceLegendLabels';

const margin = {
  left: 5, top: 0, right: 5, bottom: 0,
};

export function WithinTaskTimeline({
  xScale, answers, width, height, currentNode, trialName,
} : {xScale: d3.ScaleLinear<number, number>, answers: ParticipantData['answers'], width: number, height: number, currentNode: string | null, trialName: string}) {
  const answer = answers[trialName];
  const provenanceGraphs = useMemo(
    () => Object.values(answer?.provenanceGraph || {}).filter((graph): graph is TrrackedProvenance => Boolean(graph)),
    [answer],
  );

  const colorMap = useMemo(
    () => buildProvenanceLegendColorMap(provenanceGraphs),
    [provenanceGraphs],
  );

  const provenanceMarks = useMemo(
    () => provenanceGraphs.map((graph, index) => (
      <WithinTaskProvenance
        colorMap={colorMap}
        currentNode={currentNode}
        height={height}
        key={`${trialName}-${index}`}
        provenance={graph}
        showLegend={index === 0}
        xScale={xScale}
      />
    )),
    [colorMap, currentNode, height, provenanceGraphs, trialName, xScale],
  );

  return (
    <svg style={{ width, height }}>
      <line stroke="black" strokeWidth={1} x1={margin.left} x2={width + margin.left} y1={height / 2} y2={height / 2} />
      {provenanceMarks}
    </svg>
  );
}
