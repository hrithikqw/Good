import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { getAllUsers } from '../services/userService';
import { getProjectsByOwner } from '../services/projectService';
import { createIssue, getAllIssues } from '../services/issueService';

function CreateIssueForm() {
    const { user, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [createdIssueCount, setCreatedIssueCount] = useState(0);
    const [form, setForm] = useState({
        summary: '',
        type: '',
        projectId: '',
        description: '',
        priority: '',
        assignee: '',
        tags: '',
        storyPoint: '',
        sprint: '',
        status: 'OPEN'
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoggedIn || Number(user?.role) !== 1) {
            navigate('/login');
            return;
        }

        const load = async () => {
            try {
                const [projectData, userData, allIssues] = await Promise.all([
                    getProjectsByOwner(user.userId),
                    getAllUsers(),
                    getAllIssues()
                ]);

                setProjects(projectData);
                setUsers(userData.filter((item) => Number(item.role) === 0));
                setCreatedIssueCount(
                    allIssues.filter(
                        (issue) => Number(issue.createdBy) === Number(user.userId)
                    ).length
                );
            } catch (error) {
                setServerError(
                    error.response?.data?.message || 'Unable to load form data.'
                );
            }
        };

        load();
    }, [isLoggedIn, navigate, user]);

    const validateField = (name, value) => {
        if (name === 'summary') {
            if (!value.trim()) return 'Summary is required.';
            if (value.length > 150) return 'Summary must not exceed 150 characters.';
            if (/[{}[\]\\]/.test(value)) return 'Summary contains invalid characters.';
        }

        if (name === 'type' && !value) return 'Type is required.';
        if (name === 'projectId' && !value) return 'Project is required.';
        if (name === 'priority' && !value) return 'Priority is required.';
        if (name === 'assignee' && !value) return 'Assignee is required.';

        if (name === 'description' && value.length > 500) {
            return 'Description must not exceed 500 characters.';
        }

        if (name === 'tags' && value.length > 100) {
            return 'Tags must not exceed 100 characters.';
        }

        if (name === 'storyPoint') {
            if (!value) return 'Story Point is required.';
            if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
                return 'Story Point must be a positive integer.';
            }
        }

        if (name === 'sprint') {
            if (!value) return 'Sprint is required.';
            if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
                return 'Sprint must be a positive integer.';
            }
        }

        return '';
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({
            ...previous,
            [name]: validateField(name, value)
        }));
        setServerError('');
    };

    const validateForm = () => {
        const next = {};

        Object.entries(form).forEach(([name, value]) => {
            const error = validateField(name, value);
            if (error) next[name] = error;
        });

        return next;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            setSubmitting(true);
            await createIssue({
                projectId: Number(form.projectId),
                description: form.description || null,
                summary: form.summary.trim(),
                sprint: form.sprint,
                storyPoint: Number(form.storyPoint),
                tags: form.tags || null,
                assignee: Number(form.assignee),
                priority: form.priority,
                status: form.status,
                createdBy: user.userId,
                type: form.type
            });

            navigate('/project-dashboard');
        } catch (error) {
            setServerError(
                error.response?.data?.message || 'Unable to create issue.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const requiredFieldsFilled =
        form.summary.trim() &&
        form.type &&
        form.projectId &&
        form.priority &&
        form.assignee &&
        form.storyPoint &&
        form.sprint;

    const formValid =
        requiredFieldsFilled &&
        !Object.values(errors).some((error) => error);

    if (!isLoggedIn || Number(user?.role) !== 1) {
        return null;
    }

    return (
        <div className="case-dashboard">
            <Sidebar projectsCount={projects.length} issuesCount={createdIssueCount} />

            <main className="case-main">
                <div className="case-form-card wide">
                    <div className="case-title-bar">Issue Tracking System</div>
                    <div className="p-4">
                        <h3>Create Issue</h3>

                        {serverError && (
                            <div className="alert alert-danger">{serverError}</div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Summary</label>
                                        <input
                                            type="text"
                                            name="summary"
                                            maxLength="150"
                                            className={`form-control ${errors.summary ? 'is-invalid' : ''}`}
                                            value={form.summary}
                                            onChange={handleChange}
                                            onBlur={(e) =>
                                                setErrors((previous) => ({
                                                    ...previous,
                                                    summary: validateField('summary', e.target.value)
                                                }))
                                            }
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
                                        <label className="form-label">Tags</label>
                                        <input
                                            type="text"
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
                                            name="storyPoint"
                                            min="1"
                                            step="1"
                                            className={`form-control ${errors.storyPoint ? 'is-invalid' : ''}`}
                                            value={form.storyPoint}
                                            onChange={handleChange}
                                        />
                                        {errors.storyPoint && (
                                            <div className="invalid-feedback">{errors.storyPoint}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Sprint</label>
                                        <input
                                            type="number"
                                            name="sprint"
                                            min="1"
                                            step="1"
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
                            </div>

                            <div className="d-flex gap-2 mt-2">
                                <button
                                    type="submit"
                                    className="btn case-primary-btn"
                                    disabled={!formValid || submitting}
                                >
                                    {submitting ? 'Creating...' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setForm({
                                            summary: '',
                                            type: '',
                                            projectId: '',
                                            description: '',
                                            priority: '',
                                            assignee: '',
                                            tags: '',
                                            storyPoint: '',
                                            sprint: '',
                                            status: 'OPEN'
                                        });
                                        setErrors({});
                                        setServerError('');
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CreateIssueForm;