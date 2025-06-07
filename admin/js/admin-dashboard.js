document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('adminToken');
            alert('Você foi desconectado com sucesso.');
            window.location.replace('login.html');
        });
    }
});
