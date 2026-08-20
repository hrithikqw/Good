import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserLoginForm from './components/UserLoginForm';
import { AuthProvider } from './context/AuthContext';

test('renders login screen', () => {
    render(
        <AuthProvider>
            <BrowserRouter>
                <UserLoginForm />
            </BrowserRouter>
        </AuthProvider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
});
