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
                    <td class="text-nowrap">
                        <button class="btn btn-primary btn-sm me-2" onclick='showMessage(${JSON.stringify(msg)})'>
                            Ver
                        </button>
                        <button class="btn btn-danger btn-sm" onclick='deleteMessage(${msg.id}, this)'>
                            Excluir
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

// --- Função para DELETAR uma Mensagem ---
async function deleteMessage(messageId, buttonElement) {
    // 1. Pede confirmação ao usuário para evitar cliques acidentais
    if (!confirm(`Tem certeza que deseja excluir a mensagem #${messageId}? Esta ação não pode ser desfeita.`)) {
        return; // Se o usuário clicar em "Cancelar", a função para aqui.
    }

    // 2. Pega o token de autenticação que já está guardado
    const authToken = sessionStorage.getItem('adminToken');
    if (!authToken) {
        alert('Erro de autenticação. Por favor, faça o login novamente.');
        window.location.replace('login.html');
        return;
    }
    
    // Feedback visual: desabilita o botão e mostra "Excluindo..."
    buttonElement.disabled = true;
    buttonElement.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';


    try {
        // 3. Monta a URL correta para a API, incluindo o ID da mensagem
        const apiUrl = `https://senior-web-production.up.railway.app/api/contatos/${messageId}`;

        // 4. Envia a requisição DELETE para o servidor
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            // 5. Se a exclusão foi um sucesso, remove a linha da tabela da tela
            // O `buttonElement` ajuda a encontrar a linha pai (`<tr>`) para remover
            const rowToRemove = buttonElement.closest('tr');
            rowToRemove.remove();
            alert(`Mensagem #${messageId} deletada com sucesso.`);
        } else {
            // Se o servidor retornou um erro
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao deletar a mensagem.');
        }

    } catch (error) {
        alert(`Erro: ${error.message}`);
        // Reabilita o botão em caso de erro
        buttonElement.disabled = false;
        buttonElement.innerHTML = 'Excluir';
    }
}

// Função de segurança para evitar ataques de XSS (Cross-Site Scripting)
// ao inserir dados do usuário no HTML.
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
