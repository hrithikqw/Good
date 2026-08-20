import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { getIssueById, updateIssue, getAllIssues } from '../services/issueService';
import { getProjectById } from '../services/projectService';
import {
    getProfileFallback,
    getProfileImage,
    getUserById
} from '../services/userService';

function AssigneeIssueDetails() {
    const { issueId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [issue, setIssue] = useState(null);
    const [project, setProject] = useState(null);
    const [assignee, setAssignee] = useState(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // ---- ADDED: assignee sidebar count ----
    const [assignedCount, setAssignedCount] = useState(0);

    useEffect(() => {
        if (!user?.userId) {
            return;
        }

        const loadCount = async () => {
            try {
                const allIssues = await getAllIssues();
                setAssignedCount(
                    allIssues.filter(
                        (item) => Number(item.assignee) === Number(user.userId)
                    ).length
                );
            } catch {
                setAssignedCount(0);
            }
        };

        loadCount();
    }, [user?.userId]);
    // ---------------------------------------

    useEffect(() => {
        const load = async () => {
            try {
                const issueData = await getIssueById(issueId);
                setIssue(issueData);
                setStatus(issueData.status);

                const [projectData, assigneeData] = await Promise.all([
                    getProjectById(issueData.projectId),
                    getUserById(issueData.assignee)
                ]);

                setProject(projectData);
                setAssignee(assigneeData);
            } catch (err) {
                setError(
                    err.response?.data?.message || 'Unable to load issue details.'
                );
            }
        };

        load();
    }, [issueId]);

    const handleSave = async () => {
        if (!issue) return;

        setSaving(true);
        setError('');

        try {
            const updated = await updateIssue(issue.id, {
                ...issue,
                status
            });

            setIssue(updated);
            setStatus(updated.status);
        } catch (err) {
            setError(
                err.response?.data?.message || 'Unable to save updates.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="case-dashboard">
            <Sidebar issuesCount={assignedCount} />

            <main className="case-main">
                {error && !issue ? (
                    <div className="alert alert-danger m-4">{error}</div>
                ) : !issue ? (
                    <div className="text-center p-5">Loading...</div>
                ) : (
                    <div className="case-form-page">
                        <div className="case-form-card wide">
                            <div className="case-title-bar">Issue Tracking System</div>
                            <div className="p-4">
                                <small>
                                    {project?.projectName || 'Project'} / Issue Details
                                </small>
                                <h2 className="mb-4">{issue.summary}</h2>

                                {error && (
                                    <div className="alert alert-danger">{error}</div>
                                )}

                                <div className="mb-4">
                                    <h5>Description</h5>
                                    <p>{issue.description || '-'}</p>
                                </div>

                                <div className="row issue-details-grid">
                                    <div className="col-md-6">
                                        <p><strong>Type:</strong> {issue.type}</p>
                                        <p><strong>Tags:</strong> {issue.tags || '-'}</p>
                                        <p><strong>Story Point:</strong> {issue.storyPoint}</p>
                                    </div>
                                    <div className="col-md-6">
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
                                        <p><strong>Sprint:</strong> {issue.sprint}</p>
                                    </div>
                                </div>

                                <div className="row align-items-end mt-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="OPEN">TO-DO</option>
                                            <option value="IN_PROGRESS">DEVELOPMENT</option>
                                            <option value="RESOLVED">TESTING</option>
                                            <option value="CLOSED">COMPLETED</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <button
                                            className="btn case-primary-btn"
                                            disabled={saving || status === issue.status}
                                            onClick={handleSave}
                                        >
                                            {saving ? 'Saving...' : 'Save Updates'}
                                        </button>
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

export default AssigneeIssueDetails;