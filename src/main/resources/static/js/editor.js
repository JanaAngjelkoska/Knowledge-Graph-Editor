document.addEventListener("DOMContentLoaded", load_graph);

const $ = go.GraphObject.make;

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
                    font: "11px Montserrat",
                    textAlign: "center"
                },
                new go.Binding("text", "text"))
        );
}

function linkGraphToBackend(myDiagram) {
    const nodes = [{key: 0, text: "Center"}];
    for (let i = 1; i <= 9; i++) {
        nodes.push({key: i, text: `Node ${i}`});
    }

    const links = nodes.slice(1).map(n => ({from: 0, to: n.key}));

    for (let i = 10; i <= 15; i++) {
        nodes.push({key: i, text: `Node ${i}`});
    }

    const links2 = nodes.slice(10).map(n => ({from: 2, to: n.key}));

    const finalLinks = links.concat(links2);

    myDiagram.model = new go.GraphLinksModel(nodes, finalLinks);
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