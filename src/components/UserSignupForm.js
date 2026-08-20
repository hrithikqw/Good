import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, saveProfileImage } from '../services/userService';

function UserSignupForm() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        profile: '',
        role: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const validateField = (name, value) => {
        if (name === 'name' && !value.trim()) return 'Name is required.';
        if (name === 'email') {
            if (!value.trim()) return 'Email is required.';
            if (!/^\S+@\S+\.\S+$/.test(value)) return 'Enter a valid email.';
        }
        if (name === 'password') {
            if (!value) return 'Password is required.';
            if (value.length < 8) return 'Password must contain at least 8 characters.';
        }
        if (name === 'profile') {
            if (!value.trim()) return 'Profile image URL is required.';
            try {
                const url = new URL(value);
                if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                    return 'Enter a valid image URL.';
                }
            } catch {
                return 'Enter a valid image URL.';
            }
        }
        if (name === 'role' && !value) return 'Role is required.';
        return '';
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setFieldErrors((previous) => ({
            ...previous,
            [name]: ''
        }));
        setServerError('');
    };

    const validateForm = () => {
        const errors = {};
        Object.entries(form).forEach(([name, value]) => {
            const error = validateField(name, value);
            if (error) errors[name] = error;
        });
        return errors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validateForm();
        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const user = await registerUser(form);
            saveProfileImage(form.email, form.profile);
            setSuccess('Account created successfully. Redirecting to login...');
            setServerError('');
            setForm({
                name: '',
                email: '',
                password: '',
                profile: '',
                role: ''
            });
            setTimeout(() => navigate('/login'), 1000);
        } catch (error) {
            setServerError(
                error.response?.data?.message || 'Unable to create account.'
            );
            setSuccess('');
        }
    };

    const formValid =
        Object.values(form).every((value) => String(value).trim()) &&
        Object.keys(fieldErrors).every((key) => !fieldErrors[key]);

    return (
        <div className="case-auth-page">
            <div className="case-card auth-card">
                <div className="case-title-bar">Issue Tracking System</div>
                <div className="card-body p-4">
                    <h2 className="text-center mb-4">Signup</h2>

                    {serverError && (
                        <div className="alert alert-danger">{serverError}</div>
                    )}

                    {success && (
                        <div className="alert alert-success">{success}</div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                name="name"
                                className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                                value={form.name}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setFieldErrors((previous) => ({
                                        ...previous,
                                        name: validateField('name', e.target.value)
                                    }))
                                }
                            />
                            {fieldErrors.name && (
                                <div className="invalid-feedback">{fieldErrors.name}</div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                                value={form.email}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setFieldErrors((previous) => ({
                                        ...previous,
                                        email: validateField('email', e.target.value)
                                    }))
                                }
                            />
                            {fieldErrors.email && (
                                <div className="invalid-feedback">{fieldErrors.email}</div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Profile Image URL</label>
                            <input
                                type="url"
                                name="profile"
                                className={`form-control ${fieldErrors.profile ? 'is-invalid' : ''}`}
                                value={form.profile}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setFieldErrors((previous) => ({
                                        ...previous,
                                        profile: validateField('profile', e.target.value)
                                    }))
                                }
                            />
                            {fieldErrors.profile && (
                                <div className="invalid-feedback">{fieldErrors.profile}</div>
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
                                onBlur={(e) =>
                                    setFieldErrors((previous) => ({
                                        ...previous,
                                        password: validateField('password', e.target.value)
                                    }))
                                }
                            />
                            {fieldErrors.password && (
                                <div className="invalid-feedback">{fieldErrors.password}</div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Role</label>
                            <select
                                name="role"
                                className={`form-select ${fieldErrors.role ? 'is-invalid' : ''}`}
                                value={form.role}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setFieldErrors((previous) => ({
                                        ...previous,
                                        role: validateField('role', e.target.value)
                                    }))
                                }
                            >
                                <option value="">Select role</option>
                                <option value="1">Project Owner</option>
                                <option value="0">Assignee</option>
                            </select>
                            {fieldErrors.role && (
                                <div className="invalid-feedback">{fieldErrors.role}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn case-primary-btn w-100"
                            disabled={!formValid}
                        >
                            Signup
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserSignupForm;
