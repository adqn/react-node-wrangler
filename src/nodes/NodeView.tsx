import React, { useEffect, useState } from "react";
import { BaseNode, NodeDefinition, VisualNode, IO } from "./baseNode";

const WireOverlay = (props: {
  origin: any,
  x1: number | string,
  y1: number | string,
  x2: number | string,
  y2: number | string
}) => {
  const [position, setPosition] = useState({
    x1: props.x1,
    y1: props.y1,
    x2: props.x2,
    y2: props.y2,
    coords: {}
  })

  const handleMouseMove = React.useRef((ev: any) => {
    setPosition(position => {
      //@ts-ignore
      const xDiff = position.coords.x - ev.pageX
      console.log(xDiff)
      //@ts-ignore
      const yDiff = position.coords.y - ev.pageY
      return {
        x1: props.x1,
        y1: props.y1,
        x2: position.x2 as any - xDiff,
        y2: position.y2 as any - yDiff,
        coords: {
          x: ev.pageX,
          y: ev.pageY
        }
      }
    })
  })

  const handleMouseDown = (ev: any) => {
    const pageX = ev.pageX
    const pageY = ev.pageY
    setPosition(position => 
      Object.assign({}, position, {
        coords: {
          x: pageX,
          y: pageY
        }
      })
    )
    document.addEventListener('mousemove', handleMouseMove.current)
  }

  const handleMouseUp = () => {
    console.log("mouse up?")
    document.removeEventListener('mousemove', handleMouseMove.current)
    setPosition(position => Object.assign({}, position, {coords: {}}))

  }

  return (
    <>
      {/* <circle
        cx={position.x1}
        cy={position.y1}
        r="10"
        onMouseDown={(ev) => {
          setMousePos({x: ev.clientX - props.origin.x, y: ev.clientY - props.origin.y})
          setSelected(true)}}
        onMouseUp={() => setSelected(false)}
        onMouseOut={() => setSelected(false)}
        onMouseMove={(ev) => {
          if (selected) {
            handleDragging(ev)
          }
        }}
      /> */}
      <circle
        cx={position.x2}
        cy={position.y2}
        r="10"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
      <line
        x1={position.x1}
        y1={position.y1}
        x2={position.x2}
        y2={position.y2}
        stroke="green"
        stroke-width="3"
      />
    </>
  )
}

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
      <svg xmlns="http://www.w3.org/2000/svg" version="2"
        className="WireOverlay"
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
        }}>
        {props.nodes.map((node, index) => {
          return Object.entries(node.inputs).map(([key, value]) => {
            if (typeof value === 'object') {
              const outputKey = getIndexIoKey({ index: value.index, io: 'output', key: value.attr });
              const outRect = boundingBoxes[outputKey];
              const inputKey = getIndexIoKey({ index, io: 'input', key });
              const inRect = boundingBoxes[inputKey];

              if (outRect && inRect && nodeViewBoundingBox) {
                const x1 = -nodeViewBoundingBox.x + outRect.x + 3 + outRect.width / 2;
                const x2 = -nodeViewBoundingBox.x + inRect.x - 3 + inRect.width / 2;
                const y1 = -nodeViewBoundingBox.y + outRect.y - 1 + outRect.height / 2;
                const y2 = -nodeViewBoundingBox.y + inRect.y - 1 + inRect.height / 2;
                return <WireOverlay
                  origin={nodeViewBoundingBox}
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
        }, [])}
      </svg>
    </div>
  );
};
