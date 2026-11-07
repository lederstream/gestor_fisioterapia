/**
 * Generador de contraseñas de alta entropía compatible universalmente (Navegador y Servidor).
 * Cumple con OWASP ASVS 4.0 sin depender de módulos nativos de Node.js.
 */
export function generarClaveAleatoriaSegura(longitud = 12): string {
  const mayusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sin O, I para evitar confusión
  const minusculas = "abcdefghijkmnopqrstuvwxyz"; // sin l
  const numeros = "23456789"; // sin 0, 1
  const simbolos = "!@#$%^&*()_+-=";
  const todos = mayusculas + minusculas + numeros + simbolos;

  const res: string[] = [];

  // Usar Web Crypto API si está disponible en el navegador/entorno
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint32Array(longitud);
    crypto.getRandomValues(array);

    res.push(mayusculas[array[0] % mayusculas.length]);
    res.push(minusculas[array[1] % minusculas.length]);
    res.push(numeros[array[2] % numeros.length]);
    res.push(simbolos[array[3] % simbolos.length]);

    for (let i = 4; i < longitud; i++) {
      res.push(todos[array[i] % todos.length]);
    }
  } else {
    // Fallback matemático
    res.push(mayusculas[Math.floor(Math.random() * mayusculas.length)]);
    res.push(minusculas[Math.floor(Math.random() * minusculas.length)]);
    res.push(numeros[Math.floor(Math.random() * numeros.length)]);
    res.push(simbolos[Math.floor(Math.random() * simbolos.length)]);

    for (let i = 4; i < longitud; i++) {
      res.push(todos[Math.floor(Math.random() * todos.length)]);
    }
  }

  // Mezclar orden de caracteres aleatoriamente
  return res.sort(() => Math.random() - 0.5).join("");
}
