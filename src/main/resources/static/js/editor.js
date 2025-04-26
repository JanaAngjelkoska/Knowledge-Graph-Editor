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

async function linkGraphToBackend(myDiagram) {
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

    // ADD THE LISTENER **HERE**, after myDiagram is created
    myDiagram.addDiagramListener("ObjectSingleClicked", function (e) {
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


async function handleEditProperty(input, data, key) {
    input.focus();

    console.log("Input: ", input)
    console.log("Data", data, " data.id = ", data.key)
    console.log("Key: ", key)

    input.addEventListener('blur', async () => {
        const newValue = input.value;
        try {
            await fetch(`api/nodes/edit/${data.key}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key: key, value: newValue })
            });
            console.log("Property updated successfully");
        } catch (error) {
            console.error('Failed to update property', error);
        }
    }, { once: true });
}

// async function handleDeleteProperty(li, data, key) {
//     if (confirm(`Are you sure you want to delete the node"?`)) {
//         try {
//             await fetch(`api/nodes/delete/${data.id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ key: key })
//             });
//             li.remove();
//             console.log("Property deleted successfully");
//         } catch (error) {
//             console.error('Failed to delete property', error);
//         }
//     }
// }

function showNodeInfo(data) {
    const sidebar = document.querySelector(".side-bar");
    sidebar.querySelector(".display-name").textContent = data.text || "Unnamed Node";

    const propertiesList = sidebar.querySelector(".properties ul");
    propertiesList.innerHTML = "";
    console.log("DATA:", data)
    const props = data.properties || {};
    console.log(props)

    const delete_btn_for_node = document.querySelector('.display-name-bin')
    delete_btn_for_node.innerHTML = `
      <i class="bi bi-trash mx-1 delete-btn-node" style="cursor: pointer; color: dimgray; font-size: 1.3em;"></i>
    `

    const keys = Object.keys(props).sort();
    keys.forEach(key => {
        const value = props[key];
        if (key !== 'id') {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>${key}:</div> 
                <input type="text" value="${value}" style="width: 150px;" />
                <span>
                    <i class="bi bi-trash mx-1 delete-btn" style="cursor: pointer; color: dimgray; font-size: 1.3em;"></i>
                </span>
            `;
            propertiesList.appendChild(li);

            const edit_input = li.querySelector('input');
            const save_changes_button = document.querySelector(".save-changes-button");

            save_changes_button.addEventListener('click', () => handleEditProperty(edit_input, data, key));
            // delete_btn_for_node.addEventListener('click', () => handleDeleteProperty(li, data, key));
        }
    });

    const li_add_new = document.createElement("li");
    li_add_new.innerHTML = `
        <span>
          <i class="bi bi-plus-circle-fill mx-1" style="cursor: pointer; color: dimgray; font-size: 1.3rem;"></i>
          <span class="add-new-msg">Add a new property</span>
        </span>
    `;
    propertiesList.appendChild(li_add_new);
}


