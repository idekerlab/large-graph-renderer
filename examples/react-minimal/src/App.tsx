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

const App: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState(DEF_SUID);
  const [render3d, setRender3d] = useState(false);
  const [data, setData] = useState<GraphView | null>(null);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState();
  const [selectedEdge, setSelectedEdge] = useState();

  console.log("* New UUID:", selectedNetwork);

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
            console.log("* Data fetch error:", err);
            setError(err);
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
          setSelectedNode={setSelectedNode}
          setSelectedEdge={setSelectedEdge}
          render3d={render3d}
        />
      )}
    </div>
  );
};

export default App;
