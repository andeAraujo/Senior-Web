document.getElementById("form-contato").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const mensagem = document.getElementById("mensagem").value;

  if (!nome || !email || !mensagem) {
    document.getElementById("status").textContent = "Preencha todos os campos.";
    return;
  }

  // Simulação de enviar a mensagem 

  document.getElementById("status").textContent = "Mensagem enviada com sucesso!";
  document.getElementById("form-contato").reset();
});
