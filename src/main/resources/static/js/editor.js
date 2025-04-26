import * as req from './requests.js';
import {makeGet, makePostPathVar} from "./requests.js";

document.addEventListener("DOMContentLoaded", load_graph);

// UI SETUP
const $ = go.GraphObject.make;

let graph;
const deleteButton = document.getElementById('delete-btn');
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
        from: edge.startNodeId, // where the link starts
        to: edge.destinationNodeId  // where the link points
    }));


    console.log(nodes);
    console.log(edges);
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
            maxIterations: 1E3
        })
    });

    graphStyleProps(graph);
    linkGraphToBackend(graph);

    graph.addDiagramListener("ObjectSingleClicked", function (e) {
        const part = e.subject.part;

        if (!(part instanceof go.Node || part instanceof go.Link)) return;

        if (part instanceof go.Node) {
            console.log("PART WITH AND WITHOUT DATA: ", part)
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

    editedProperties = {}; // Reset edited properties
    currentEditingNodeId = data.properties.id; // Save current node id

    const props = data.properties || {};
    const keys = Object.keys(props).sort();

    keys.forEach(key => {
        const value = props[key];
        if (key !== 'id') {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>${key}:</div> 
                <input type="text" value="${value}" style="width: 150px;" data-key="${key}" />
                <span>
                    <i class="bi bi-trash mx-1 delete-btn" style="cursor: pointer; color: dimgray; font-size: 1.3em;"></i>
                </span>
            `;
            propertiesList.appendChild(li);

            const input = li.querySelector('input');

            // Listen for user edits
            input.addEventListener('input', () => {
                editedProperties[key] = input.value;
            });
        }
    });

    const save_changes_button = document.querySelector(".save-changes-button");
    save_changes_button.onclick = handleEditProperty; // Set up save button once

    const li_add_new = document.createElement("li");
    li_add_new.innerHTML = `
        <span>
          <i class="bi bi-plus-circle-fill mx-1" style="cursor: pointer; color: dimgray; font-size: 1.3rem;"></i>
          <span class="add-new-msg">Add a new property</span>
        </span>
    `;
    propertiesList.appendChild(li_add_new);
}

async function handleEditProperty() {
    if (!currentEditingNodeId || Object.keys(editedProperties).length === 0) {
        console.log("Nothing to save.");
        return;
    }

    console.log("Saving changes for node:", currentEditingNodeId);
    console.log("Properties to save:", editedProperties);

    try {
        const response = await fetch(`api/nodes/edit/${currentEditingNodeId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editedProperties)
        });

        if (response.ok) {
            console.log("Properties updated successfully");
            editedProperties = {};
            linkGraphToBackend(graph);
        } else {
            console.error('Failed to update properties', await response.text());
        }
    } catch (error) {
        console.error('Error occurred while updating properties', error);
    }
}

// Get the delete button element

// Add event listener for the delete button
deleteButton.addEventListener('click', async function() {
    const selectedNode = graph.selection.first(); // Use selection.first() to get the first selected node

    if (selectedNode) {
        const confirmation = confirm("Are you sure you want to delete the selected node?");
        if (confirmation) {
            try {
                // Delete the node in the GoJS diagram
                graph.commandHandler.deleteSelection();

                console.log("Node deleted in GoJS");


                const nodeId = selectedNode.data.key;

                // Send POST request to the backend to delete the node
                const response = await makePostPathVar(nodeId, "api/nodes/delete")

                if (response.ok) {
                    console.log("Node successfully deleted in the backend");
                } else {
                    console.error("Failed to delete node in the backend:", await response.text());
                }
            } catch (error) {
                console.error("Error during node deletion:", error);
            }
        }
    } else {
        alert("Please select a node to delete.");
    }
});