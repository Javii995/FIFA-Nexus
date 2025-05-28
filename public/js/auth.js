// Helpers voor het tonen van berichten
function showMessage(message, isError = false) {
    const messageContainer = document.querySelector('.message-container');
    if (!messageContainer) return;

    messageContainer.innerHTML = '';

    const messageElement = document.createElement('div');
    messageElement.className = isError ? 'error-message' : 'success-message';
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// token opslaan in localStorage
function setToken(token) {
    localStorage.setItem('fifaNexusToken', token);
}

// token krijgen uit localStorage
function getToken() {
    return localStorage.getItem('fifaNexusToken');
}

// Verwijderen van token (bij uitloggen)
function removeToken() {
    localStorage.removeItem('fifaNexusToken');
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message);
                setToken(data.token);
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showMessage(data.message, true);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Er is een fout opgetreden bij het inloggen', true);
        }
    });
}

// Register form handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Wachtwoord validatie
        if (password !== confirmPassword) {
            showMessage('Wachtwoorden komen niet overeen', true);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message);
                setToken(data.token);

                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showMessage(data.message, true);
            }
        } catch (error) {
            console.error('Registratie error:', error);
            showMessage('Er is een fout opgetreden bij het registreren', true);
        }
    });
}

// wachtwoord vergeten form handler
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message);
            } else {
                showMessage(data.message, true);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showMessage('Er is een fout opgetreden bij het verwerken van je aanvraag', true);
        }
    });
}

const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = document.getElementById('token').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showMessage('Wachtwoorden komen niet overeen', true);
            return;
        }

        try {
            const response = await fetch(`/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message);

                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showMessage(data.message, true);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            showMessage('Er is een fout opgetreden bij het resetten van je wachtwoord', true);
        }
    });
}

// Controle voor ingelogde gebruikers
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const token = getToken();

    if ((currentPath === '/login' || currentPath === '/register') && token) {
        window.location.href = '/dashboard';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            removeToken();
            fetch('/api/auth/logout', { method: 'POST' })
                .then(() => {
                    window.location.href = '/login';
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    window.location.href = '/login';
                });
        });
    }
});