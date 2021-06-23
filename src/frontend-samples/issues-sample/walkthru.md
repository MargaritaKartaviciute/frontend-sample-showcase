# Client Creation

The First step is to create the client. This sample uses an auto-generated typescript client using [Acacode](https://github.com/acacode/swagger-typescript-api). The setup requires a client to be generated based off the OpenAPI definition found in the [Issues API](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/) website, or download [here](https://api.bentley.com/api-metadata/v1/issues-v1/swagger-json). Other client generators may be used as well.

[_metadata_:annotation]:- "CLIENTCREATION"

# Client Setup and Access

Once the client is created, it is initalized with an authentication mechanism and given an accessor in IssuesApi.ts. 

The sample-showcase uses its own authentication mechansim, so apply the required scheme used to access your project information.

*For creating, adding, and enabling a decorator to a sample, follow the 'Marker Pin' Sample's walkthru*

[_metadata_:annotation]:- "CLIENTACCESSOR"

# Project Issues and Issue Details

After a client has been setup, we can now get all the issue associated with a project and the details for each issue. The first endpoint will retrieve a list of issues, and the second will retrieve the details.

Our first step is to setup a useEffect() that will retrieve the issues from the project when the iModel is loaded. 

Notice the call to `client.getProjectIssues()`, this uses the endpoint `/` and will return all issues associated to the project, but none of the detail. The next step is to get the details, corresponding to the endpoint `/{id}` where the id parameter is the id of the issue returned from the `/` endpoint. For each issue id, we will make a call to `client.id.getIssueDetails(issue.id)`.

For a multithreaded approach, a promise is created for each issue in the list returned and the group is awaited. The return gives all the details for the issue such as what the issue is, who created it, location, due date, and a variety of more information.

[GET: Project Issues](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/operations/get-project-issues/)

[GET: Issue Details](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/operations/get-issue-details/)

[_metadata_:annotation]:- "PROJECTISSUES"

# Issue Attachments

Now lets get the attachment metadata associate with each issue and load in each issue's preview. 

Each issue can have attachments associate with it, which can be any type of file. First, the metadata of the attachments must be fetched, which contains the filename, type, size and other pertinent information. 

Initally we only want to load in the preview image, but we might need the rest of the meta data at a later point, so lets store it. A GET request to the endpoint `/{id}/attachments` with `client.id.getIssueAttachments(issue.id)` fetches the meta data, and a GET request to the endpoint `/{id}/attachments/{attachmentId}` with `client.id.getAttachmentById(issue.id, previewAttachmentId)` retrieves the preview. Lets throw in some error checking, and viola! We have the first attachment.

[GET: Issue Attachments](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/operations/get-issue-attachments/)

[GET: Attachment by Id](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/operations/get-attachment-by-id/)

[_metadata_:annotation]:- "ISSUEATTACHMENTS"

# Issue Comments

Comments can also be attached to each issue. 

To receieve the comments, make a call to the endpoint `/{id}/comments`, done with `client.id.getIssueComments(currentIssue.id)` where the id parameter corresponds to the issue id.

[GET: Issue Comments](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/operations/get-issue-comments/)

[_metadata_:annotation]:- "ISSUECOMMENTS"

# Issue Audit Trail

The Issue REST API also contains an audit trail associated with each issue in the project. The audit trail contains a variety of information such as, creation, modification, deletion, assigning, state, and file attaching. The endpoint is useful to understand the history of the issue and its current state.

To receieve audit trail information, make a call to the endpoint `/{id}/auditTrailEntries`, done with `client.id.getIssueAuditTrail(currentIssue.id)` where the id parameter corresponds to the issue id.

[GET: Issue Audit Trail](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/operations/get-issue-audit-trail/)

[_metadata_:annotation]:- "ISSUEAUDITTRAIL"

# Location Data

A common functionality of issues is to show where the issue lies with a camera position. Each issue contains a `camera view` object associated with it. This object contains a vector corresponding to 'up', a vector the camera is facing, and a point corresponding to where on the imodel the camera lies and a field of view. 

With these variables we can make a call to `lookAtUsingLensAngle()` with the appropriate parameters to set the camera position to the issue.

[_metadata_:annotation]:- "ISSUELOCATION"