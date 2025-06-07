(function() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
        window.location.replace('login.html');
    }
})();
