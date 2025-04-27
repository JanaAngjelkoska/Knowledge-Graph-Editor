import {makeGet, makePostJsonBody, makePostPathVar} from './requests.js';


// UI SETUP
const $ = go.GraphObject.make;
const deleteButton = document.getElementById('delete-btn');
let graph;
let editedProperties = {};
let currentEditingNodeId = null;
const connect_nodes_button = document.querySelector('.connect-nodes')


function graphProps(graph) {
    graph.nodeTemplate =
        $(go.Node, "Auto",
            $(go.Shape, "Circle", {
                fill: "#d4ecff",
                stroke: "#17496e",
                strokeWidth: 2,
                width: 100,
                height: 100
            }),
            $(go.TextBlock, {
                    font: "light 12px Montserrat",
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
                relinkableTo: true
            },
            $(go.Shape, {strokeWidth: 2, stroke: "#1b5970"}),
            $(go.Shape, {toArrow: "Standard", stroke: null, fill: "#1b5970"}),
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", {
                    fill: "#1b5970",
                    strokeWidth: 0
                }),
                $(go.TextBlock,
                    {
                        margin: new go.Margin(4, 6),
                        font: "bold 10px Montserrat",
                        stroke: "white",
                        editable: true,
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
        to: edge.destinationNodeId,
        text: edge.relationshipType
    }));

    graph.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    populateNodeDropdowns(graph);
}


function load_graph() {
    graph = $(go.Diagram, "graphDiv", {
        "undoManager.isEnabled": true,
        allowCopy: false,
        allowClipboard: false,
        "commandHandler.canCopySelection": () => false,
        "commandHandler.canPasteSelection": () => false,
        layout: $(go.ForceDirectedLayout, {
            defaultSpringLength: 2E2,
            defaultElectricalCharge: 3E2,
            maxIterations: 2E3
        })
    });

    graphProps(graph);
    linkGraphToBackend(graph);

    graph.addDiagramListener("ObjectSingleClicked", function (e) {
        const part = e.subject.part;

        if (!(part instanceof go.Node || part instanceof go.Link)) return;

        if (part instanceof go.Node) {
            showNodeInfo(part.data);
        } else if (part instanceof go.Link) {
            showRelationshipInfo(part.data);
        }
    });
}

function showNodeInfo(data) {
    const sidebar = document.querySelector(".side-bar");
    sidebar.querySelector(".display-class").textContent = " of label " + data.label || "Unnamed Node";

    const display_name = sidebar.querySelector(".display-name");
    display_name.innerHTML = " → ";

    const propertiesList = sidebar.querySelector(".properties ul");
    propertiesList.innerHTML = "";

    editedProperties = {};
    currentEditingNodeId = data.id ?? data.properties?.id ?? null;

    const props = data.properties || {};
    const keys = Object.keys(props);

    display_name.innerHTML += props.displayName;

    keys.forEach(key => {
        if (key !== 'id' && key !== 'displayName') {
            const li = createPropertyInput(key, props[key]);
            propertiesList.appendChild(li);
        }
    });

    const saveChangesButton = document.querySelector(".save-changes-button");
    saveChangesButton.onclick = handleEditProperty;

    const liAddNew = document.createElement("li");
    liAddNew.innerHTML = ` 
        <span class="mx-1" style="cursor: pointer; color: dimgray; font-size: 1.3rem;"> 
            <i class="bi bi-plus-circle-fill"></i>
            <span class="add-new-msg">Add a new property</span> 
        </span>
    `;
    propertiesList.appendChild(liAddNew);

    const addNewIcon = liAddNew.querySelector('span');
    addNewIcon.addEventListener('click', () => {
        const newLi = createPropertyInput("", "");
        propertiesList.insertBefore(newLi, liAddNew);
    });
}

