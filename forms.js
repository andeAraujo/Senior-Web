document.getElementById("form-contato").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const mensagem = document.getElementById("mensagem").value;

  if (!nome || !email || !mensagem) {
    document.getElementById("status").textContent = "Preencha todos os campos.";
    return;
  }

  // Aqui você integraria com seu backend usando fetch:
  /*
  fetch("https://sua-api.com/envio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nome, email, mensagem })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").textContent = "Mensagem enviada com sucesso!";
    })
    .catch(err => {
      document.getElementById("status").textContent = "Erro ao enviar.";
    });
  */

  // Simulação de envio:
  document.getElementById("status").textContent = "Mensagem enviada com sucesso!";
  document.getElementById("form-contato").reset();
});
