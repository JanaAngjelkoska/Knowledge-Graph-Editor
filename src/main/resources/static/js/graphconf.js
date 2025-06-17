import {deleteEntity, enableConnectingStatus, labelColorMap, loadGraph, showInfo} from './editor.js';

const $ = go.GraphObject.make;
let curCellDim = 20;
let curLayout = 'graph';

const standardLayout = $(go.ForceDirectedLayout, {
    defaultSpringLength: 100,
    defaultElectricalCharge: 1500,
    maxIterations: 1E3
})

const treeLayout = $(go.LayeredDigraphLayout, {
    direction: 90,
    layerSpacing: 70,
    columnSpacing: 50,
})

const layoutTypes = {
    'tree': treeLayout,
    'graph': standardLayout
}

function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 10) + 30;
    const lightness = Math.floor(Math.random() * 20) + 70;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function colorForLabel(label) {
    if (!labelColorMap[label]) {
        labelColorMap[label] = {
            fill: randomColor(),
            stroke: randomColor()
        };
    }

    return labelColorMap[label];
}

export function graphPropsApply(graph) {
    graph.nodeTemplate =
        $(go.Node, "Auto",
            {
                contextMenu: contextMenuTemplateNode
            },
            $(go.Shape, "Circle",
                {
                    strokeWidth: 2,
                    width: 90,
                    height: 90
                },
                new go.Binding("fill", "label", label => colorForLabel(label).fill),
                new go.Binding("stroke", "label", () => "#000")
            ),
            $(go.TextBlock, {
                    font: "light 30px Montserrat",
                    textAlign: "center",
                    stroke: "black",
                    wrap: go.TextBlock.WrapFit,

                    maxSize: new go.Size(60, NaN),
                    overflow: go.TextBlock.OverflowClip,
                    verticalAlignment: go.Spot.Center
                },
                new go.Binding("text", "text")
            )
        );

    graph.linkTemplate =
        $(go.Link,
            {
                routing: go.Link.Normal,
                curve: go.Link.Bezier,
                adjusting: go.Link.Stretch,
                relinkableFrom: true,
                relinkableTo: true,
                contextMenu: contextMenuTemplateLink,
                reshapable: true,
                resegmentable: true,

            },
            $(go.Shape, {strokeWidth: 3, stroke: "#000"}),
            $(go.Shape, {toArrow: "Standard", stroke: null, fill: "#000"}),
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", {
                    fill: "#000",
                    strokeWidth: 0
                }),
                $(go.TextBlock,
                    {
                        margin: new go.Margin(1, 2),
                        font: "light 18px Montserrat",
                        stroke: "white",
                        editable: false,
                        wrap: go.TextBlock.WrapFit,
                        overflow: go.TextBlock.OverflowEllipsis
                    },
                    new go.Binding("text", "text")
                )
            )
        );


    graph.commandHandler.deletesTree = false;
    graph.commandHandler.canDeleteSelection = function () {
        return false;
    };
}

// Right click context menu constants
export const contextMenuTemplateNode =
    $("ContextMenu",
        $("ContextMenuButton",
            $(go.Panel, "Horizontal",
                {padding: 5},
                $(go.Picture,
                    {
                        source: "/img/details.svg",
                        width: 16, height: 16
                    }
                ),
                $(go.TextBlock, "Details",
                    {
                        font: "14px Montserrat",
                        stroke: "#333",
                        margin: new go.Margin(2, 8, 2, 8),
                        name: "DETAILS_TEXT"
                    }
                )
            ),
            {
                "ButtonBorder.fill": "#f0f0f0",
                "ButtonBorder.stroke": "#ccc",
                mouseEnter: (e, obj) => obj.findObject("DETAILS_TEXT").stroke = "#000",
                mouseLeave: (e, obj) => obj.findObject("DETAILS_TEXT").stroke = "#333",
                click: (e, obj) => {
                    const contextPart = obj.part.adornedPart;
                    if (contextPart instanceof go.Node) {
                        showInfo(contextPart.data, "Node");
                    } else if (contextPart instanceof go.Link) {
                        showInfo(contextPart.data, "Relationship");
                    }
                }
            }
        ),
        $("ContextMenuButton",
            $(go.Panel, "Horizontal",
                {padding: 5},
                $(go.Picture,
                    {
                        source: "/img/connect.svg",
                        width: 16, height: 16
                    }
                ),
                $(go.TextBlock, "Connect",
                    {
                        font: "14px Montserrat",
                        stroke: "#333",
                        margin: new go.Margin(2, 8, 2, 8),
                        name: "DETAILS_TEXT"
                    }
                )
            ),
            {
                "ButtonBorder.fill": "#f0f0f0",
                "ButtonBorder.stroke": "#ccc",
                mouseEnter: (e, obj) => obj.findObject("DETAILS_TEXT").stroke = "#000",
                mouseLeave: (e, obj) => obj.findObject("DETAILS_TEXT").stroke = "#333",
                click: (e, obj) => {
                    const contextPart = obj.part.adornedPart;
                    if (contextPart instanceof go.Node) {

                        enableConnectingStatus();

                        let statusConnectingTo = document.getElementById('statusCurrentlyConnectingTo');

                        statusConnectingTo.style.display = '';

                        showInfo(contextPart.data, "Node");

                    } else if (contextPart instanceof go.Link) {
                        showInfo(contextPart.data, "Relationship");
                    }
                }
            }
        ),
        $("ContextMenuButton",
            $(go.Panel, "Horizontal",
                {padding: 5},
                $(go.Picture,
                    {
                        source: "/img/delete.svg",
                        width: 16, height: 16
                    }
                ),
                $(go.TextBlock, "Delete",
                    {
                        font: "14px Montserrat",
                        stroke: "#333",
                        margin: new go.Margin(2, 8, 2, 8),
                        name: "DELETE_TEXT"
                    }
                )
            ),
            {
                "ButtonBorder.fill": "#f0f0f0",
                "ButtonBorder.stroke": "#ccc",
                mouseEnter: (e, obj) => obj.findObject("DELETE_TEXT").stroke = "#d00",
                mouseLeave: (e, obj) => obj.findObject("DELETE_TEXT").stroke = "#333",
                click: (e, obj) => {
                    const contextPart = obj.part.adornedPart;
                    if (contextPart) {
                        deleteEntity();
                    }
                }
            }
        )
    );