function createPropertyInput(key, value) {
    const li = document.createElement("li");
    li.innerHTML = `  
        <input type="text" style="width:40%" value="${key}" placeholder="Key" class="d-inline-block form-control key-input form-control-sm" />
        <span class="d-inline-block text-center" style="width: 5%;">→</span>
        <input type="text" style="width: 40%" value="${value}" placeholder="Value" class="d-inline-block form-control value-input form-control-sm"/>
        <span class="d-inline-block text-center delete-btn" style="width: 5%; cursor: pointer; color: dimgray; font-size: 1.3rem;">
            <i class="bi bi-trash"></i>
        </span>
    `;

    const keyInput = li.querySelector('.key-input');
    const deleteBtn = li.querySelector('.delete-btn');

    deleteBtn.addEventListener('click', async () => {
        await deleteNodeProperty(currentEditingNodeId, keyInput.value.trim());
        li.remove();
    });

    return li;
}


async function deleteNodeProperty(nodeId, propertyKey) {
    try {
        const response = await fetch(`/api/nodes/delete-property/${nodeId}/${propertyKey}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log(`Property '${propertyKey}' deleted successfully from node ${nodeId}.`);
            await linkGraphToBackend(graph); // Reload the graph or update the node data
        } else {
            console.error(`Failed to delete property '${propertyKey}':`, await response.text());
        }
    } catch (error) {
        console.error("Error occurred while deleting property:", error);
    }
}

async function handleEditProperty() {
    if (!currentEditingNodeId) {
        console.log("No node selected for editing.");
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

    console.log("Saving changes for node:", currentEditingNodeId);
    console.log("Properties to save:", updatedProperties);

    try {
        const response = await fetch(`api/nodes/edit/${currentEditingNodeId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProperties)
        });

        if (response.ok) {
            console.log("Properties updated successfully.");
            await linkGraphToBackend(graph);
        } else {
            console.error("Failed to update properties:", await response.text());
        }
    } catch (error) {
        console.error("Error occurred while updating properties:", error);
    }
}

document.addEventListener("DOMContentLoaded", load_graph);

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

            const response = await makePostJsonBody(postData, "api/nodes/create");

            console.log(response);
            await linkGraphToBackend(graph);

        } catch (error) {
            console.error('Error during node creation:', error);
        }
    } else {
        alert("Please enter a label and at least one property.");
    }
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

deleteButton.addEventListener('click', async function () {
    const selectedNode = graph.selection.first();

    if (selectedNode) {
        const confirmation = confirm("Are you sure you want to delete the selected node?");
        if (confirmation) {
            try {
                graph.commandHandler.deleteSelection();

                console.log("Node deleted in GoJS");

                const nodeId = selectedNode.data.key;

                await makePostPathVar(nodeId, "api/nodes/delete")

                await linkGraphToBackend(graph);

            } catch (error) {
                console.error("Error during node deletion: ", error);
            }
        }
    } else {
        alert("Please select a node to delete.");
    }
});

function populateNodeDropdowns(graph) {
    const node1Select = document.getElementById('node1');
    const node2Select = document.getElementById('node2');
    const form = document.getElementById('connect-nodes-form');

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

    form.onsubmit = function (event) {
        event.preventDefault();
        const node1 = node1Select.value;
        const node2 = node2Select.value;
        console.log("Connecting nodes:", node1, node2);
        createRelationshipBetweenNodes(node1, node2);
    };
}

async function createRelationshipBetweenNodes(startNodeId, endNodeId) {
    try {
        const relationshipType = "any";

        const bodyData = {
            startNodeId: startNodeId,
            destinationNodeId: endNodeId,
            relationshipType: relationshipType,
            properties: {}
        };

        const response = await fetch(`/api/relationships/create/${startNodeId}/${endNodeId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            console.log(`Relationship created successfully.`);
            await linkGraphToBackend(graph);
        } else {
            console.error(`Failed to create relationship:`, await response.text());
        }
    } catch (error) {
        console.error("Error occurred while creating relationship:", error);
    }
}


// function createRelationship()
