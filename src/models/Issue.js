export default class Issue {
    constructor(
        id,
        projectId,
        description,
        summary,
        sprint,
        storyPoint,
        tags,
        assignee,
        createdOn,
        lastUpdated,
        priority,
        status,
        createdBy,
        type
    ) {
        this.id = id;
        this.projectId = projectId;
        this.description = description;
        this.summary = summary;
        this.sprint = sprint;
        this.storyPoint = storyPoint;
        this.tags = tags;
        this.assignee = assignee;
        this.createdOn = createdOn;
        this.lastUpdated = lastUpdated;
        this.priority = priority;
        this.status = status;
        this.createdBy = createdBy;
        this.type = type;
    }
}
