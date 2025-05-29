import {makeGet, makePatchJsonBody, makePostJsonBody, makePostPathVar} from './requests.js';

// -----------------| UI SETUP & GLOBAL VAR SETUP |-----------------

// graph

const $ = go.GraphObject.make;
const deleteButton = document.getElementById('delete-btn');
let graph;
let editedProperties = {};
let currentEditingEntity = null;
let currentlyConnectingFromEntity = null;
let currentlyConnectingToEntity = null;
let currentlyConnectingStatus = false;
let snapToGrid = false;
const labelColorMap = {};

// confirmation messages
let create_rel_msg = document.querySelector('.confirmation-message-create-rel')
let save_changes_msg = document.querySelector('.confirmation-message')
let create_node_msg = document.querySelector('.confirmation-message-create')

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

const contextMenuTemplateNode =
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

                        currentlyConnectingStatus = true;

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

const contextMenuTemplateLink =
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
                click: (e, obj) => {
                    const contextPart = obj.part.adornedPart;
                    if (contextPart) {
                        deleteEntity();
                    }
                }
            }
        )
    );

function graphProps(graph) {
    graph.nodeTemplate =
        $(go.Node, "Auto",
            {
                contextMenu: contextMenuTemplateNode
            },
            $(go.Shape, "Circle",
                {
                    strokeWidth: 2,
                    width: 80,
                    height: 80
                },
                new go.Binding("fill", "label", label => colorForLabel(label).fill),
                new go.Binding("stroke", "label", () => "#000")
            ),
            $(go.TextBlock, {
                    font: "light 14px Montserrat",
                    textAlign: "center",
                    stroke: "black",
                    wrap: go.TextBlock.WrapFit,
                    maxSize: new go.Size(50, NaN),
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
                curve: go.Link.None,
                relinkableFrom: true,
                relinkableTo: true,
                contextMenu: contextMenuTemplateLink
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
                        font: "light 14px Montserrat",
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

// -----------------| FUNCTIONALITY |-----------------

async function linkGraphToBackend(graph) {
    const nodes = await makeGet("api/nodes");
    const edges = await makeGet("api/relationships");

    const nodeDataArray = nodes.map(node => ({
        key: node.properties.id,
        text: node.properties.displayName,
        label: node.labels[0],
        properties: node.properties
    }));

    const linkDataArray = edges.map(edge => ({
        from: edge.startNodeId,
        id: edge.properties.id,
        to: edge.destinationNodeId,
        text: edge.relationshipType,
        startId: edge.properties.startNodeId,
        endId: edge.properties.endId,
        properties: edge.properties
    }));

    graph.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    populateNodeDropdowns(graph);
}

function loadGraph() {
    graph = $(go.Diagram, "graphDiv", {
        grid: $(go.Panel, "Grid",
            {gridCellSize: new go.Size(10, 10)},
            $(go.Shape, "LineH", {stroke: "#F3F4F3"}),
            $(go.Shape, "LineV", {stroke: "#F3F4F3"})
        ),
        "draggingTool.isGridSnapEnabled": snapToGrid,
        "resizingTool.isGridSnapEnabled": snapToGrid,
        "rotatingTool.snapAngleMultiple": 15,
        "rotatingTool.snapAngleEpsilon": 15,
        allowCopy: false,
        allowClipboard: false,
        "commandHandler.canCopySelection": () => false,
        "commandHandler.canPasteSelection": () => false,
        layout: $(go.ForceDirectedLayout, {
            defaultSpringLength: 2E2,
            defaultElectricalCharge: 5E2,
            maxIterations: 1E4
        })
    });

    graphProps(graph);
    linkGraphToBackend(graph);

    graph.addDiagramListener("ObjectSingleClicked", function (e) {
        const part = e.subject.part;

        if (!(part instanceof go.Node || part instanceof go.Link)) return;
        create_node_msg.innerHTML = ""
        create_rel_msg.innerHTML = ""
        save_changes_msg.innerHTML = ""
        if (part instanceof go.Node) {
            showInfo(part.data, "Node");
        } else if (part instanceof go.Link) {
            showInfo(part.data, "Relationship");
        }
    });
}

function showInfo(data, type) {
    const sidebar = document.querySelector(".side-bar");
    const props = data.properties || {};

    if (type === "Node") {
        showLabelForNode(sidebar, data, props)
    } else {
        showLabelForRelationship(sidebar, data, props)
    }

    showPropertiesForAllTypes(sidebar, data, props, type)
}

function showLabelForNode(sidebar, data, props) {
    sidebar.querySelector(".display-class").textContent = data.label || "Unnamed Node";
    sidebar.querySelector("#label").style.backgroundColor = labelColorMap[data.label].fill;
    sidebar.querySelector("#label").style.border = "1px solid gray";
    const display_name = sidebar.querySelector(".display-name");
    display_name.innerHTML = " → ";
    display_name.innerHTML += props.displayName
    ;
}

function showLabelForRelationship(sidebar, data) {
    sidebar.querySelector(".display-class").textContent = "(relationship type)"
    sidebar.querySelector("#label").style.backgroundColor = "";
    sidebar.querySelector("#label").style.border = "0px solid gray";
    const display_name = sidebar.querySelector(".display-name");
    display_name.innerHTML = " → ";
    display_name.innerHTML += data.text;
}


function showPropertiesForAllTypes(sidebar, data, props, type) {
    const propertiesList = sidebar.querySelector(".properties ul");
    propertiesList.innerHTML = "";

    editedProperties = {};
    if (type === "Node") {

        if (currentlyConnectingFromEntity !== null) {
            currentlyConnectingToEntity = data.id ?? data.properties?.id ?? null;
            openAddRelationshipModal();
            return;
        } else {
            currentEditingEntity = data.id ?? data.properties?.id ?? null;
        }

        if (currentlyConnectingStatus) {
            currentlyConnectingFromEntity = currentEditingEntity;
        }

    } else {
        currentEditingEntity = data
    }

    const keys = Object.keys(props);
    keys.forEach(key => {
        if (key !== 'id' && key !== 'destinationNodeId' && key !== 'sourceNodeId') {
            const li = createPropertyInput(key, props[key], data, type, true);
            propertiesList.appendChild(li);
        }
    });

    const saveChangesButton = document.querySelector(".save-changes-button");
    saveChangesButton.onclick = function () {
        handleEditProperty(type);
    };

    const liAddNew = document.createElement("li");
    liAddNew.innerHTML = ` 
        <span class="mx-1" style="cursor: url('img/click.png') 0 0, auto; color: dimgray; font-size: 1.3rem;"> 
            <i class="bi bi-plus-circle-fill"></i>
            <span class="add-new-msg">Add a new property</span> 
        </span>
    `;
    propertiesList.appendChild(liAddNew);

    const addNewIcon = liAddNew.querySelector('span');
    addNewIcon.addEventListener('click', () => {
        const newLi = createPropertyInput("", "", data, type, false);
        propertiesList.insertBefore(newLi, liAddNew);
    });
}

function createPropertyInput(key, value, data, type, disable) {
    const li = document.createElement("li");
    if (key !== 'displayName') {
        if (disable) {
            li.innerHTML = `  
            <input type="text" style="width:40%" disabled value="${key}" placeholder="Key" class="d-inline-block form-control key-input form-control-sm" />`;
        } else {
            li.innerHTML = `  
            <input type="text" style="width:40%" value="${key}" placeholder="Key" class="d-inline-block form-control key-input form-control-sm" />`;
        }
        li.innerHTML += `
        <span class="d-inline-block text-center" style="width: 5%;">→</span>
        <input type="text" style="width: 40%" value="${value}" placeholder="Value" class="d-inline-block form-control value-input form-control-sm"/>
        <span class="d-inline-block text-center delete-btn" style="width: 5%; cursor: url('/img/click.png') 0 0, auto; color: dimgray; font-size: 1.3rem;">
            <i class="bi bi-trash"></i>
        </span>
        `;

        const keyInput = li.querySelector('.key-input');
        const deleteBtn = li.querySelector('.delete-btn');

        deleteBtn.addEventListener('click', async () => {
            await deleteNodeProperty(currentEditingEntity, keyInput.value.trim(), type);
            li.remove();
        });
    } else {
        li.innerHTML = `  
        <input type="text" style="width:40%" value="${key}" disabled placeholder="Key" class="d-inline-block form-control key-input form-control-sm" />
        <span class="d-inline-block text-center" style="width: 5%;">→</span>
        <input type="text" style="width: 40%" value="${value}" placeholder="Value" class="d-inline-block form-control value-input form-control-sm"/>
        
        <span class="d-inline-block text-center" style="width: 5%; color: #3399ff; font-size: 1.3rem;">
            <i class="bi bi-eye"></i>
        </span>
        `;
    }

    return li;
}

async function deleteNodeProperty(entity, propertyKey, type) {
    let link = null;

    if (type === "Node") {
        link = `/api/nodes/delete-property/${entity}/${propertyKey}`;
    } else if (type === "Relationship") {
        link = `/api/relationships/delete-property/${entity.id}/${propertyKey}`;
    }

    try {
        const response = await fetch(link, {
            method: 'DELETE'
        });

        if (response.ok) {
            await linkGraphToBackend(graph); // Reload the graph
        } else {
            console.error(`Failed to delete property '${propertyKey}':`, await response.text());
        }
    } catch (error) {
        console.error("Error occurred while deleting property:", error);
    }
}

async function handleEditProperty(type) {
    if (!currentEditingEntity) {
        return;
    }

    const sidebar = document.querySelector(".side-bar");
    const propertiesList = sidebar.querySelectorAll(".properties ul li");

    const updatedProperties = {};

    propertiesList.forEach(li => {
        const valueInput = li.querySelector('.value-input');
        const keyInput = li.querySelector('.key-input');

        if (valueInput !== null && keyInput !== null) {
            const key = keyInput.value.trim();
            const value = valueInput.value;
            if (key !== "") {
                updatedProperties[key] = value;
            }
        }
    });

    Object.assign(updatedProperties, editedProperties);

    await callEditEntityProperties(currentEditingEntity, updatedProperties, type)
}

async function callEditEntityProperties(currentEditingEntity, updatedProperties, type) {
    let link_call;

    if (type === "Node")
        link_call = `api/nodes/edit/${currentEditingEntity}`
    else
        link_call = `api/relationships/edit/${currentEditingEntity.id}`

    try {
        await makePatchJsonBody(updatedProperties, link_call)
        save_changes_msg.innerHTML = "Changes saved."
        await linkGraphToBackend(graph);
    } catch (error) {
        console.error("Error occurred while updating properties: ", error);
    }
}

async function deleteEntity() {
    const selectedEntity = graph.selection.first();
    let currentEntityType = ""

    if (selectedEntity instanceof go.Node) {
        currentEntityType = "Node"
    } else if (selectedEntity instanceof go.Link) {
        currentEntityType = "Relationship"
    }

    if (selectedEntity) {
        const confirmation = confirm("Are you sure you want to delete the selected entity? It may cascade to related relationships.");
        if (confirmation) {
            try {
                if (currentEntityType === "Node") {
                    graph.commandHandler.deleteSelection();
                    const nodeId = selectedEntity.data.key;
                    await makePostPathVar(nodeId, "api/nodes/delete");

                } else if (currentEntityType === "Relationship") {
                    graph.commandHandler.deleteSelection();
                    const relationshipId = selectedEntity.data.id;
                    await makePostPathVar(relationshipId, "api/relationships/delete");
                }

                await linkGraphToBackend(graph);

            } catch (error) {
                console.error("Error during deletion: ", error);
            }
        }
    } else {
        alert("Please select a node or relationship to delete.");
    }
}

function populateNodeDropdowns(graph) {
    const node1Select = document.getElementById('node1');
    const node2Select = document.getElementById('node2');

    node1Select.innerHTML = '';
    node2Select.innerHTML = '';

    graph.nodes.each(function (node) {
        const label = node.data.text;
        const nodeId = node.data.key;

        if (label) {
            const option1 = document.createElement('option');
            option1.value = nodeId;
            option1.textContent = label;
            const option2 = option1.cloneNode(true);

            node1Select.appendChild(option1);
            node2Select.appendChild(option2);
        }
    });
}

function openAddRelationshipModal() {
    console.log(currentlyConnectingToEntity)
    console.log(currentEditingEntity)
    const node1Select = document.getElementById('node1');
    const node2Select = document.getElementById('node2');

    node1Select.value = currentlyConnectingFromEntity;
    node2Select.value = currentlyConnectingToEntity;

    const modal = new bootstrap.Modal(document.getElementById('addRelationshipModal'));
    modal.show();
}

// -----------------| LISTENERS |-----------------

document.addEventListener("DOMContentLoaded", loadGraph);

document.getElementById("createNodeBtn").addEventListener("click", async () => {
    const nodeLabels = document.getElementById("nodeLabels").value.trim();
    const properties = {};

    const firstKey = document.getElementById("propertyKey").value.trim();
    const firstValue = document.getElementById("propertyValue").value.trim();
    if (firstKey && firstValue) {
        properties[firstKey] = firstValue;
    }

    document.querySelectorAll("#propertyList li").forEach(li => {
        const key = li.querySelector(".property-key").value.trim();
        properties[key] = li.querySelector(".property-value").value.trim();
    });

    if (nodeLabels && Object.keys(properties).length > 0) {
        try {
            const postData = {
                labels: [nodeLabels],
                properties: properties
            };

            await makePostJsonBody(postData, "api/nodes/create");
            create_node_msg.innerHTML = "Node created."
            await linkGraphToBackend(graph);

        } catch (error) {
            console.error('Error during node creation:', error);
        }
    } else {
        alert("Please enter a label and at least one property.");
    }
});

document.getElementById("createRelationshipBtn").addEventListener("click", async () => {
    const fromNodeId = document.getElementById("node1").value.trim();
    const toNodeId = document.getElementById("node2").value.trim();
    const relationshipType = document.getElementById("relationshipType").value.trim();
    const properties = {};

    document.querySelectorAll("#relationshipPropertyList li").forEach(li => {
        const key = li.querySelector(".relationship-property-key")?.value.trim();
        const value = li.querySelector(".relationship-property-value")?.value.trim();
        if (key && value) {
            properties[key] = value;
        }
    });

    if (fromNodeId && toNodeId && relationshipType && Object.keys(properties).length >= 0) {
        try {
            const postData = {
                startNodeId: fromNodeId,
                endNodeId: toNodeId,
                relationshipType: relationshipType.toString(),
                properties: properties
            };

            await makePostJsonBody(postData, `api/relationships/create/${fromNodeId}/${toNodeId}`);
            create_rel_msg.innerHTML = "Relationship created."
            await linkGraphToBackend(graph);


        } catch (error) {
            console.error('Error during relationship creation:', error);
        }
    } else {
        alert("Please fill in all fields and at least one property.");
    }

    resetAll();

});

function resetAll() {
    document.getElementById("statusCurrentlyConnectingTo").style.display = 'none';
    currentlyConnectingFromEntity = null;
    currentlyConnectingToEntity = null;
    currentEditingEntity = null;
    currentlyConnectingStatus = false;
}

document.querySelector("#resetConnectingButton").addEventListener('click', resetAll);


document.querySelector("#snapToGridSwitch").addEventListener('change', async (event) => {
    snapToGrid = event.target.checked;

    graph.toolManager.draggingTool.isGridSnapEnabled = snapToGrid;
    graph.toolManager.resizingTool.isGridSnapEnabled = snapToGrid;
});

document.querySelector("#addRelationshipPropertyBtn").addEventListener("click", () => {
    const newLi = document.createElement("li");
    newLi.classList.add("d-flex", "gap-2", "mb-2");

    newLi.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Key</label>
            <input type="text" class="relationship-property-key form-control" placeholder="Enter property key" />
        </div>
        <div class="mb-3">
            <label class="form-label">Value</label>
            <input type="text" class="relationship-property-value form-control" placeholder="Enter property value" />
        </div>
        <span>
            <i class="bi bi-trash mx-1 delete-property-btn" style="cursor: pointer; color: dimgray; font-size: 1.3rem;"></i>
        </span>
    `;

    document.getElementById("relationshipPropertyList").appendChild(newLi);

    newLi.querySelector(".delete-property-btn").addEventListener("click", () => {
        newLi.remove();
    });
});

document.querySelector(".add-property-btn").addEventListener("click", () => {
    const newLi = document.createElement("li");
    newLi.innerHTML = `
        <div class="mb-3">
            <label class="form-label">Key</label>
            <input type="text" class="property-key form-control" placeholder="Enter property key" />
        </div>
        <div class="mb-3">
            <label class="form-label">Value</label>
            <input type="text" class="property-value form-control" placeholder="Enter property value" />
        </div>
        <span>
            <i class="bi bi-trash mx-1 delete-property-btn" style="cursor: pointer; color: dimgray; font-size: 1.3rem;"></i>
        </span>
    `;
    document.getElementById("propertyList").appendChild(newLi);

    newLi.querySelector(".delete-property-btn").addEventListener("click", () => {
        newLi.remove();
    });
});

deleteButton.addEventListener('click', deleteEntity);