// forms.js
document.addEventListener('DOMContentLoaded', () => { // Boa prática: esperar o DOM carregar
    const form = document.getElementById('form-contato');
    const statusP = document.getElementById('status'); // Pegar o elemento de status uma vez

    form.addEventListener('submit', async function (e) { // Tornamos a função async para usar await
        e.preventDefault(); // Impede o envio padrão do formulário

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const mensagem = document.getElementById('mensagem').value;

        // Validação básica no frontend
        if (!nome || !email || !mensagem) {
            statusP.textContent = "Preencha todos os campos.";
            statusP.style.color = "red"; // Adiciona cor para feedback visual
            return;
        }

        // Atualiza o status para "Enviando..."
        statusP.textContent = "Enviando...";
        statusP.style.color = "orange";

        try {
            // A URL deve corresponder ao seu servidor Node.js
            // Se o servidor Node.js estiver rodando na porta 3000 (como configuramos)
            const response = await fetch('http://localhost:3000/api/contato', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Informa ao backend que estamos enviando JSON
                },
                body: JSON.stringify({ // Converte os dados do JS para uma string JSON
                    nome: nome,
                    email: email,
                    mensagem: mensagem
                })
            });

            const result = await response.json(); // Converte a resposta do servidor de JSON para objeto JS

            if (response.ok && result.success) {
                // 'response.ok' verifica status HTTP (200-299)
                // 'result.success' é o que definimos no backend Node.js
                statusP.textContent = result.message || "Mensagem enviada com sucesso!";
                statusP.style.color = "green";
                form.reset(); // Limpa o formulário após o envio bem-sucedido
            } else {
                // Se o backend retornou um erro (ex: validação falhou, erro no servidor)
                statusP.textContent = result.message || "Ocorreu um erro ao enviar a mensagem.";
                statusP.style.color = "red";
            }

        } catch (error) {
            // Captura erros de rede ou se o servidor não estiver respondendo
            console.error('Erro ao enviar formulário:', error);
            statusP.textContent = "Erro de conexão. Não foi possível enviar a mensagem. Tente novamente mais tarde.";
            statusP.style.color = "red";
        }
    });
});