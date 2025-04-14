/**
 * This file contains the schema definitions for all MCP tools exposed by the Linear server.
 * These schemas define the input parameters and validation rules for each tool.
 */

export const toolSchemas = {
  linear_auth: {
    name: 'linear_auth',
    description: 'Initialize OAuth authentication flow with Linear. This is the first step in connecting to a Linear workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: {
          type: 'string',
          description: 'Your Linear OAuth client ID from the Linear developer settings',
        },
        clientSecret: {
          type: 'string',
          description: 'Your Linear OAuth client secret from the Linear developer settings',
        },
        redirectUri: {
          type: 'string',
          description: 'The URI where Linear should redirect after authentication',
        },
      },
      required: ['clientId', 'clientSecret', 'redirectUri'],
    },
  },

  linear_auth_callback: {
    name: 'linear_auth_callback',
    description: 'Complete the OAuth flow by handling the callback from Linear with the authorization code.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The authorization code received from Linear after user authorization',
        },
      },
      required: ['code'],
    },
  },

  linear_create_issue: {
    name: 'linear_create_issue',
    description: 'Create a new issue in a specified team with title, description, and optional parameters.',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'ID of the team where the issue will be created',
        },
        title: {
          type: 'string',
          description: 'Title of the issue',
        },
        description: {
          type: 'string',
          description: 'Description of the issue in markdown format',
        },
        assigneeId: {
          type: 'string',
          description: 'ID of the user to assign the issue to (optional)',
        },
        stateId: {
          type: 'string',
          description: 'ID of the issue state (optional)',
        },
        priority: {
          type: 'number',
          description: 'Priority of the issue (0-4, where 0 is no priority, 1 is urgent, 2 is high, 3 is medium, 4 is low) (optional)',
        },
      },
      required: ['teamId', 'title', 'description'],
    },
  },

  linear_create_project_with_issues: {
    name: 'linear_create_project_with_issues',
    description: 'Create a new project and associated issues in one operation. Projects can span multiple teams.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the project',
            },
            description: {
              type: 'string',
              description: 'Description of the project in markdown format (optional)',
            },
            teamIds: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of team IDs this project belongs to (required)',
              minItems: 1
            },
          },
          required: ['name', 'teamIds'],
        },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the issue',
              },
              description: {
                type: 'string',
                description: 'Description of the issue in markdown format',
              },
              teamId: {
                type: 'string',
                description: 'ID of the team where the issue will be created (must match one of the project teamIds)',
              },
            },
            required: ['title', 'description', 'teamId'],
          },
          description: 'List of issues to create with this project',
        },
      },
      required: ['project', 'issues'],
    },
    examples: [
      {
        description: "Create a project with a single team and issue",
        value: {
          project: {
            name: "Q1 Planning",
            description: "Q1 2025 Planning Project",
            teamIds: ["team-id-1"]
          },
          issues: [
            {
              title: "Project Setup",
              description: "Initial project setup tasks",
              teamId: "team-id-1"
            }
          ]
        }
      },
      {
        description: "Create a project with multiple teams",
        value: {
          project: {
            name: "Cross-team Initiative",
            description: "Project spanning multiple teams",
            teamIds: ["team-id-1", "team-id-2"]
          },
          issues: [
            {
              title: "Team 1 Tasks",
              description: "Tasks for team 1",
              teamId: "team-id-1"
            },
            {
              title: "Team 2 Tasks",
              description: "Tasks for team 2",
              teamId: "team-id-2"
            }
          ]
        }
      }
    ]
  },

  linear_bulk_update_issues: {
    name: 'linear_bulk_update_issues',
    description: 'Update multiple issues at once with the same field changes. More efficient than making separate calls for each issue.',
    inputSchema: {
      type: 'object',
      properties: {
        issueIds: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of issue IDs to update',
        },
        update: {
          type: 'object',
          properties: {
            stateId: {
              type: 'string',
              description: 'ID of the workflow state to set for all issues (optional)',
            },
            assigneeId: {
              type: 'string',
              description: 'ID of the user to assign all issues to (optional)',
            },
            priority: {
              type: 'number',
              description: 'Priority level to set for all issues (0-4, where 0 is no priority, 1 is urgent) (optional)',
            },
            labelIds: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of label IDs to apply to all issues (optional)',
            },
            title: {
              type: 'string',
              description: 'New title to set for all issues (optional)',
            },
            description: {
              type: 'string',
              description: 'New description in markdown format to set for all issues (optional)',
            },
            projectId: {
              type: 'string',
              description: 'ID of the project to move all issues to (optional)',
            },
          },
        },
      },
      required: ['issueIds', 'update'],
    },
  },

  linear_search_issues: {
    name: 'linear_search_issues',
    description: 'Search for issues using a query string. Returns matching issues that the authenticated user has access to.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find issues (searches across title, description, ID, etc.)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of issues to return',
          optional: true,
        },
        teamId: {
          type: 'string',
          description: 'Filter issues to a specific team',
          optional: true,
        },
        includeArchived: {
          type: 'boolean',
          description: 'Whether to include archived issues in the results',
          optional: true,
        },
      },
      required: ['query'],
    },
  },

  linear_get_teams: {
    name: 'linear_get_teams',
    description: 'Get a list of all teams in the Linear workspace accessible to the authenticated user.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  linear_get_user: {
    name: 'linear_get_user',
    description: 'Get information about the currently authenticated user, including their name, email, and role.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  linear_delete_issue: {
    name: 'linear_delete_issue',
    description: 'Delete a specific issue from Linear. This action is permanent and cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Issue identifier (e.g., "ABC-123") to delete',
        },
      },
      required: ['id'],
    },
  },

  linear_delete_issues: {
    name: 'linear_delete_issues',
    description: 'Delete multiple issues at once. More efficient than making separate calls for each issue. This action is permanent.',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of issue identifiers (e.g., ["ABC-123", "ABC-124"]) to delete',
        },
      },
      required: ['ids'],
    },
  },

  linear_get_project: {
    name: 'linear_get_project',
    description: 'Get detailed information about a specific project, including its members, status, and related issues.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the project to retrieve',
        },
      },
      required: ['id'],
    },
  },

  linear_search_projects: {
    name: 'linear_search_projects',
    description: 'Search for projects by name or description. Returns matching projects accessible to the authenticated user.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find projects by name or description',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of projects to return (default: 10)',
        },
        includeArchived: {
          type: 'boolean',
          description: 'Whether to include archived projects in the results (default: false)',
        },
      },
      required: ['query'],
    },
  },

  linear_create_issues: {
    name: 'linear_create_issues',
    description: 'Create multiple issues at once in a single team. More efficient than making separate calls for each issue.',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'ID of the team where all issues will be created',
        },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Title of the issue',
              },
              description: {
                type: 'string',
                description: 'Description of the issue in markdown format (optional)',
              },
              assigneeId: {
                type: 'string',
                description: 'ID of the user to assign the issue to (optional)',
              },
              stateId: {
                type: 'string',
                description: 'ID of the issue state (optional)',
              },
              priority: {
                type: 'number',
                description: 'Priority of the issue (0-4, where 0 is no priority, 1 is urgent, 2 is high, 3 is medium, 4 is low) (optional)',
              },
              labelIds: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'List of label IDs to apply to the issue (optional)',
              },
            },
            required: ['title'],
          },
          description: 'List of issues to create, each with its own properties',
        },
      },
      required: ['teamId', 'issues'],
    },
  },

  linear_get_issue: {
    name: 'linear_get_issue',
    description: 'Get detailed information about a specific issue including its description, assignees, status, and more.',
    inputSchema: {
      type: 'object',
      properties: {
        issueId: {
          type: 'string',
          description: 'ID of the issue to retrieve (either the numeric ID or the full identifier like "ABC-123")',
        },
      },
      required: ['issueId'],
    },
  },

  linear_get_projects: {
    name: 'linear_get_projects',
    description: 'Get a list of projects with optional filtering by state or team.',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'ID of the team to filter projects by (optional)',
        },
        filter: {
          type: 'string',
          description: 'Filter string for searching projects (optional)',
        },
        includeArchived: {
          type: 'boolean',
          description: 'Whether to include archived projects in the results (default: false)',
        },
      },
      required: [],
    },
  },

  linear_get_team_states: {
    name: 'linear_get_team_states',
    description: 'Get all workflow states for a specific team (e.g., "Todo", "In Progress", "Done").',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'ID of the team to get workflow states for',
        },
      },
      required: ['teamId'],
    },
  },

  linear_get_team_labels: {
    name: 'linear_get_team_labels',
    description: 'Get all labels for a specific team that can be applied to issues.',
    inputSchema: {
      type: 'object',
      properties: {
        teamId: {
          type: 'string',
          description: 'ID of the team to get labels for',
        },
      },
      required: ['teamId'],
    },
  },
};