export const contextMenuTemplateLink =
    $("ContextMenu",
        $("ContextMenuButton",
            $(go.Panel, "Horizontal",
                {padding: 5},
                $(go.Picture,
                    {
                        source: "/img/details.svg",
                        width: 16, height: 16
                    }
                ),
                $(go.TextBlock, "Details",
                    {
                        font: "14px Montserrat",
                        stroke: "#333",
                        margin: new go.Margin(2, 8, 2, 8),
                        name: "DETAILS_TEXT"
                    }
                )
            ),
            {
                "ButtonBorder.fill": "#f0f0f0",
                "ButtonBorder.stroke": "#ccc",
                mouseEnter: (e, obj) => obj.findObject("DETAILS_TEXT").stroke = "#000",
                mouseLeave: (e, obj) => obj.findObject("DETAILS_TEXT").stroke = "#333",
                click: (e, obj) => {
                    const contextPart = obj.part.adornedPart;
                    if (contextPart instanceof go.Node) {
                        showInfo(contextPart.data, "Node");
                    } else if (contextPart instanceof go.Link) {
                        showInfo(contextPart.data, "Relationship");
                    }
                }
            }
        ),
        $("ContextMenuButton",
            $(go.Panel, "Horizontal",
                {padding: 5},
                $(go.Picture,
                    {
                        source: "/img/delete.svg",
                        width: 16, height: 16
                    }
                ),
                $(go.TextBlock, "Delete",
                    {
                        font: "14px Montserrat",
                        stroke: "#333",
                        margin: new go.Margin(2, 8, 2, 8),
                        name: "DELETE_TEXT"
                    }
                )
            ),
            {
                "ButtonBorder.fill": "#f0f0f0",
                "ButtonBorder.stroke": "#ccc",
                mouseEnter: (e, obj) => obj.findObject("DELETE_TEXT").stroke = "#d00",
                mouseLeave: (e, obj) => obj.findObject("DELETE_TEXT").stroke = "#333",
                click: async (e, obj) => {
                    const contextPart = obj.part.adornedPart;
                    if (contextPart) {
                        await deleteEntity();
                    }
                }
            }
        )
    );

export function graphSettingsCreate() {
    return {
        grid: $(go.Panel, "Grid",
            { gridCellSize: new go.Size(curCellDim, curCellDim) },
            $(go.Shape, "LineH", { stroke: "#ececec" }),
            $(go.Shape, "LineV", { stroke: "#ececec" })
        ),
        "draggingTool.isGridSnapEnabled": document.querySelector("#snapToGridSwitch").checked,
        "resizingTool.isGridSnapEnabled": document.querySelector("#snapToGridSwitch").checked,
        "rotatingTool.snapAngleMultiple": 15,
        "rotatingTool.snapAngleEpsilon": 15,
        allowCopy: false,
        allowClipboard: false,
        "commandHandler.canCopySelection": () => false,
        "commandHandler.canPasteSelection": () => false,
        layout: layoutTypes[curLayout]
    };
}

export function setLayout(layoutType) {
    curLayout = layoutType;
    loadGraph();
}



export function setGridDim(dim) {
    curCellDim = dim;
    loadGraph();
}