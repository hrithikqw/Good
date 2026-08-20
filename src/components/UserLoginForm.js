import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProfileImage, login } from '../services/userService';

function UserLoginForm() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        role: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const { ctxLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const validate = () => {
        const errors = {};

        if (!form.email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            errors.email = 'Enter a valid email.';
        }

        if (!form.password) {
            errors.password = 'Password is required.';
        }

        if (!form.role) {
            errors.role = 'Role is required.';
        }

        return errors;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setFieldErrors((previous) => ({ ...previous, [name]: '' }));
        setServerError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validate();
        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const user = await login(
                form.email.trim(),
                form.password,
                form.role
            );

            ctxLogin({ ...user, profile: getProfileImage(user) });

            if (Number(user.role) === 1) {
                navigate('/project-dashboard');
            } else {
                navigate('/assignee-dashboard');
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message || error.response?.data?.error ||
                 'Login failed.'
            );
        }
    };

    const formValid =
        form.email.trim() &&
        form.password &&
        form.role &&
        Object.keys(fieldErrors).every((key) => !fieldErrors[key]);

    return (
        <div className="case-auth-page">
            <div className="case-card auth-card">
                <div className="case-title-bar">Issue Tracking System</div>
                <div className="card-body p-4">
                    <h2 className="text-center mb-4">Login</h2>

                    {serverError && (
                        <div className="alert alert-danger">{serverError}</div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                                value={form.email}
                                onChange={handleChange}
                                onBlur={() =>
                                    setFieldErrors((previous) => ({
                                        ...previous,
                                        email: validate().email || ''
                                    }))
                                }
                            />
                            {fieldErrors.email && (
                                <div className="invalid-feedback">
                                    {fieldErrors.email}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                                value={form.password}
                                onChange={handleChange}
                                onBlur={() =>
                                    setFieldErrors((previous) => ({
                                        ...previous,
                                        password: validate().password || ''
                                    }))
                                }
                            />
                            {fieldErrors.password && (
                                <div className="invalid-feedback">
                                    {fieldErrors.password}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Role</label>
                            <select
                                name="role"
                                className={`form-select ${fieldErrors.role ? 'is-invalid' : ''}`}
                                value={form.role}
                                onChange={handleChange}
                                onBlur={() =>
                                    setFieldErrors((previous) => ({
                                        ...previous,
                                        role: validate().role || ''
                                    }))
                                }
                            >
                                <option value="">Select role</option>
                                <option value="1">Project Owner</option>
                                <option value="0">Assignee</option>
                            </select>
                            {fieldErrors.role && (
                                <div className="invalid-feedback">
                                    {fieldErrors.role}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn case-primary-btn w-100"
                            disabled={!formValid}
                        >
                            Login
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        Don't have an account? <Link to="/signup">Signup</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserLoginForm;
