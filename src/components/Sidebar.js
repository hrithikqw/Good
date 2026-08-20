import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProfileFallback, getProfileImage } from '../services/userService';

// role -> which links show
const LINKS_BY_ROLE = {
    1: [
        { label: 'Project Dashboard', to: '/project-dashboard' },
        { label: 'Create Project', to: '/create-project' },
        { label: 'Create Issue', to: '/create-issue' },
    ],
    0: [{ label: 'Issue Dashboard', to: '/assignee-dashboard' }],
};

function Sidebar({ projectsCount = 0, issuesCount = 0 }) {
    const { user, ctxLogout } = useContext(AuthContext);
    const navigate = useNavigate();

    const isOwner = Number(user?.role) === 1;
    const links = LINKS_BY_ROLE[Number(user?.role)] || [];

    const handleLogout = () => {
        ctxLogout();
        navigate('/login');
    };

    return (
        <aside className="case-sidebar">
            <div className="profile-block">
                <img
                    src={getProfileImage(user) || getProfileFallback(user)}
                    alt={user.name}
                    className="profile-image"
                    onError={(event) => {
                        event.currentTarget.src = getProfileFallback(user);
                    }}
                />
                <h5>{user.name}</h5>
                <small>{user.email}</small>
            </div>

            {/* Owner sees 2 stats, assignee sees 1 */}
            <div className={`sidebar-stats${isOwner ? '' : ' single'}`}>
                {isOwner ? (
                    <>
                        <div>
                            <strong>{projectsCount}</strong>
                            <span>Projects Created</span>
                        </div>
                        <div>
                            <strong>{issuesCount}</strong>
                            <span>Issues Created</span>
                        </div>
                    </>
                ) : (
                    <div>
                        <strong>{issuesCount}</strong>
                        <span>Issues Assigned</span>
                    </div>
                )}
            </div>

            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                >
                    {link.label}
                </NavLink>
            ))}

            <button className="sidebar-logout" onClick={handleLogout}>
                Logout
            </button>
        </aside>
    );
}

export default Sidebar;