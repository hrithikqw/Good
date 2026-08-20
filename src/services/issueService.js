import axios from 'axios';

export const ISSUE_API_BASE_URL = 'http://localhost:8082/api/issues';

export const ISSUE_STATUSES = [
    { value: 'OPEN', label: 'TO-DO' },
    { value: 'IN_PROGRESS', label: 'DEVELOPMENT' },
    { value: 'RESOLVED', label: 'TESTING' },
    { value: 'CLOSED', label: 'COMPLETED' }
];

const statusAliases = {
    OPEN: 'OPEN',
    TO_DO: 'OPEN',
    IN_PROGRESS: 'IN_PROGRESS',
    ONGOING: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    TESTING: 'RESOLVED',
    REVIEWING: 'RESOLVED',
    CLOSED: 'CLOSED',
    COMPLETED: 'CLOSED'
};

export function normalizeIssueStatus(status) {
    const value = String(status || '')
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, '_');

    return statusAliases[value] || value;
}

export async function createIssue(issue) {
    const response = await axios.post(ISSUE_API_BASE_URL, issue);
    return response.data;
}

export async function getAllIssues() {
    const response = await axios.get(ISSUE_API_BASE_URL);
    return response.data;
}

export async function getIssueById(issueId) {
    const response = await axios.get(`${ISSUE_API_BASE_URL}/${issueId}`);
    return response.data;
}

export async function updateIssue(issueId, issue) {
    const response = await axios.put(
        `${ISSUE_API_BASE_URL}/${issueId}`,
        issue
    );
    return response.data;
}

export async function getIssuesByProject(issueProjectId) {
    if (!issueProjectId || issueProjectId === 'all') {
        return getAllIssues();
    }
    const response = await axios.get(
        `${ISSUE_API_BASE_URL}/project/${issueProjectId}`
    );
    return response.data;
}

export async function getIssuesByAssignee(assigneeId) {
    if (!assigneeId || assigneeId === 'all') {
        return getAllIssues();
    }
    const response = await axios.get(
        `${ISSUE_API_BASE_URL}/assignee/${assigneeId}`
    );
    return response.data;
}
