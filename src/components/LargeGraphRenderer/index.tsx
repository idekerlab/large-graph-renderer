import React, { useState } from "react";
import DeckGL from "@deck.gl/react";
import { OrthographicView, OrbitView } from "@deck.gl/core";
import GraphLayer from "../../Layers/GraphLayer";
import RendererProps from "./RendererProps";

const MAIN_VIEW_ID = "deck-main-view";

const baseStyle = {
  backgroundColor: "#222222",
  position: "relative",
};

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: 0,
  minZoom: -10,
  maxZoom: 10,
};

/**
 * Functional React component for large graph rendering using Deck.gl
 */
const LargeGraphRenderer: React.FunctionComponent<RendererProps> = (
  props: RendererProps
) => {
  const { setSelectedNode, setSelectedEdge, graphView, render3d } = props;

  // UI states
  const [showEdges, setShowEdges] = useState(true);
  const [showLabels, setShowLabels] = useState(false);

  const _handleViewStateChange = (state) => {
    const { viewState, interactionState } = state;
    const { zoom } = viewState;
    const { isZooming } = interactionState;

    console.log("Zoom level = ", zoom);
    console.log("Full state = ", state);
    if (zoom > 1) {
      setShowLabels(true);
    } else {
      setTimeout(() => {
        if (showLabels) {
          setShowLabels(false);
        }
      }, 100);
    }

    if (isZooming) {
      setShowEdges(false);
      setTimeout(() => {
        if (showEdges !== false) {
          setShowEdges(true);
        }
      }, 300);
    } else {
    }
  };

  const layerProps = {
    graphView,
    setSelectedNode,
    setSelectedEdge,
    showEdges,
    showLabels,
    render3d,
  };
  const layers = [new GraphLayer(layerProps)];
  let view = new OrthographicView();
  if (render3d) {
    view = new OrbitView();
  }

  const _handleClick = (layer, object) => {
    console.log("CLICK 2::", layer, object);

    // Fit content

    // const {viewport} = view.makeViewport({'100%', '100%', viewState})
    // if (layer) {
    //   const {longitude, latitude, zoom} = viewport.fitBounds([
    //     [object.minLng, object.minLat],
    //     [object.maxLng, object.maxLat]
    //   ])
    //   // Zoom to the object
    //   // deck.setProps({
    //   //   viewState: {longitude, latitude, zoom}
    // }
  };

  return (
    <DeckGL
      width="100%"
      height="100%"
      style={baseStyle}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      views={view}
      layers={layers}
      onDragStart={(info) => {
        setShowEdges(false);
      }}
      onDragEnd={(info) => {
        setShowEdges(true);
      }}
      onViewStateChange={(state) => {
        _handleViewStateChange(state);
      }}
      onClick={(layer, object) => {
        _handleClick(layer, object);
      }}
    />
  );
};

export { LargeGraphRenderer };
