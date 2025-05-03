// Function to set badge number and time string for any node type (video, article, podcast)
window.setNodeBadge = function(nodeId, badgeNumber, timeString) {
  // Wait for the React app to fully initialize
  setTimeout(() => {
    // Check if the function exists in the React app
    if (typeof window.__REACTFLOW_INSTANCE !== 'undefined') {
      try {
        // Get the current nodes
        const { getNodes, setNodes } = window.__REACTFLOW_INSTANCE;
        const nodes = getNodes();
        
        // Find the node with the given ID
        const nodeIndex = nodes.findIndex(node => node.id === nodeId);
        
        if (nodeIndex === -1) {
          console.error(`Node with ID ${nodeId} not found`);
          return;
        }
        
        // Check if the node is a supported type (video, article, podcast)
        const nodeType = nodes[nodeIndex].type;
        if (!['video', 'article', 'podcast'].includes(nodeType)) {
          console.error(`Node with ID ${nodeId} is not a supported node type (video, article, podcast)`);
          return;
        }
        
        // Update the node data
        const updatedNodes = [...nodes];
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          data: {
            ...updatedNodes[nodeIndex].data,
            badgeNumber: badgeNumber !== undefined ? badgeNumber : undefined,
            timeString: timeString || undefined
          }
        };
        
        // Set the updated nodes
        setNodes(updatedNodes);
        console.log(`Updated ${nodeType} node ${nodeId} with badge number ${badgeNumber} and time string ${timeString}`);
      } catch (error) {
        console.error('Error updating node:', error);
      }
    } else {
      console.error('ReactFlow instance not available yet. Try again later.');
    }
  }, 1000); // Give the app 1 second to initialize
};

// Function to process all nodes in a workflow and set badges based on data
window.processBadgesFromWorkflow = function(workflowData) {
  if (!workflowData || !workflowData.nodes || !Array.isArray(workflowData.nodes)) {
    console.error('Invalid workflow data');
    return;
  }
  
  // Process each node in the workflow
  workflowData.nodes.forEach(node => {
    // Check if the node has badge data
    if (node.data && (node.data.badgeNumber !== undefined || node.data.timeString)) {
      // Set the badge for this node
      window.setNodeBadge(node.id, node.data.badgeNumber, node.data.timeString);
    }
  });
  
  console.log('Processed badges for all nodes in workflow');
};

// Handle file selection for both load types
document.getElementById('loadInput').onchange = function(e) {
  const file = e.target.files[0];
  // Reset the input value to allow loading the same file again
  e.target.value = null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      // Fix the typo in 'result'
      const data = JSON.parse(evt.target.result);
      const isLocked = window.loadMode === 'locked';
      const finalData = { ...data, isLocked: isLocked }; // Set isLocked based on mode

      if (window.loadDataIntoReact) {
        window.loadDataIntoReact(finalData);
        
        // Process badges after loading the workflow (with a delay to ensure it's rendered)
        setTimeout(() => {
          window.processBadgesFromWorkflow(finalData);
        }, 1500);
      } else {
        alert("Editor not ready yet!");
      }
    } catch (err) {
      console.error("Error loading workflow:", err);
      alert("Invalid workflow file.");
    }
  };
  reader.onerror = function() {
    alert("Error reading file.");
  };
  reader.readAsText(file);
};

// Example usage:
// Set badge number 1 and time string "3 days" for a node with ID "video-123"
// window.setNodeBadge('video-123', 1, '3 days');

// Set badge number 2 and time string "5 days" for a node with ID "article-456"
// window.setNodeBadge('article-456', 2, '5 days');

// Set badge number 3 and time string "1 week" for a node with ID "podcast-789"
// window.setNodeBadge('podcast-789', 3, '1 week');
