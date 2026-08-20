import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import UserLoginForm from './components/UserLoginForm';
import UserSignupForm from './components/UserSignupForm';
import ProjectOwnerDashboard from './components/ProjectOwnerDashboard';
import CreateProjectForm from './components/CreateProjectForm';
import CreateIssueForm from './components/CreateIssueForm';
import IssueDetail from './components/IssueDetail';
import EditIssueForm from './components/EditIssueForm';
import AssigneeDashboard from './components/AssigneeDashboard';
import AssigneeIssueDetails from './components/AssigneeIssueDetails';

function NavBar() {
    const { isLoggedIn, user, ctxLogout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        ctxLogout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light case-navbar">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Issue Tracking System</Link>
                {isLoggedIn && (
                    <div className="d-flex align-items-center">
                        <span className="navbar-text me-3">
                            {user?.name}
                        </span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

function AppContent() {
    const location = useLocation();

    return (
        <div className="App">
            {location.pathname !== '/login' &&
                location.pathname !== '/signup' && <NavBar />}

            <Routes>
                    <Route path="/login" element={<UserLoginForm />} />
                    <Route path="/signup" element={<UserSignupForm />} />

                    <Route path="/" element={<ProjectOwnerDashboard />} />
                    <Route path="/project-dashboard" element={<ProjectOwnerDashboard />} />
                    <Route path="/create-project" element={<CreateProjectForm />} />
                    <Route path="/create-issue" element={<CreateIssueForm />} />
                    <Route path="/issue/:issueId" element={<IssueDetail />} />
                    <Route path="/issue/:issueId/edit" element={<EditIssueForm />} />

                    <Route path="/assignee-dashboard" element={<AssigneeDashboard />} />
                    <Route
                        path="/assignee-issue/:issueId"
                        element={<AssigneeIssueDetails />}
                    />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
