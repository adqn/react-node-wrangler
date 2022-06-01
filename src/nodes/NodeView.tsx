import React, { useEffect, useState } from "react";
import { BaseNode, NodeDefinition, VisualNode, IO } from "./baseNode";

const WireOverlay = (props: {
  x1?: number | string,
  y1?: number | string,
  x2?: number | string,
  y2?: number | string
}) =>
  <div
    className="WireOverlay"
    style={{
      position: "absolute",
      top: "0px",
      left: "0px",
      pointerEvents: "none",
      width: "100%",
      height: "100%",
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
      width="100%"
      height="100%"
    >
      <line
        x1={props.x1}
        y1={props.y1}
        x2={props.x2}
        y2={props.y2}
        stroke="green" stroke-width="2" />
    </svg>
  </div>

interface boundingBoxes {
  [indexIoKey: string]: DOMRect;
}

interface lastMovedRectMap {
  [index: number]: DOMRect;
}


export const NodeView = (props: {
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  setRenderIndex: (index: number) => void;
}) => {
  const [boundingBoxes, setBoundingBoxes] = useState<boundingBoxes>({});
  const [nodeViewBoundingBox, setNodeViewBoundingBox] = useState<DOMRect | null>(null);
  const getIndexIoKey = ({ index, io, key }: { index: number, io: IO, key: string }) => `${index}-${io}-${key}`;

  const setBoundingBox = (index: number, io: IO, key: string, rect: DOMRect) => {
    const indexIoKey = getIndexIoKey({ index, io, key })
    const oldRect = boundingBoxes[indexIoKey];

    if (oldRect && oldRect.x === rect.x && oldRect.y === rect.y) {
      return;
    }

    const newBoundingBoxes = { ...boundingBoxes };
    newBoundingBoxes[indexIoKey] = rect;
    setBoundingBoxes(newBoundingBoxes);
  };

  console.log(boundingBoxes);
  console.log(nodeViewBoundingBox);

  return (
    <div
      className="NodeView"
      style={{
        // position: "absolute",
        // width: "100%",
        height: `100%`,
        // bottom: "0px",
        borderTop: "2px solid grey",
        background: "lightgrey",
        overflow: "scroll",
      }}
      ref={(el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (nodeViewBoundingBox && nodeViewBoundingBox.x === rect.x && nodeViewBoundingBox.y === rect.y) {
          return;
        }
        setNodeViewBoundingBox(rect);
      }}
    >
      {props.nodes.map((node, index) => {
        return (
          <VisualNode
            index={index}
            title={node.title}
            nodes={props.nodes}
            setNodes={props.setNodes}
            setRenderIndex={props.setRenderIndex}
            setBoundingBox={setBoundingBox}
          />
        );
      })}
      {props.nodes.map((node, index) => {
        return Object.entries(node.inputs).map(([key, value]) => {
          if (typeof value === 'object') {
            const outputKey = getIndexIoKey({ index: value.index, io: 'output', key: value.attr });
            const outRect = boundingBoxes[outputKey];
            const inputKey = getIndexIoKey({ index, io: 'input', key });
            const inRect = boundingBoxes[inputKey];

            if (outRect && inRect && nodeViewBoundingBox) {
              const x1 = -nodeViewBoundingBox.x + outRect.x + 2 + outRect.width / 2;
              const x2 = -nodeViewBoundingBox.x + inRect.x + 2 + inRect.width / 2;
              const y1 = -nodeViewBoundingBox.y + outRect.y + 1 + outRect.height / 2;
              const y2 = -nodeViewBoundingBox.y + inRect.y + 1 + inRect.height / 2;
              return <WireOverlay
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />;
            }
          }
          return null;
        })
      }).reduce((acc, curr) => {
        return acc.concat(curr).filter((el) => el !== null);
      }, [])
      }
    </div>
  );
};
