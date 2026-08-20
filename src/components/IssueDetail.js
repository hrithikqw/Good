import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { getIssueById, getAllIssues } from '../services/issueService';
import { getProjectById, getProjectsByOwner } from '../services/projectService';
import {
    getProfileFallback,
    getProfileImage,
    getUserById
} from '../services/userService';

function IssueDetail() {
    const { issueId } = useParams();
    const { user, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [project, setProject] = useState(null);
    const [assignee, setAssignee] = useState(null);
    const [error, setError] = useState('');

    // ---- ADDED: sidebar counts (same as CreateProjectForm) ----
    const [projectsCount, setProjectsCount] = useState(0);
    const [createdIssueCount, setCreatedIssueCount] = useState(0);

    useEffect(() => {
        if (!isLoggedIn || Number(user?.role) !== 1) {
            return;
        }

        const loadCounts = async () => {
            try {
                const [projectData, allIssues] = await Promise.all([
                    getProjectsByOwner(user.userId),
                    getAllIssues()
                ]);

                setProjectsCount(projectData.length);
                setCreatedIssueCount(
                    allIssues.filter(
                        (item) => Number(item.createdBy) === Number(user.userId)
                    ).length
                );
            } catch {
                setProjectsCount(0);
                setCreatedIssueCount(0);
            }
        };

        loadCounts();
    }, [isLoggedIn, user?.userId, user?.role]);
    // -----------------------------------------------------------

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (Number(user?.role) !== 1) {
            navigate('/assignee-dashboard');
            return;
        }

        const load = async () => {
            try {
                const issueData = await getIssueById(issueId);
                setIssue(issueData);
            } catch (err) {
                setError(
                    err.response?.data?.message || 'Unable to load issue details.'
                );
            }
        };

        load();
    }, [issueId, isLoggedIn, navigate, user]);

    useEffect(() => {
        if (!issue) {
            return;
        }

        const loadRelatedData = async () => {
            const [projectResult, assigneeResult] = await Promise.allSettled([
                getProjectById(issue.projectId),
                getUserById(issue.assignee)
            ]);

            if (projectResult.status === 'fulfilled') {
                setProject(projectResult.value);
            }

            if (assigneeResult.status === 'fulfilled') {
                setAssignee(assigneeResult.value);
            }
        };

        loadRelatedData();
    }, [issue]);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="case-dashboard">
            <Sidebar projectsCount={projectsCount} issuesCount={createdIssueCount} />

            <main className="case-main">
                {error ? (
                    <div className="alert alert-danger m-4">{error}</div>
                ) : !issue ? (
                    <div className="text-center p-5">Loading...</div>
                ) : (
                    <div className="case-form-page">
                        <div className="case-form-card wide">
                            <div className="case-title-bar">Issue Tracking System</div>
                            <div className="p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <small>
                                            {project?.projectName || 'Project'} / Issue Details
                                        </small>
                                        <h2>{issue.summary}</h2>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/project-dashboard')}
                                        >
                                            Back
                                        </button>
                                        <button
                                            className="btn case-primary-btn"
                                            style={{ backgroundColor: '#F5B301', color: '#000', border: 'none', fontWeight: '600' }}
                                            onClick={() => navigate(`/issue/${issue.id}/edit`)}
                                        >
                                            Edit Issue
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h5>Description</h5>
                                    <p>{issue.description || '-'}</p>
                                </div>

                                <div className="row issue-details-grid">
                                    <div className="col-md-6">
                                        <p><strong>Type:</strong> {issue.type}</p>
                                        <p><strong>Tags:</strong> {issue.tags || '-'}</p>
                                        <p><strong>Story Points:</strong> {issue.storyPoint}</p>
                                        <p><strong>Sprint:</strong> {issue.sprint}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Status:</strong> {issue.status}</p>
                                        <p><strong>Priority:</strong> {issue.priority}</p>
                                        <p>
                                            <strong>Assignee:</strong>{' '}
                                            <img
                                                src={getProfileImage(assignee) || getProfileFallback(assignee)}
                                                alt={assignee?.name || 'Assignee'}
                                                className="detail-profile-image"
                                                onError={(event) => {
                                                    event.currentTarget.src = getProfileFallback(assignee);
                                                }}
                                            />
                                            {assignee?.name || issue.assignee}
                                        </p>
                                        <p><strong>Created On:</strong> {issue.createdOn || '-'}</p>
                                        <p><strong>Last Updated:</strong> {issue.lastUpdated || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default IssueDetail; 