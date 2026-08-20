import axios from 'axios';

export const PROJECT_API_BASE_URL = 'http://localhost:8083/api/projects';

export async function createProject(project) {
    const response = await axios.post(PROJECT_API_BASE_URL, project);
    return response.data;
}

export async function getAllProjects() {
    const response = await axios.get(PROJECT_API_BASE_URL);
    return response.data;
}

export async function getProjectById(projectId) {
    const response = await axios.get(`${PROJECT_API_BASE_URL}/${projectId}`);
    return response.data;
}

export async function updateProject(projectId, project) {
    const response = await axios.put(
        `${PROJECT_API_BASE_URL}/${projectId}`,
        project
    );
    return response.data;
}

export async function deleteProject(projectId) {
    const response = await axios.delete(
        `${PROJECT_API_BASE_URL}/${projectId}`
    );
    return response.data;
}

export async function getProjectsByOwner(ownerId) {
    const response = await axios.get(
        `${PROJECT_API_BASE_URL}/owner/${ownerId}`
    );
    return response.data;
}

export async function getIssuesByProject(projectId) {
    const response = await axios.get(
        `${PROJECT_API_BASE_URL}/${projectId}/issues`
    );
    return response.data;
}

export async function getIssuesByProjectName(projectName) {
    const response = await axios.get(
        `${PROJECT_API_BASE_URL}/projectName/${encodeURIComponent(projectName)}/issues`
    );
    return response.data;
}
