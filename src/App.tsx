import React, { useState, useEffect } from 'react';
// import './App.css';
import Draggable, { DraggableCore } from 'react-draggable';

const testFunc = () => "some output"

const nodeOutput = (callback: (args?: any) => any) => Promise.resolve(callback)

const getValue = ({props, key}: {props: {attrs: NodeData["attrs"], nodes: NodeData[]}, key: string}): [string | number | undefined, boolean] => {
  let defaultValue = props.attrs[key];
  let isFromSink = false;

  while (typeof defaultValue === "object") {
    isFromSink = true;
    defaultValue = props.nodes[defaultValue.index - 1].attrs[defaultValue.attr];
  }

  return [defaultValue, isFromSink];
};

const VisualNode = (props: {
  index: number,
  title?: string,
  attrs: NodeAttrs,
  inputs?: Array<{}>,
  outputs?: Array<{}>,
  nodes: Array<NodeData>,
  setNodes: any
}) => {
  const [title, setTitle] = useState<string | undefined>(props.title);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [inputs, setInputs] = useState<Array<{}> | undefined>(props.inputs);
  const [outputs, setOutputs] = useState<Array<{}> | undefined>(props.outputs);

  const getNodes = () => {
    const newNodes = [...props.nodes.map(node => ({...node}))];
    return newNodes;
  }

  const handleChange = (key: string, value: string) => {
    const newNodes = getNodes();
    const node: any = newNodes[props.index - 1];
    node.attrs[key] = value;
    console.log(node.attrs);
    props.setNodes(newNodes);
  }

  const handleMouseOver = () => {
    const newNodes = getNodes();
    const node: any = newNodes[props.index - 1];
    node.hilighted = true;
    props.setNodes(newNodes);
  }

  const handleMouseOut = () => {
    const newNodes = getNodes();
    const node: any = newNodes[props.index - 1];
    node.hilighted = false;
    props.setNodes(newNodes);
  }

  const wireElement = () => {
    return <div>
      {"o"}
    </div>
  }

  useEffect(() => {
    // const setInput = async (callback: (args: any) => any) => {
    //   const input = await nodeOutput(callback)
    //   console.log(input())
    // }

    // setInput(testFunc)
  }, [])

  return (
    <Draggable
      handle={`.handle`}
    >
      <div
        className="VisualNode"
        style={{
          // position: "absolute",
          display: "inline-block",
          // left: `${150 + (props.index * 5)}px`,
          minHeight: "150px",
          minWidth: "150px",
          border: "1px solid black",
          borderRadius: "5px",
          background: "white"
        }}
        onMouseOver={() => handleMouseOver()}
        onMouseOut={() => handleMouseOut()}
      >
        <span
          className="handle"
          id="VisualNode header"
          style={{
            display: "block",
            borderBottom: "1px solid black",
            textAlign: "center"
          }}
          onMouseDown={() => {
            setIsDragging(true);
            // console.log("dragging")
          }}
          onMouseUp={() => {
            setIsDragging(false);
            // console.log("not dragging")
          }}
        >
          {title}
        </span>
        <div>
          {Object.keys(props.attrs).map((key, _) => {
            const [defaultValue, isFromSink] = getValue({ props, key });
            return (
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  marginLeft: "5px"
                }}
              >
                {isFromSink ? "-> " + key + ": " + defaultValue : (
                  <span>
                    {key}:{" "}
                    <input
                      style={{
                        width: "55%"
                      }}
                      type={"text"}
                      defaultValue={defaultValue}
                      // onChange={(ev) => {
                      //   setValue(ev.target.value);
                      // }}
                      //@ts-ignore
                      onKeyUp={(ev) => handleChange(key, ev.target.value)}
                    />
                    <span
                      style={{
                        position: "absolute",
                        display: "inline-block",
                        right: "3px"
                      }}
                    >
                      {"->"}
                    </span>
                  </span>
                )
                }
              </span>
            )
          })}
        </div>
        <div></div>
      </div>
    </Draggable>
  )
}

interface HTMLNodeAttrs {
  innerHTML?: string,
  position?: string,
  display?: string,
  width?: number | string,
  height?: number | string
  top?: number | string,
  left?: number | string,
  right?: number | string,
  bottom?: number | string
}

interface NodeAttrs {
  [key: string]: undefined | number | string | {
    index: number,
    attr: string,
  }
}

interface NodeData {
  index: number,
  title: string,
  hilighted: boolean,
  children: [],
  attrs: NodeAttrs,
}

const App = () => {
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      "index": 1,
      "title": "a <span>",
      "hilighted": false,
      "children": [],
      "attrs":
      {
        "innerHTML": {
          index: 4,
          attr: "c",
        },
        "position": "absolute",
        "left": "20px",
      }
    },
    {
      "index": 2,
      "title": "another <span>",
      "hilighted": false,
      "children": [],
      "attrs":
      {
        "innerHTML": "some text",
        "position": "absolute",
        "left": "0px"
      }
    },
    {
      "index": 3,
      "title": "yet another <span>",
      "hilighted": false,
      "children": [],
      "attrs":
      {
        "innerHTML": "some text",
        "position": "absolute",
        "left": "0px"
      }
    },
    {
      "index": 4,
      "title": "constant",
      "hilighted": false,
      "children": [],
      "attrs":
      {
        "c": "20px",
      }
    }
  ])

  return (
    <div 
      className="App"
      style={{
        height: "100%"
      }}
      >
        {nodes?.map(node => {
          return node.attrs.innerHTML && (
            <span
              style={{
                display: "block",
                position: "relative",
                marginLeft: "5px",
                left: getValue({props: {attrs: {...node.attrs}, nodes}, key: 'left'})[0] || 0,
                background: node.hilighted ? "lightgreen" : "none"
              }}
              dangerouslySetInnerHTML={{__html: `${getValue({props: {attrs: {...node.attrs}, nodes}, key: 'innerHTML'})[0]}`}}
            >
            </span>
          )
        })}
      <div
        className="NodeView"
        style={{
          position: "absolute",
          width: "100%",
          minHeight: "300px",
          bottom: "0px",
          borderTop: "1px solid black",
          background: "lightgrey",
          overflow: "scroll",
        }}
      >
        {nodes.map(node => {
          return (
              <VisualNode 
                index={node.index}
                title={node.title}
                attrs={node.attrs}
                nodes={nodes}
                setNodes={setNodes}
              />
          )
        })}
      <div
        className="WireOverlay"
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          pointerEvents: "none"
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
        >
          <line x1="20" y1="20" x2="100" y2="100" stroke="green" stroke-width="2" />
        </svg>
      </div>
      </div>
    </div>
  );
}

export default App;
