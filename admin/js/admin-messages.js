// Este script é responsável por buscar e exibir as mensagens na página messages.html

document.addEventListener('DOMContentLoaded', () => {
    // lógica para logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('adminToken');
            alert('Você foi desconectado com sucesso.');
            window.location.replace('login.html');
        });
    }

    // Pega o token que foi armazenado pela página de login
    const token = sessionStorage.getItem('adminToken');

    // Uma verificação de segurança extra. Se o admin-auth.js falhar,
    // este ainda impede o acesso.
    if (!token) {
        console.error("Token de autenticação não encontrado. Redirecionando para login.");
        window.location.replace('login.html');
        return;
    }

    // Se o token existe, chama a função para carregar as mensagens
    loadMessages(token);
});

async function loadMessages(authToken) {
    const loadingDiv = document.getElementById('loading-messages');
    const errorDiv = document.getElementById('error-messages');
    const tableContainer = document.getElementById('messages-table-container');
    const noMessagesP = document.getElementById('no-messages');

    // Mostra o indicador de carregamento
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    tableContainer.style.display = 'none';
    noMessagesP.style.display = 'none';

    try {
        const apiUrl = 'https://senior-web-production.up.railway.app/api/contatos';

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        // Se o token for inválido, o back-end retornará 401 (Não Autorizado)
        if (response.status === 401) {
            sessionStorage.removeItem('adminToken'); // Limpa o token inválido
            alert("Sua chave de acesso é inválida ou expirou. Por favor, faça o login novamente.");
            window.location.replace('login.html');
            return;
        }

        if (!response.ok) {
            throw new Error(`Erro do servidor: ${response.statusText}`);
        }

        const allMessages = await response.json();
        const tbody = document.getElementById('messages-tbody');
        tbody.innerHTML = ''; // Limpa a tabela antes de preencher

        if (allMessages.length === 0) {
            noMessagesP.style.display = 'block'; // Mostra "Nenhuma mensagem"
        } else {
            tableContainer.style.display = 'block'; // Mostra a tabela
            // Preenche a tabela com os dados
            tbody.innerHTML = allMessages.map(msg => `
                <tr>
                    <td>${msg.id}</td>
                    <td>${new Date(msg.data_envio).toLocaleString('pt-BR')}</td>
                    <td>${escapeHtml(msg.nome)}</td>
                    <td>${escapeHtml(msg.email)}</td>
                    <td>${escapeHtml(msg.mensagem.substring(0, 50))}...</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick='showMessage(${JSON.stringify(msg)})'>
                            Ver Completa
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        errorDiv.textContent = `Erro ao carregar mensagens: ${error.message}`;
        errorDiv.style.display = 'block'; // Mostra a mensagem de erro
        console.error('Falha em loadMessages:', error);
    } finally {
        loadingDiv.style.display = 'none'; // Esconde o indicador de carregamento
    }
}

// Função para exibir os detalhes da mensagem em um modal do Bootstrap
// Ela é chamada pelo 'onclick' no botão da tabela
function showMessage(message) {
    // Inicializa a instância do modal do Bootstrap
    const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));

    if (message) {
        document.getElementById('modal-name').textContent = message.nome;
        document.getElementById('modal-email').textContent = message.email;
        document.getElementById('modal-date').textContent = new Date(message.data_envio).toLocaleString('pt-BR');
        document.getElementById('modal-message').textContent = message.mensagem;
        messageModal.show();
    }
}

// Função de segurança para evitar ataques de XSS (Cross-Site Scripting)
// ao inserir dados do usuário no HTML.
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
         .replace(/&/g, "&")
         .replace(/</g, "<")
         .replace(/>/g, ">")
         .replace(/"/g, "'")
         .replace(/'/g, "'"); // Usando o código da entidade para consistência
}
