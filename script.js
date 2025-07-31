// script.js

// ¡IMPORTANTE! Por seguridad, en un entorno de producción, estas claves NO deben estar aquí.
// Deberías cargarlas desde variables de entorno del servidor o un archivo .env
// Para propósitos de desarrollo local y demostración, las colocamos aquí temporalmente.
const GEMINI_API_KEY = 'AIzaSyBYnzU2gjzgdsbza2qeIRIQIcCyhkDrNHw'; // <--- Tu clave REAL de Gemini

// CLAVES PARA GOOGLE CUSTOM SEARCH (Búsqueda de Imágenes)
const Google_Search_API_KEY = 'AIzaSyC2WrOMiOPhWVxSwlyYs0DaXuX4kQPLvcI'; // <--- Tu clave de API para Google Search
const Google_Search_CX = 'e6116bac286e441f2'; // <--- Tu ID de motor de búsqueda personalizada (CX)

const iaPromptInput = document.getElementById('ia-prompt-input');
const iaSubmitBtn = document.getElementById('ia-submit-btn');
const iaResultadoDiv = document.getElementById('ia-resultado');
const iaErrorMessage = document.getElementById('ia-error');
const iaLoadingMessage = document.getElementById('ia-loading');

// Función para mostrar mensajes de error
function displayError(message) {
    iaErrorMessage.textContent = message;
    iaErrorMessage.style.display = 'block';
}

// Función para limpiar mensajes de error
function clearError() {
    iaErrorMessage.textContent = '';
    iaErrorMessage.style.display = 'none';
}

// Función para mostrar/ocultar mensaje de carga
function showLoading(show) {
    iaLoadingMessage.style.display = show ? 'block' : 'none';
}

// Función para buscar imágenes en Google
async function searchGoogleImages(query) {
    // Corregido: Google Search_API_KEY (sin espacios)
    if (!Google_Search_API_KEY || Google_Search_API_KEY === 'TU_CLAVE_API_Google Search_AQUI') {
        console.warn('Advertencia: La clave de API de Google Search no está configurada.');
        return null;
    }
    // Corregido: Google Search_CX (sin espacios)
    if (!Google_Search_CX || Google_Search_CX === 'TU_CX_DE_BUSQUEDA_PERSONALIZADA_AQUI') {
        console.warn('Advertencia: El ID de motor de búsqueda (CX) no está configurado. La búsqueda de imágenes no funcionará.');
        displayError('Error: El ID del motor de búsqueda (CX) de Google no está configurado. Las imágenes no se mostrarán.');
        return null;
    }

    try {
        // Corregido: Google Search_API_KEY y Google Search_CX (sin espacios)
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${Google_Search_API_KEY}&cx=${GoogleSearch_CX}&q=${encodeURIComponent(query)}&searchType=image&num=1`);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error en la respuesta de la API de Google Search:', errorData);
            if (response.status === 400 && errorData.error && errorData.error.message.includes('Invalid value for parameter \'cx\'')) {
                displayError('Error de configuración de la búsqueda de imágenes: El ID del motor de búsqueda (CX) es inválido.');
            } else if (response.status === 403) {
                 displayError('Error de configuración de la búsqueda de imágenes: La API de Custom Search no está habilitada o la clave no es válida.');
            }
            throw new Error(`Error de la API de Google Search: ${response.status} - ${errorData.error.message || 'Error desconocido'}`);
        }

        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const firstImage = data.items.find(item => item.mime && item.mime.startsWith('image/'));
            return firstImage ? firstImage.link : null;
        }
    } catch (error) {
        console.error('Error al buscar imágenes en Google:', error);
    }
    return null;
}

async function askGeminiAI(promptText) {
    clearError();
    iaResultadoDiv.innerHTML = '<p>La inteligencia artificial está lista para responder tus curiosidades culinarias.</p>';
    showLoading(true);

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'TU_CLAVE_API_DE_GEMINI_AQUI') {
        displayError('Error: La clave de API de Gemini no está configurada correctamente. Revisa el archivo script.js');
        showLoading(false);
        return;
    }

    if (!promptText.trim()) {
        displayError('Por favor, ingresa una pregunta o un dato curioso para la IA.');
        iaResultadoDiv.innerHTML = '';
        showLoading(false);
        return;
    }

    try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: promptText
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 150
                }
            })
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(`Error de la API de Gemini: ${geminiResponse.status} - ${errorData.error.message || 'Error desconocido'}`);
        }

        const geminiData = await geminiResponse.json();
        const aiResponseText = geminiData.candidates[0].content.parts[0].text.trim();
        iaResultadoDiv.innerHTML = `<p>${aiResponseText}</p>`;

        const imageUrl = await searchGoogleImages(promptText);

        if (imageUrl) {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = `Imagen relacionada con: ${promptText}`;
            imgElement.style.maxWidth = '100%';
            imgElement.style.height = 'auto';
            imgElement.style.marginTop = '20px';
            imgElement.style.borderRadius = '8px';
            imgElement.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
            iaResultadoDiv.appendChild(imgElement);
        }

    } catch (error) {
        console.error('Error general al procesar la solicitud:', error);
        if (!iaErrorMessage.textContent) {
            displayError(`No se pudo obtener la respuesta de la IA. Intenta de nuevo. Detalles: ${error.message}`);
        }
        iaResultadoDiv.innerHTML = '<p>Lo sentimos, no pudimos procesar tu solicitud en este momento.</p>';
    } finally {
        showLoading(false);
    }
}

// Event Listener para el botón
iaSubmitBtn.addEventListener('click', () => {
    const promptValue = iaPromptInput.value;
    askGeminiAI(promptValue);
});

// Event Listener para la tecla Enter en el input
iaPromptInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const promptValue = iaPromptInput.value;
        askGeminiAI(promptValue);
    }
});
