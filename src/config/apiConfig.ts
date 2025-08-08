// 1. Leemos la variable de entorno que Vite nos proporciona.
//    Esta variable será reemplazada por el valor real durante la construcción.
const API_BASE_URL = process.env.API_URL;

// 2. (Opcional pero recomendado) Añadimos una comprobación para desarrollo.
//    Si la variable no está definida, lanzamos un error para darnos cuenta rápido.
if (!API_BASE_URL) {
    // En un entorno de desarrollo de Vite, esto no debería pasar si tu .env está bien.
    // En producción (Render), esto fallaría la construcción si olvidaste poner la variable.
    throw new Error("La variable de entorno API_URL no está definida.");
}

// 3. Exportamos la URL base para que otros archivos puedan usarla.
export default API_BASE_URL;