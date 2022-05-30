import React, { useState, useEffect } from 'react';
// import './App.css';
import Draggable, { DraggableCore } from 'react-draggable';

const testFunc = () => "some output"

const nodeOutput = (callback: (args?: any) => any) => Promise.resolve(callback)

const VisualNode = (props: {
  index: number,
  title?: string,
  attrs: any,
  inputs?: Array<{}>,
  outputs?: Array<{}>,
  nodes: Array<{}>,
  setNodes: any
}) => {
  const [title, setTitle] = useState<string | undefined>(props.title);
  const [value, setValue] = useState<any>();
  const [inputs, setInputs] = useState<Array<{}> | undefined>(props.inputs);
  const [outputs, setOutputs] = useState<Array<{}> | undefined>(props.outputs);

  const getNodes = () => {
    const newNodes = [...props.nodes.map(node => ({...node}))];
    return newNodes;
  }

  const handleChange = (key: string, value: string) => {
    const newNodes = getNodes();
    const node: any = newNodes[props.index - 1];
    key === "innerHTML" ? node.attrs[key] = {__html: value} : node.attrs[key] =  value;
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

  useEffect(() => {
    const setInput = async (callback: (args: any) => any) => {
      const input = await nodeOutput(callback)
      console.log(input())
    }

    setInput(testFunc)
  }, [])

  return (
    <Draggable
      handle={`.handle`}
    >
    <div
      className="VisualNode"
      style={{
        display: "inline-block",
        minHeight: "150px",
        minWidth: "200px",
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
          borderBottom: "1px solid black"
        }}
      >
        {title}
      </span>
      <div>
        {Object.keys(props.attrs).map((key, _) => {
          return (
            <span 
              style={{
                display: "block"
              }}
            >
              {key}: 
              <input
                type={"text"}
                defaultValue={props.attrs[key]}
                // onChange={(ev) => {
                //   setValue(ev.target.value);
                // }}
                //@ts-ignore
                onKeyUp={(ev) => handleChange(key, ev.target.value)}
              />
            </span>
          )
        })}
      </div>
      <div></div>
    </div>
    </Draggable>
  )
}

interface NodeData {
  index: number,
  title: string,
  hilighted: boolean,
  children: [],
  attrs: {
    innerHTML: { __html: string } | undefined,
    position?: string | undefined,
    display?: string | undefined,
    width?: number | string,
    height?: number | string
    top?: number | string,
    left?: number | string,
    right?: number | string,
    bottom?: number | string
  }
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
        "innerHTML": undefined,
        "position": "absolute",
        "left": "20px"
      }
    },
    {
      "index": 2,
      "title": "another <span>",
      "hilighted": false,
      "children": [],
      "attrs":
      {
        "innerHTML": undefined,
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
          return (
            <span
              style={{
                display: "block",
                position: "relative",
                marginLeft: "5px",
                left: node.attrs.left || 0,
                background: node.hilighted ? "lightgreen" : "none"
              }}
              dangerouslySetInnerHTML={node.attrs.innerHTML}
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
      </div>
    </div>
  );
}

export default App;
