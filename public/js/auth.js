// Helpers voor het tonen van berichten
function showMessage(message, isError = false) {
    const messageContainer = document.querySelector('.message-container');
    if (!messageContainer) return;

    messageContainer.innerHTML = '';

    const messageElement = document.createElement('div');
    messageElement.className = isError ? 'error-message' : 'success-message';
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);

    // Verwijder het bericht na 5 seconden (optioneel)
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Opslaan van token in localStorage
function setToken(token) {
    localStorage.setItem('fifaNexusToken', token);
}

// Verkrijgen van token uit localStorage
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

                // Redirect naar dashboard na succesvol inloggen
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

                // Redirect naar dashboard na succesvol registreren
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

// Forgot Password form handler
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

// Reset Password form handler
const resetPasswordForm = document.getElementById('resetPasswordForm');
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = document.getElementById('token').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Wachtwoord validatie
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

                // Redirect naar login pagina na succesvol resetten
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
    // Alleen redirects doen op login en register pagina's
    // NIET op alle pagina's redirects doen om loops te voorkomen
    const currentPath = window.location.pathname;
    const token = getToken();

    // Alleen op login/register pagina's en ALLEEN als we een token hebben, redirect naar dashboard
    if ((currentPath === '/login' || currentPath === '/register') && token) {
        window.location.href = '/dashboard';
    }

    // Logout knop handler (indien aanwezig)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            removeToken();
            // Ook de cookie verwijderen via een API call
            fetch('/api/auth/logout', { method: 'POST' })
                .then(() => {
                    window.location.href = '/login';
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    // Toch doorsturen naar login zelfs als de API call faalt
                    window.location.href = '/login';
                });
        });
    }
});