document.addEventListener('DOMContentLoaded', () => {
    // Referências globais para elementos do modal e para os dados
    let messageModalInstance;
    let allMessages = [];

    // Função para mostrar a mensagem completa no modal
    window.showMessage = function(messageId) {
        if (!messageModalInstance) {
            const messageModalElement = document.getElementById('messageModal');
            if (messageModalElement) {
                messageModalInstance = new bootstrap.Modal(messageModalElement);
            }
        }
        
        const message = allMessages.find(m => m.id === messageId);
        if (message) {
            document.getElementById('modal-name').textContent = message.nome;
            document.getElementById('modal-email').textContent = message.email;
            document.getElementById('modal-date').textContent = new Date(message.data_envio).toLocaleString('pt-BR');
            document.getElementById('modal-message').textContent = message.mensagem;
            messageModalInstance.show();
        }
    };

    // Função principal para carregar as mensagens
    async function loadMessages() {
        const loadingDiv = document.getElementById('loading-messages');
        const errorDiv = document.getElementById('error-messages');
        const tableContainer = document.getElementById('messages-table-container');
        const noMessagesP = document.getElementById('no-messages');

        // Pede a chave de acesso
        const token = prompt("Por favor, insira a chave de acesso do administrador:");
        if (!token) {
            document.body.innerHTML = '<div class="container mt-5"><div class="alert alert-danger">Acesso negado. Chave não fornecida.</div></div>';
            return;
        }

        loadingDiv.style.display = 'block'; // Mostra "Carregando..."

        try {
            const response = await fetch('https://senior-web-production.up.railway.app/api/contatos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha na autenticação ou erro no servidor.');
            }

            allMessages = await response.json(); // Armazena as mensagens globalmente

            const tbody = document.getElementById('messages-tbody');
            tbody.innerHTML = ''; // Limpa a tabela antes de preencher

            if (allMessages.length === 0) {
                noMessagesP.style.display = 'block'; // Mostra "Nenhuma mensagem"
            } else {
                tableContainer.style.display = 'block'; // Mostra a tabela
                tbody.innerHTML = allMessages.map(msg => `
                    <tr>
                        <td>${msg.id}</td>
                        <td>${new Date(msg.data_envio).toLocaleString('pt-BR')}</td>
                        <td>${msg.nome}</td>
                        <td>${msg.email}</td>
                        <td>${msg.mensagem.substring(0, 50)}...</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="showMessage(${msg.id})">
                                Ver Completa
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            errorDiv.style.display = 'block'; // Mostra a mensagem de erro
            console.error('Erro ao carregar mensagens:', error);
        } finally {
            loadingDiv.style.display = 'none'; // Esconde "Carregando..." no final
        }
    }

    // Chama a função principal assim que a página carrega
    loadMessages();
});