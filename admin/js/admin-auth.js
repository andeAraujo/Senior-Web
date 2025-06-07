// admin/js/admin-auth.js
(function() {
    // 1. Pega o token que foi guardado pela página de login
    const token = sessionStorage.getItem('adminToken');

    // 2. Se não houver token, expulsa o usuário de volta para a página de login
    if (!token) {
        // Redireciona imediatamente, antes mesmo de a página carregar
        window.location.replace('login.html');
    }
})();