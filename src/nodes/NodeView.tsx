import produce, { enablePatches, applyPatches, Patch } from "immer";
import React, { useEffect, useState } from "react";
import { BaseNode, NodeDefinition, VisualNode, IO } from "./baseNode";
import { ControlOverlay } from "../Components/ControlOverlay";
import {
  WireOverlay,
  InputOverlay,
  boundingBoxes,
} from "../Components/WireOverlay/WireOverlay";

const SVGCanvas = (props: { children: any }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        bottom: 0,
        // left: "0px",
        pointerEvents: "none",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="2"
        className="WireOverlay"
        width="100%"
        height="100%"
        style={{
          // position: "absolute",
          left: "0px",
          // bottom: nodeViewHeight.heightDelta,
        }}
        pointerEvents={"none"}
      >
        {props.children}
      </svg>
    </div>
  );
};

enablePatches();

export const NodeView = (props: {
  nodeGroupIndex: number;
  nodes: BaseNode[];
  setNodes: React.Dispatch<React.SetStateAction<NodeDefinition[]>>;
  setNodeGroups: React.Dispatch<React.SetStateAction<NodeDefinition[][]>>;
  setRenderIndex: (index: number) => void;
  containerHeight: number[];
}) => {
  const [boundingBoxes, setBoundingBoxes] = useState<boundingBoxes>({});
  const [ioRefs, setIoRefs] = useState<{ [key: string]: any }>({});
  const [nodeViewBoundingBox, setNodeViewBoundingBox] =
    useState<DOMRect | null>(null);
  const getIndexIoKey = ({
    index,
    io,
    key,
  }: {
    index: number;
    io: IO;
    key: string;
  }) => `${index}-${io}-${key}`;

  const boxUpdates: Patch[] = [];
  const updateBoundingBox = (index: number, io: IO, key: string, el?: any) => {
    const indexIoKey = getIndexIoKey({ index, io, key });
    el = el ?? ioRefs[indexIoKey];
    const rect = el.getBoundingClientRect();
    const oldRect = boundingBoxes[indexIoKey];

    if (oldRect && oldRect.x === rect.x && oldRect.y === rect.y) {
      return;
    }

    const newBoundingBoxes = produce(
      applyPatches(boundingBoxes, boxUpdates),
      (boundingBoxes) => {
        boundingBoxes[indexIoKey] = rect;
      },
      (patches) => boxUpdates.push(...patches)
    );

    setBoundingBoxes(newBoundingBoxes);
  };

  const refUpdates: Patch[] = [];
  const setIoRef = (index: number, io: IO, key: string, el: any) => {
    const indexIoKey = getIndexIoKey({ index, io, key });
    const oldRef = !!ioRefs?.[indexIoKey];

    if (oldRef) {
      return;
    }

    const newIoRefs = produce(
      applyPatches(ioRefs, refUpdates),
      (ioRefs) => {
        ioRefs[indexIoKey] = el;
      },
      (patches) => refUpdates.push(...patches)
    );
    setIoRefs(newIoRefs);
    updateBoundingBox(index, io, key, el);
  };

  useEffect(() => {
    setBoundingBoxes(
      produce((updatedBoundingBoxes) => {
        Object.entries(ioRefs).forEach(([indexIoKey, el]) => {
          updatedBoundingBoxes[indexIoKey] = el.getBoundingClientRect();
        });
      })
    );
  }, [props.containerHeight]);

  return (
    <div
      className="NodeView"
      style={{
        // position: "absolute",
        // width: "100%",
        height: "100%",
        // bottom: "0px",
        // paddingTop: 30,
        borderTop: "2px solid grey",
        background: "lightgrey",
        overflow: "scroll",
      }}
      ref={(el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (
          nodeViewBoundingBox &&
          nodeViewBoundingBox.x === rect.x &&
          nodeViewBoundingBox.y === rect.y
        ) {
          return;
        }
        setNodeViewBoundingBox(rect);
        console.log(nodeViewBoundingBox, props.containerHeight);
      }}
    >
      <ControlOverlay nodes={props.nodes} setNodes={props.setNodes} />
      {props.nodes.map((node, index) => {
        return (
          <VisualNode
            key={`${index}`}
            index={index}
            title={node.title}
            nodes={props.nodes}
            setNodes={props.setNodes}
            setRenderIndex={props.setRenderIndex}
            updateBoundingBox={updateBoundingBox}
            setIoRef={setIoRef}
          />
        );
      })}
      <SVGCanvas>
        {props.nodes
          .map((node, index) => {
            return Object.entries(node.inputs).map(([key, value]) => {
              const inputKey = getIndexIoKey({ index, io: "input", key });
              const inRect = boundingBoxes[inputKey];

              if (!nodeViewBoundingBox || !inRect) {
                return null;
              }
              const x2 =
                -nodeViewBoundingBox.x + inRect.x - 3 + inRect.width / 2;
              const y2 =
                -nodeViewBoundingBox.y + inRect.y - 1 + inRect.height / 2;

              if (node.isWire(value)) {
                const outputKey = getIndexIoKey({
                  index: value.index,
                  io: "output",
                  key: value.attr,
                });
                const outRect = boundingBoxes[outputKey];

                if (outRect && inRect) {
                  const x1 =
                    -nodeViewBoundingBox.x + outRect.x + 3 + outRect.width / 2;
                  const y1 =
                    -nodeViewBoundingBox.y + outRect.y - 1 + outRect.height / 2;
                  return (
                    <WireOverlay
                      key={`${inputKey}`}
                      origin={nodeViewBoundingBox}
                      nodeTo={node}
                      inputKey={inputKey}
                      outputKey={outputKey}
                      boundingBoxes={boundingBoxes}
                      nodes={props.nodes}
                      nodeGroupIndex={props.nodeGroupIndex}
                      setNodeGroups={props.setNodeGroups}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                    />
                  );
                }
              } else {
                return (
                  <InputOverlay
                    key={`${inputKey}`}
                    origin={nodeViewBoundingBox}
                    inputKey={inputKey}
                    boundingBoxes={boundingBoxes}
                    nodes={props.nodes}
                    nodeGroupIndex={props.nodeGroupIndex}
                    setNodeGroups={props.setNodeGroups}
                    x1={x2}
                    y1={y2}
                  />
                );
              }
              return null;
            });
          })
          .reduce((acc, curr) => {
            return acc.concat(curr).filter((el) => el !== null);
          }, [])}
      </SVGCanvas>
    </div>
  );
};
