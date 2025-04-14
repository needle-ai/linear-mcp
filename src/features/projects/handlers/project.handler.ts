import { BaseHandler } from '../../../core/handlers/base.handler.js';
import { BaseToolResponse } from '../../../core/interfaces/tool-handler.interface.js';
import { LinearAuth } from '../../../auth.js';
import { LinearGraphQLClient } from '../../../graphql/client.js';

/**
 * Handler for project-related operations.
 * Manages creating, searching, and retrieving project information.
 */
export class ProjectHandler extends BaseHandler {
  constructor(auth: LinearAuth, graphqlClient?: LinearGraphQLClient) {
    super(auth, graphqlClient);
  }

  /**
   * Creates a new project with associated issues.
   */
  /**
   * Creates a new project with associated issues
   * @example
   * ```typescript
   * const result = await handler.handleCreateProjectWithIssues({
   *   project: {
   *     name: "Q1 Planning",
   *     description: "Q1 2025 Planning Project",
   *     teamIds: ["team-id-1"], // Required: Array of team IDs
   *   },
   *   issues: [{
   *     title: "Project Setup",
   *     description: "Initial project setup tasks",
   *     teamId: "team-id-1"
   *   }]
   * });
   * ```
   */
  async handleCreateProjectWithIssues(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['project', 'issues']);

      // Validate project input
      if (!args.project.teamIds || !Array.isArray(args.project.teamIds) || args.project.teamIds.length === 0) {
        throw new Error(
          'Project requires teamIds as an array with at least one team ID.\n' +
          'Example:\n' +
          '{\n' +
          '  project: {\n' +
          '    name: "Project Name",\n' +
          '    teamIds: ["team-id-1"]\n' +
          '  },\n' +
          '  issues: [{ title: "Issue Title", teamId: "team-id-1" }]\n' +
          '}'
        );
      }

      if (!Array.isArray(args.issues)) {
        throw new Error(
          'Issues parameter must be an array of issue objects.\n' +
          'Example: issues: [{ title: "Issue Title", teamId: "team-id-1" }]'
        );
      }

      // Validate each issue has required teamId
      args.issues.forEach((issue: any, index: number) => {
        if (!issue.teamId) {
          throw new Error(
            `Issue at index ${index} is missing required teamId.\n` +
            'Each issue must have a teamId that matches one of the project teamIds.'
          );
        }
      });

      const result = await client.createProjectWithIssues(
        args.project,
        args.issues
      );

      if (!result.projectCreate.success || (result.issueBatchCreate && !result.issueBatchCreate.success)) {
        throw new Error('Failed to create project or issues');
      }

      const { project } = result.projectCreate;
      const issuesCreated = result.issueBatchCreate?.issues.length ?? 0;

      const response = [
        `Successfully created project with issues`,
        `Project: ${project.name}`,
        `Project URL: ${project.url}`
      ];

      if (issuesCreated > 0) {
        response.push(`Issues created: ${issuesCreated}`);
        // Add details for each issue
        result.issueBatchCreate?.issues.forEach(issue => {
          response.push(`- ${issue.identifier}: ${issue.title} (${issue.url})`);
        });
      }

      return this.createResponse(response.join('\n'));
    } catch (error) {
      this.handleError(error, 'create project with issues');
    }
  }

  /**
   * Gets information about a specific project.
   */
  async handleGetProject(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ['id']);
      
      const includeIssues = args.includeIssues || false;

      try {
        const result = await client.getProject(args.id);
        
        // If issues should be included, fetch them
        if (includeIssues && result && (result as any).project) {
          // We need to fetch issues separately as they're not included in project response
          const issuesResult = await client.searchIssues({ 
            project: { id: { eq: args.id } }
          });
          
          // Add issues to the project response
          if (issuesResult.issues?.nodes) {
            (result as any).project.issues = issuesResult.issues.nodes;
          }
        }

        return this.createJsonResponse(result);
      } catch (error) {
        // Handle specific error for non-existent projects
        if (
          error instanceof Error &&
          (error.message.includes("Entity not found") ||
            error.message.includes("Could not find referenced Project"))
        ) {
          return this.createResponse(`Project with ID "${args.id}" does not exist`);
        }
        
        // Re-throw other errors
        throw error;
      }
    } catch (error) {
      this.handleError(error, 'get project info');
    }
  }

  /**
   * Searches for projects by name.
   */
  async handleSearchProjects(args: any): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      
      // Name or teamIds are required, but not both
      if (!args.name && (!args.teamIds || !Array.isArray(args.teamIds) || args.teamIds.length === 0)) {
        throw new Error("At least a project name or teamIds must be provided for search");
      }

      // Build the filter
      const filter: Record<string, any> = {};

      if (args.name) {
        filter.name = { contains: args.name };
      }

      if (args.teamIds && args.teamIds.length > 0) {
        filter.team = { id: { in: args.teamIds } };
      }
      
      const first = args.first || 50;
      const includeArchived = args.includeArchived || false;

      const result = await client.searchProjects(filter, first);
      
      // Filter out archived projects if not including them
      if (!includeArchived && result.projects?.nodes) {
        result.projects.nodes = result.projects.nodes.filter(
          (project) => {
            const projectWithState = project as any;
            return !["Archived", "Canceled", "Completed"].includes(projectWithState.state || "");
          }
        );
      }

      if (result.projects?.nodes.length === 0) {
        return this.createResponse(
          `No projects found matching the search criteria ${args.name ? `'${args.name}'` : ""}`
        );
      }

      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, 'search projects');
    }
  }
}
