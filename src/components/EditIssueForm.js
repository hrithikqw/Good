
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getIssueById,
    updateIssue,
    getAllIssues,
    normalizeIssueStatus
} from '../services/issueService';
import { getAllUsers } from '../services/userService';
import { getAllProjects, getProjectsByOwner } from '../services/projectService';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

function EditIssueForm() {
    const { issueId } = useParams();
    const { user, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [initialForm, setInitialForm] = useState(null);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

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
                const [issue, projectData, userData] = await Promise.all([
                    getIssueById(issueId),
                    getAllProjects(),
                    getAllUsers()
                ]);

                const initial = {
                    ...issue,
                    sprint: issue.sprint ?? '',
                    storyPoint: issue.storyPoint ?? '',
                    tags: issue.tags ?? '',
                    description: issue.description ?? '',
                    status: normalizeIssueStatus(issue.status)
                };
                setForm(initial);
                setInitialForm(initial);
                setProjects(projectData);
                setUsers(userData.filter((item) => Number(item.role) === 0));
            } catch (error) {
                setServerError(
                    error.response?.data?.message || 'Unable to load issue.'
                );
            }
        };

        load();
    }, [issueId, isLoggedIn, navigate, user]);

    const validate = () => {
        const next = {};

        if (!form.summary.trim()) {
            next.summary = 'Summary is required.';
        } else if (form.summary.length > 150) {
            next.summary = 'Summary must not exceed 150 characters.';
        } else if (/[{}[\]\\]/.test(form.summary)) {
            next.summary = 'Summary contains invalid characters.';
        }

        if (!form.projectId) next.projectId = 'Project is required.';
        if (!form.type) next.type = 'Type is required.';
        if (!form.priority) next.priority = 'Priority is required.';
        if (!form.assignee) next.assignee = 'Assignee is required.';

        if (form.description.length > 500) {
            next.description = 'Description must not exceed 500 characters.';
        }

        if (form.tags.length > 100) {
            next.tags = 'Tags must not exceed 100 characters.';
        }

        if (!Number.isInteger(Number(form.storyPoint)) || Number(form.storyPoint) <= 0) {
            next.storyPoint = 'Story Point must be a positive integer.';
        }

        if (!Number.isInteger(Number(form.sprint)) || Number(form.sprint) <= 0) {
            next.sprint = 'Sprint must be a positive integer.';
        }

        return next;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({ ...previous, [name]: '' }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            const updated = await updateIssue(issueId, {
                ...form,
                projectId: Number(form.projectId),
                assignee: Number(form.assignee),
                storyPoint: Number(form.storyPoint),
                sprint: form.sprint,
                status: form.status
            });

            navigate(`/issue/${updated.id}`);
        } catch (error) {
            setServerError(
                error.response?.data?.message || 'Unable to update issue.'
            );
        }
    };

    if (!isLoggedIn || Number(user?.role) !== 1) {
        return null;
    }

    return (
        <div className="case-dashboard">
            <Sidebar projectsCount={projectsCount} issuesCount={createdIssueCount} />

            <main className="case-main">
                {!form ? (
                    <div className="text-center p-5">Loading...</div>
                ) : (
                    <div className="case-form-page">
                        <div className="case-form-card wide">
                            <div className="case-title-bar">Issue Tracking System</div>
                            <div className="p-4">
                                <h3>Edit Issue</h3>

                                {serverError && (
                                    <div className="alert alert-danger">{serverError}</div>
                                )}

                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Summary</label>
                                                <input
                                                    name="summary"
                                                    maxLength="150"
                                                    className={`form-control ${errors.summary ? 'is-invalid' : ''}`}
                                                    value={form.summary}
                                                    onChange={handleChange}
                                                />
                                                {errors.summary && (
                                                    <div className="invalid-feedback">{errors.summary}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Project</label>
                                                <select
                                                    name="projectId"
                                                    className={`form-select ${errors.projectId ? 'is-invalid' : ''}`}
                                                    value={form.projectId}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Project</option>
                                                    {projects.map((project) => (
                                                        <option key={project.id} value={project.id}>
                                                            {project.projectName}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.projectId && (
                                                    <div className="invalid-feedback">{errors.projectId}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    name="description"
                                                    maxLength="500"
                                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                                    value={form.description}
                                                    onChange={handleChange}
                                                />
                                                {errors.description && (
                                                    <div className="invalid-feedback">{errors.description}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Assignee</label>
                                                <select
                                                    name="assignee"
                                                    className={`form-select ${errors.assignee ? 'is-invalid' : ''}`}
                                                    value={form.assignee}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Assignee</option>
                                                    {users.map((item) => (
                                                        <option key={item.userId} value={item.userId}>
                                                            {item.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.assignee && (
                                                    <div className="invalid-feedback">{errors.assignee}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Sprint</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    name="sprint"
                                                    className={`form-control ${errors.sprint ? 'is-invalid' : ''}`}
                                                    value={form.sprint}
                                                    onChange={handleChange}
                                                />
                                                {errors.sprint && (
                                                    <div className="invalid-feedback">{errors.sprint}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Status</label>
                                                <select
                                                    name="status"
                                                    className="form-select"
                                                    value={form.status}
                                                    onChange={handleChange}
                                                >
                                                    <option value="OPEN">TO-DO</option>
                                                    <option value="IN_PROGRESS">DEVELOPMENT</option>
                                                    <option value="RESOLVED">TESTING</option>
                                                    <option value="CLOSED">COMPLETED</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Type</label>
                                                <select
                                                    name="type"
                                                    className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                                                    value={form.type}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="BUG">BUG</option>
                                                    <option value="TASK">TASK</option>
                                                    <option value="FEATURE">STORY</option>
                                                </select>
                                                {errors.type && (
                                                    <div className="invalid-feedback">{errors.type}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Priority</label>
                                                <select
                                                    name="priority"
                                                    className={`form-select ${errors.priority ? 'is-invalid' : ''}`}
                                                    value={form.priority}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Priority</option>
                                                    <option value="LOW">LOW</option>
                                                    <option value="MEDIUM">MEDIUM</option>
                                                    <option value="HIGH">HIGH</option>
                                                </select>
                                                {errors.priority && (
                                                    <div className="invalid-feedback">{errors.priority}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Tags</label>
                                                <input
                                                    name="tags"
                                                    maxLength="100"
                                                    className={`form-control ${errors.tags ? 'is-invalid' : ''}`}
                                                    value={form.tags}
                                                    onChange={handleChange}
                                                />
                                                {errors.tags && (
                                                    <div className="invalid-feedback">{errors.tags}</div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Story Point</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    name="storyPoint"
                                                    className={`form-control ${errors.storyPoint ? 'is-invalid' : ''}`}
                                                    value={form.storyPoint}
                                                    onChange={handleChange}
                                                />
                                                {errors.storyPoint && (
                                                    <div className="invalid-feedback">{errors.storyPoint}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/issue/' + issueId)}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setForm({ ...initialForm })}
                                        >
                                            Reset
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{ backgroundColor: '#F5B301', color: '#000', border: 'none' }}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default EditIssueForm;