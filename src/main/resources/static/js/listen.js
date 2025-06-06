import * as Requests from "./requests.js";
import * as GraphConfig from './graphconf.js';
import {
    loadGraph,
    linkGraphToBackend,
    deleteEntity,
    killConnectingState,
    graph,
    killConnectionButton,
    deleteButton, create_node_msg, create_rel_msg
} from './editor.js';

const cellSizeInput = document.getElementById('cellSize');
const graphTypeLayoutItems = document.querySelectorAll('.dropdown-item');


document.addEventListener("DOMContentLoaded", loadGraph);

cellSizeInput.addEventListener('change', async () => {
    GraphConfig.setGridDim(
        parseInt(cellSizeInput.value)
    );
});


graphTypeLayoutItems.forEach(item => {
    item.addEventListener('click', async (e) => {
        e.preventDefault();
        const selectedLayout = item.getAttribute('data-value');

        const graphTypeButton = document.getElementById('graphType');

        graphTypeButton.innerHTML = item.innerHTML;

        GraphConfig.setLayout(
            selectedLayout.toLowerCase()
        );
    });
});

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

            console.log(properties)

            await Requests.makePostJsonBody(postData, "api/nodes/create");
            create_node_msg.innerHTML = `
                <i class="bi bi-check-circle"></i>
                <span class="me-1">Node Created.</span>
            `
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
                relationshipType: relationshipType.toString().trim(),
                properties: properties
            };

            await Requests.makePostJsonBody(postData, `api/relationships/create/${fromNodeId}/${toNodeId}`);
            create_rel_msg.innerHTML = `
                <i class="bi bi-check-circle"></i>
                <span class="me-1">Relationship Created.</span>
            `
            await linkGraphToBackend(graph);


        } catch (error) {
            console.error('Error during relationship creation:', error);
        }
    } else {
        alert("Please fill in all fields and at least one property.");
    }

    killConnectingState();

});


document.querySelector("#resetConnectingButton").addEventListener('click', killConnectingState);

document.querySelector("#snapToGridSwitch").addEventListener('change', async (event) => {
    let snapToGrid = event.target.checked;

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
killConnectionButton.addEventListener('click', killConnectingState);