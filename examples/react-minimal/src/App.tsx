import React, { useState, useEffect } from "react";
import "./App.css";
import {
  NodeView,
  EdgeView,
  GraphView,
  LargeGraphRenderer,
  GraphViewFactory,
} from "large-graph-renderer";

import * as cxVizConverter from "cx-viz-converter";

// For deployment
const BASE_URL = "http://dev.ndexbio.org/v3/network/";

const emptyNodes = new Map<string, NodeView>();
const emptyEdges = new Map<string, EdgeView>();

// Small
// const DEF_SUID = "e065fc7d-7823-11ea-8057-525400c25d22";

// Medium
const DEF_SUID = '876e7b0d-88a4-11ea-8503-525400c25d22'

// Fan's network
const FAN1 = 'a0a1b030-917a-11ea-be39-525400c25d22'

const App: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState(FAN1);
  const [render3d, setRender3d] = useState(false);
  const [data, setData] = useState<GraphView | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState();
  const [selectedEdge, setSelectedEdge] = useState();

  console.log("* New UUID:", selectedNetwork);

  const _handleNodeClick = (event: object): void => {
    console.log("################ Node click event:", event);
    // setSelectedNode(node)
  }
  
  const _handleEdgeClick = (event: object): void => {
    console.log("!!!!!!!!!!!! ext Edge click event:", event);
    // setSelectedNode(node)
  }
  
  const _handleBackgroundClick = (event: object): void => {
    console.log("!!!!!!!!!!!! BG click event:", event);
  }

  const dataUrl = BASE_URL + selectedNetwork;

  useEffect(() => {
    if (data === null) {
      const fetchGraphData = () => {
        const t0 = performance.now();
        setLoading(true);
        fetch(dataUrl)
        .then(res => res.json())
          .then(cx => {
            const result = cxVizConverter.convert(cx, "lnv");
            const gv = GraphViewFactory.createGraphView(
              result.nodeViews,
              result.edgeViews
            );
            setData(gv);
            setLoading(false);
          })
          .catch((err) => {
            console.error("* Data fetch error:", err);
            setLoading(false);
          });
      };
      fetchGraphData()
    }
  }, [data, dataUrl]);


  return (
    <div className="App">
      {(data == null || data === undefined )? (
        <div className="Loading">Loading Graph......</div>
      ) : (
        <LargeGraphRenderer
          graphView={data}
          onNodeClick={_handleNodeClick}
          onEdgeClick={_handleEdgeClick}
          onBackgroundClick={_handleBackgroundClick}
          render3d={render3d}
        />
      )}
    </div>
  );
};

export default App;
