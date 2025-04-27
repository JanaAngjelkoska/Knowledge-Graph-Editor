import {makeGet, makePostJsonBody, makePostPathVar} from './requests.js';


// UI SETUP
const $ = go.GraphObject.make;
const deleteButton = document.getElementById('delete-btn');
let graph;
let editedProperties = {};
let currentEditingNodeId = null;


function graphStyleProps(graph) {
    graph.nodeTemplate =
        $(go.Node, "Auto",
            $(go.Shape, "Circle", {
                fill: "#328da2",
                stroke: "#1b5970",
                strokeWidth: 2,
                width: 100,
                height: 100
            }),
            $(go.TextBlock, {
                    margin: 6,
                    font: "bold 14px Montserrat",
                    textAlign: "center",
                    stroke: "white"
                },
                new go.Binding("text", "text"))
        );
}

async function linkGraphToBackend(graph) {
    const nodes = await makeGet("api/nodes");
    const edges = await makeGet("api/relationships");

    const nodeDataArray = nodes.map(node => ({
        key: node.properties.id,
        text: node.labels[0],
        properties: node.properties
    }));

    const linkDataArray = edges.map(edge => ({
        from: edge.startNodeId,
        to: edge.destinationNodeId
    }));

    graph.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}

function load_graph() {
    graph = $(go.Diagram, "graphDiv", {
        "undoManager.isEnabled": true,
        allowCopy: false,
        allowClipboard: false,
        "commandHandler.canCopySelection": () => false,
        "commandHandler.canPasteSelection": () => false,
        layout: $(go.ForceDirectedLayout, {
            defaultSpringLength: 200,
            defaultElectricalCharge: 300,
            maxIterations: 1000
        })
    });

    graphStyleProps(graph);
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
    sidebar.querySelector(".display-name").textContent = data.text || "Unnamed Node";

    const propertiesList = sidebar.querySelector(".properties ul");
    propertiesList.innerHTML = "";

    editedProperties = {};
    currentEditingNodeId = data.properties.id;

    const props = data.properties || {};
    const keys = Object.keys(props).sort();

    keys.forEach(key => {
        if (key !== 'id') {
            const li = createPropertyInput(key, props[key]);
            propertiesList.appendChild(li);
        }
    });

    const saveChangesButton = document.querySelector(".save-changes-button");
    saveChangesButton.onclick = handleEditProperty;

    const liAddNew = document.createElement("li");
    liAddNew.innerHTML = `
        <span>
            <i class="bi bi-plus-circle-fill mx-1" style="cursor: pointer; color: dimgray; font-size: 1.3rem;"></i>
            <span class="add-new-msg">Add a new property</span>
        </span>
    `;
    propertiesList.appendChild(liAddNew);

    const addNewIcon = liAddNew.querySelector('i');
    addNewIcon.addEventListener('click', () => {
        const newLi = createPropertyInput("", "");
        propertiesList.insertBefore(newLi, liAddNew);
    });
}

function createPropertyInput(key, value) {
    const li = document.createElement("li");
    li.innerHTML = `
        <input type="text" value="${key}" placeholder="Key" style="width: 70px; margin-right: 5px;" class="key-input" />
        <input type="text" value="${value}" placeholder="Value" style="width: 150px;" class="value-input" />
        <span>
            <i class="bi bi-trash mx-1 delete-btn" style="cursor: pointer; color: dimgray; font-size: 1.3em;"></i>
        </span>
    `;

    const keyInput = li.querySelector('.key-input');
    const valueInput = li.querySelector('.value-input');
    const deleteBtn = li.querySelector('.delete-btn');

    function updateEditedProperties() {
        if (editedProperties[keyInput.value]) {
            delete editedProperties[keyInput.value];
        }

        if (keyInput.value.trim() !== "") {
            editedProperties[keyInput.value] = valueInput.value;
        }
    }

    keyInput.addEventListener('input', updateEditedProperties);
    valueInput.addEventListener('input', updateEditedProperties);

    deleteBtn.addEventListener('click', () => {
        delete editedProperties[keyInput.value];
        li.remove();
    });

    return li;
}

async function handleEditProperty() { // todo: make delete properties propage to db
    if (!currentEditingNodeId) {
        console.log("No node selected for editing.");
        return;
    }

    const sidebar = document.querySelector(".side-bar");
    const propertiesList = sidebar.querySelectorAll(".properties ul li");

    const updatedProperties = {};

    propertiesList.forEach(li => {
        const keyInput = li.querySelector('.key-input');
        const valueInput = li.querySelector('.value-input');

        if (keyInput && valueInput) {
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
            console.log("Properties updated successfully");
            linkGraphToBackend(graph);
        } else {
            console.error('Failed to update properties', await response.text());
        }
    } catch (error) {
        console.error('Error occurred while updating properties', error);
    }
}

// LISTENERS

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
        const value = li.querySelector(".property-value").value.trim();
        if (key && value) {
            properties[key] = value;
        }
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
