document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-receta");
  const contenedor = document.getElementById("contenedor-recetas");

  const recetas = [];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    if (nombre && descripcion) {
      const nuevaReceta = { nombre, descripcion };
      recetas.push(nuevaReceta);
      mostrarRecetas();
      form.reset();
    }
  });

  function mostrarRecetas() {
    contenedor.innerHTML = "";
    recetas.forEach((receta) => {
      const div = document.createElement("div");
      div.className = "tarjeta-receta";
      div.innerHTML = `
        <h3>${receta.nombre}</h3>
        <p>${receta.descripcion}</p>
      `;
      contenedor.appendChild(div);
    });
  }
});
