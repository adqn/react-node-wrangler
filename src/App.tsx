import React, { useState, useEffect } from 'react';
// import './App.css';
import Draggable, { DraggableCore } from 'react-draggable';

const testFunc = () => "some output"

const nodeOutput = (callback: (args?: any) => any) => Promise.resolve(callback)

const VisualNode = (props: {
  index: number,
  title?: string,
  inputs?: Array<{}>,
  outputs?: Array<{}>,
  nodes: Array<{}>,
  setNodes: any
}) => {
  const [title, setTitle] = useState<string | undefined>(props.title);
  const [value, setValue] = useState<any>();
  const [inputs, setInputs] = useState<Array<{}> | undefined>(props.inputs);
  const [outputs, setOutputs] = useState<Array<{}> | undefined>(props.outputs);

  const getNode = () => {
    const newNodes = [...props.nodes.map(node => ({...node}))];
    return newNodes;
  }

  const handleChange = () => {
    const newNodes = getNode();
    const node: any = newNodes[props.index - 1];
    node.attrs.innerHTML = value;
    props.setNodes(newNodes);
  }

  const handleMouseOver = () => {
    const newNodes = getNode();
    const node: any = newNodes[props.index - 1];
    node.hilighted = true;
    props.setNodes(newNodes);
  }

  const handleMouseOut = () => {
    const newNodes = getNode();
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
        margin: "5px",
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
        innerHTML:
        <input
          type={"text"}
          defaultValue={value}
          onChange={(ev) => {
            setValue(ev.target.value);
          }}
          onKeyUp={() => handleChange()}
        />
      </div>
      <div></div>
    </div>
    </Draggable>
  )
}

const nodes = [
  {
    "key": 1,
    "name": "",
    "attrs": 
      {
        "innerHTML": ""
      }
  }
]

const App = () => {
  const [nodes, setNodes] = useState([
    {
      "index": 1,
      "title": "a <span>",
      "hilighted": false,
      "children": [],
      "attrs":
      {
        "innerHTML": ""
      }
    },
    {
      "index": 2,
      "title": "another <span>",
      "hilighted": false,
      "children": [],
      "attrs":
      {
        "innerHTML": ""
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
                marginLeft: "5px",
                background: node.hilighted ? "lightgreen" : "none"
              }}
            >
              {node.attrs.innerHTML}
              {node.children?.map(child => {
                return child
              })}
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
          border: "1px solid black",
          overflow: "scroll",
        }}
      >
        {nodes.map(node => {
          return (
              <VisualNode 
                index={node.index}
                title={node.title}
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
