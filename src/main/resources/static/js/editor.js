import * as Requests from './requests.js';
import * as GraphConfig from "./graphconf.js";

const $ = go.GraphObject.make;

// ================== --------------------------- =================
// ================= |    Export assignments    | =================
// ================== -------------------------- =================

export let graph;
export const deleteButton = document.getElementById('delete-btn');
export let killConnectionButton = document.getElementById('resetConnectingButton');
export let create_rel_msg = document.querySelector('.confirmation-message-create-rel')
export let create_node_msg = document.querySelector('.confirmation-message-create')
export const labelColorMap = {};

// ================== --------------------------- =================
// ================= |    Local  assignments    | =================
// ================== -------------------------- =================

let editedProperties = {};

let currentEditingEntity = null;
let currentlyConnectingFromEntity = null;
let currentlyConnectingToEntity = null;
let currentlyConnectingStatus = false;

let save_changes_msg = document.querySelector('.confirmation-message')

// ================== --------------------------- =================
// ================= |     Export functions     | =================
// ================== -------------------------- =================

export function killConnectingState() {
    document.getElementById("statusCurrentlyConnectingTo").style.display = 'none';
    currentlyConnectingFromEntity = null;
    currentlyConnectingToEntity = null;
    currentEditingEntity = null;
    currentlyConnectingStatus = false;
}

export async function linkGraphToBackend(graph) {

    const nodes = await Requests.makeGet("api/nodes");
    const edges = await Requests.makeGet("api/relationships");

    const nodeDataArray = nodes.map(node => ({
        key: node.properties.id,
        text: node.properties.displayName.trim(),
        label: node.labels[0],
        properties: node.properties
    }));

    const linkDataArray = edges.map(edge => ({
        from: edge.startNodeId,
        id: edge.properties.id,
        to: edge.destinationNodeId,
        text: edge.relationshipType.trim(),
        startId: edge.properties.startNodeId,
        endId: edge.properties.endId,
        properties: edge.properties
    }));

    graph.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    populateNodeDropdowns(graph);

}

export function loadGraph() {
    graph = $(go.Diagram, "graphDiv", GraphConfig.graphSettings);

    GraphConfig.graphPropsApply(graph);
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

export function showInfo(data, type) {
    const sidebar = document.querySelector(".side-bar");
    const props = data.properties || {};

    if (type === "Node") {
        showLabelForNode(sidebar, data, props)
    } else {
        showLabelForRelationship(sidebar, data, props)
    }

    showPropertiesForAllTypes(sidebar, data, props, type)
}

export async function deleteEntity() {
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
                    await Requests.makePostPathVar(nodeId, "api/nodes/delete");

                } else if (currentEntityType === "Relationship") {
                    graph.commandHandler.deleteSelection();
                    const relationshipId = selectedEntity.data.id;
                    await Requests.makePostPathVar(relationshipId, "api/relationships/delete");
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

export function enableConnectingStatus() {
    currentlyConnectingStatus = true;
}

// ================== --------------------- =================
// ================= | Std. Functionality | ==================
// ================== -------------------- =================

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
        <span class="mx-1 text-center" style="cursor: url('img/click.png') 0 0, auto; color: dimgray; font-size: 1.3rem;"> 
            <i class="bi bi-plus-circle-dotted clickable"></i>
            <span class="add-new-msg clickable ">Add a new property</span> 
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
        await Requests.makePatchJsonBody(updatedProperties, link_call)
        save_changes_msg.innerHTML = `
        <i class="bi bi-check-circle me"></i>
        <span>Changes saved</span>
        `
        await linkGraphToBackend(graph);
    } catch (error) {
        console.error("Error occurred while updating properties: ", error);
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