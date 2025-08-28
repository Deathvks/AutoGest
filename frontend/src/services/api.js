// autogest-app/frontend/src/services/api.js

// Elige la URL base dependiendo del entorno
const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// --- Funciones de Ayuda para Autenticación ---

const getToken = () => localStorage.getItem('authToken');

// Cabeceras para peticiones JSON
const getAuthHeaders = () => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// Cabeceras para peticiones con FormData
const getAuthHeadersForFormData = () => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};


// --- Funciones Genéricas para Respuestas ---

// Para rutas PÚBLICAS (Login/Registro)
const handlePublicResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en la petición');
    }
    return response.json();
};

// Para rutas PROTEGIDAS
const handleProtectedResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        
        // Intentar parsear como JSON, si falla usar texto plano
        let errorMessage = 'Algo salió mal en el servidor';
        try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
        } catch (parseError) {
            // Si no es JSON válido, usar el status y statusText
            errorMessage = `Error ${response.status}: ${response.statusText || 'Error del servidor'}`;
        }
        
        throw new Error(errorMessage);
    }
    if (response.status === 204) return null;
    return response.json();
};

const api = {
    // --- Autenticación (Auth) ---
    login: (credentials) => fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }).then(handlePublicResponse),
    register: (userData) => fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }).then(handlePublicResponse),
    getMe: () => fetch(`${BASE_URL}/auth/me`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
    updateProfile: (formData) => fetch(`${BASE_URL}/auth/profile`, { method: 'PUT', headers: getAuthHeadersForFormData(), body: formData }).then(handleProtectedResponse),
    deleteAvatar: () => fetch(`${BASE_URL}/auth/avatar`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),
    updatePassword: (passwordData) => fetch(`${BASE_URL}/auth/update-password`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(passwordData) }).then(handleProtectedResponse),
    deleteAccount: () => fetch(`${BASE_URL}/auth/me`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),


    // --- Coches (Cars) ---
    getCars: () => fetch(`${BASE_URL}/cars`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
    createCar: (formData) => fetch(`${BASE_URL}/cars`, { method: 'POST', headers: getAuthHeadersForFormData(), body: formData }).then(handleProtectedResponse),
    updateCar: (carId, data) => {
        const isFormData = data instanceof FormData;
        return fetch(`${BASE_URL}/cars/${carId}`, {
            method: 'PUT',
            headers: isFormData ? getAuthHeadersForFormData() : getAuthHeaders(),
            body: isFormData ? data : JSON.stringify(data),
        }).then(handleProtectedResponse);
    },
    deleteCar: (carId) => fetch(`${BASE_URL}/cars/${carId}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),
    analyzeDocument: (base64Image) => fetch(`${BASE_URL}/cars/analyze-document`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ image: base64Image })
    }).then(handleProtectedResponse),

    // --- Gastos (Expenses) ---
    getExpenses: () => fetch(`${BASE_URL}/expenses`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
    createExpense: (expenseData) => fetch(`${BASE_URL}/expenses`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(expenseData) }).then(handleProtectedResponse),
    deleteExpense: (expenseId) => fetch(`${BASE_URL}/expenses/${expenseId}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),

    // --- Incidencias (Incidents) ---
    getIncidents: () => fetch(`${BASE_URL}/incidents`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
    createIncident: (incidentData) => fetch(`${BASE_URL}/incidents`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(incidentData) }).then(handleProtectedResponse),
    updateIncident: (incidentId, data) => fetch(`${BASE_URL}/incidents/${incidentId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleProtectedResponse),
    deleteIncident: (incidentId) => fetch(`${BASE_URL}/incidents/${incidentId}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),

    // --- Ubicaciones (Locations) ---
    getLocations: () => fetch(`${BASE_URL}/locations`, { headers: getAuthHeaders() }).then(handleProtectedResponse),

    // --- Administración (Admin) ---
    admin: {
        getAllUsers: () => fetch(`${BASE_URL}/admin/users`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
        createUser: (userData) => fetch(`${BASE_URL}/admin/users`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(userData) }).then(handleProtectedResponse),
        updateUser: (userId, userData) => fetch(`${BASE_URL}/admin/users/${userId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(userData) }).then(handleProtectedResponse),
        deleteUser: (userId) => fetch(`${BASE_URL}/admin/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),
    },
};

export default api;