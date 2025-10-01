const API_BASE = "https://TU-APP-EN-RAILWAY.up.railway.app/api"; 

document.addEventListener("DOMContentLoaded", () => {
  fetch(`${API_BASE}/boletas`)
    .then(res => res.json())
    .then(boletas => {
      const container = document.getElementById("boletas-container");
      container.innerHTML = "";
      boletas.forEach(b => {
        const div = document.createElement("div");
        div.classList.add("boleta");
        if (b.estado === "vendida") div.classList.add("vendida");
        if (b.estado === "reservada") div.classList.add("reservada");
        div.textContent = b.numero;
        div.onclick = () => {
          if (b.estado === "disponible") {
            window.location.href = `${API_BASE}/formulario/${b.numero}`;
          }
        };
        container.appendChild(div);
      });
    });
});
