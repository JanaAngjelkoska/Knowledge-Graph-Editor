import * as req from './requests.js';
import {makeGet} from "./requests.js";

document.addEventListener("DOMContentLoaded", load_graph);

const $ = go.GraphObject.make;

const currentNodes = []
const currentEdges = []

function graphStyleProps(myDiagram) {

    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            $(go.Shape, "Circle", {
                fill: "#ffe9dc",
                stroke: "#ff6a3c",
                strokeWidth: 1.5,
                width: 65,
                height: 65
            }),
            $(go.TextBlock, {
                    margin: 6,
                    font: "9px Montserrat",
                    textAlign: "center"
                },
                new go.Binding("text", "text"))
        );
}

async function linkGraphToBackend(myDiagram) {
    const nodes = await makeGet("api/nodes");
    const edges = await makeGet("api/relationships");

    const nodeDataArray = nodes.map(node => ({
        key: node.properties.id,     // or whatever field you have as a unique ID
        text: node.labels[0]   // or another property you want displayed
    }));

    const linkDataArray = edges.map(edge => ({
        from: edge.startNodeId, // where the link starts
        to: edge.destinationNodeId  // where the link points
    }));


    console.log(nodes);
    console.log(edges);
    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}

function load_graph() {

    const myDiagram = $(go.Diagram, "myDiagramDiv", {
        "undoManager.isEnabled": true,
        allowCopy: false,
        allowClipboard: false,
        "commandHandler.canCopySelection": () => false,
        "commandHandler.canPasteSelection": () => false,
        layout: $(go.ForceDirectedLayout, {
            defaultSpringLength: 200,
            defaultElectricalCharge: 300,
            maxIterations: 1E3
        })
    });

    graphStyleProps(myDiagram);
    linkGraphToBackend(myDiagram);
}