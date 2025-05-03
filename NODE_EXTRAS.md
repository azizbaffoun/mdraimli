# Node Extras Documentation

This document explains how to use the badge number and timer functionality for Video, Article, and Podcast nodes.

## Overview

The workflow editor now supports displaying additional information on nodes:

1. **Badge Number**: A numeric value displayed before the node name (e.g., "1 Video")
2. **Timer Icon with Time String**: A timer icon with a text string (e.g., "3 days")

The badge number and timer icon inherit the color of their parent node, while the time string appears in black, providing a consistent visual appearance.

## How to Use

### In Your JSON Data

When creating or loading a workflow, you can include `badgeNumber` and `timeString` properties in the node data:

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "video",
      "position": { "x": 100, "y": 100 },
      "data": {
        "title": "Video Tutorial",
        "badgeNumber": 1,
        "timeString": "3 days"
      }
    }
  ]
}
```

### In Your JavaScript Code

When programmatically creating nodes, you can set these properties:

```javascript
const videoNode = {
  id: generateId(),
  type: 'video',
  position: { x: 100, y: 100 },
  data: {
    title: 'Video Tutorial',
    badgeNumber: 1,
    timeString: '3 days'
  }
};
```

### Handling Null Values

Both `badgeNumber` and `timeString` can be set to `null` to hide them:

```javascript
// No badge or timer will be displayed
const videoNode = {
  id: generateId(),
  type: 'video',
  position: { x: 100, y: 100 },
  data: {
    title: 'Video Tutorial',
    badgeNumber: null,
    timeString: null
  }
};
```

## Supported Node Types

This functionality is available for the following node types:

- Video nodes
- Article nodes
- Podcast nodes

## Example

A sample workflow JSON file (`sample-workflow.json`) is included in the project to demonstrate this functionality.

## Integration

When integrating with your application, you can modify the node data during the loading process to include these properties. See the example in `w.html` for how to add these properties when loading a workflow.
