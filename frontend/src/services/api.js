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

const handleResponseError = async (response) => {
    let errorMessage = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';
    try {
        const error = await response.json();
        const serverErrorMessage = error.error || errorMessage;

        // Lista de palabras clave que indican un error técnico no apto para el usuario.
        const technicalKeywords = ['stripe', 'sql', 'sequelize', 'unexpected', 'module', 'jwt', 'token', 'route'];
        const isTechnicalError = technicalKeywords.some(keyword => new RegExp(keyword, 'i').test(serverErrorMessage));
        
        // Si no es un error técnico y el estado no es un error de servidor, mostramos el mensaje original.
        if (!isTechnicalError && response.status < 500) {
            errorMessage = serverErrorMessage;
        } else {
             errorMessage = 'Error inesperado del servidor. Si el problema persiste, contacta con soporte.';
        }

    } catch (parseError) {
        errorMessage = `Error ${response.status}: Ha ocurrido un problema de comunicación con el servidor.`;
    }
    
    throw new Error(errorMessage);
};


// Para rutas PÚBLICAS (Registro)
const handlePublicResponse = async (response) => {
    if (!response.ok) {
        // Usamos la nueva función centralizada de manejo de errores.
        return handleResponseError(response);
    }
    return response.json();
};

// Para rutas PROTEGIDAS
const handleProtectedResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            throw new Error('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.');
        }
        // Usamos la nueva función centralizada de manejo de errores.
        return handleResponseError(response);
    }
    if (response.status === 204) return null;
    return response.json();
};

const api = {
    // --- Autenticación (Auth) ---
    login: async (credentials) => {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.error || 'Error en el inicio de sesión');
            if (data.needsVerification) {
                error.needsVerification = true;
                error.email = data.email;
            }
            throw error;
        }
        return data;
    },
    register: (userData) => fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }).then(handlePublicResponse),
    verifyEmail: (data) => fetch(`${BASE_URL}/auth/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handlePublicResponse),
    resendVerificationCode: (data) => fetch(`${BASE_URL}/auth/resend-verification`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handlePublicResponse),
    forceVerification: (data) => fetch(`${BASE_URL}/auth/force-verification`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handlePublicResponse),
    
    forgotPassword: (data) => fetch(`${BASE_URL}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handlePublicResponse),
    resetPassword: (token, data) => fetch(`${BASE_URL}/auth/reset-password/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(handlePublicResponse),

    getMe: () => fetch(`${BASE_URL}/auth/me`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
    updateProfile: (data) => {
        const isFormData = data instanceof FormData;
        return fetch(`${BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: isFormData ? getAuthHeadersForFormData() : getAuthHeaders(),
            body: isFormData ? data : JSON.stringify(data),
        }).then(handleProtectedResponse);
    },
    resetCounters: () => fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ invoiceCounter: 1, proformaCounter: 1 }),
    }).then(handleProtectedResponse),
    deleteAvatar: () => fetch(`${BASE_URL}/auth/avatar`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),
    deleteLogo: () => fetch(`${BASE_URL}/auth/logo`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),
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

    // --- Gastos (Expenses) ---
    getExpenses: () => fetch(`${BASE_URL}/expenses`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
    getAllUserExpenses: () => fetch(`${BASE_URL}/expenses/all`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
    createExpense: (formData) => fetch(`${BASE_URL}/expenses`, { method: 'POST', headers: getAuthHeadersForFormData(), body: formData }).then(handleProtectedResponse),
    updateExpense: (expenseId, formData) => fetch(`${BASE_URL}/expenses/${expenseId}`, { method: 'PUT', headers: getAuthHeadersForFormData(), body: formData }).then(handleProtectedResponse),
    deleteExpense: (expenseId) => fetch(`${BASE_URL}/expenses/${expenseId}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),
    getExpensesByCarLicensePlate: (licensePlate) => fetch(`${BASE_URL}/expenses/car/${licensePlate}`, { headers: getAuthHeaders() }).then(handleProtectedResponse),

    // --- Incidencias (Incidents) ---
    getIncidents: () => fetch(`${BASE_URL}/incidents`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
    createIncident: (incidentData) => fetch(`${BASE_URL}/incidents`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(incidentData) }).then(handleProtectedResponse),
    updateIncident: (incidentId, data) => fetch(`${BASE_URL}/incidents/${incidentId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleProtectedResponse),
    deleteIncident: (incidentId) => fetch(`${BASE_URL}/incidents/${incidentId}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),

    // --- Notificaciones (Notifications) ---
    notifications: {
        getAll: () => fetch(`${BASE_URL}/notifications`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
        markAllAsRead: () => fetch(`${BASE_URL}/notifications/read-all`, { method: 'POST', headers: getAuthHeaders() }).then(handleProtectedResponse),
        // --- INICIO DE LA MODIFICACIÓN ---
        createCarCreationNotification: (data) => fetch(`${BASE_URL}/notifications/car-creation`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleProtectedResponse),
        // --- FIN DE LA MODIFICACIÓN ---
    },

    // --- Ubicaciones (Locations) ---
    getLocations: () => fetch(`${BASE_URL}/locations`, { headers: getAuthHeaders() }).then(handleProtectedResponse),

    // --- Administración (Admin) ---
    admin: {
        getAllUsers: () => fetch(`${BASE_URL}/admin/users`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
        createUser: (userData) => fetch(`${BASE_URL}/admin/users`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(userData) }).then(handleProtectedResponse),
        updateUser: (userId, userData) => fetch(`${BASE_URL}/admin/users/${userId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(userData) }).then(handleProtectedResponse),
        deleteUser: (userId) => fetch(`${BASE_URL}/admin/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),
    },

    // --- DASHBOARD ---
    dashboard: {
        getStats: (startDate, endDate) => {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            return fetch(`${BASE_URL}/dashboard/stats?${params.toString()}`, { headers: getAuthHeaders() }).then(handleProtectedResponse);
        },
        // --- INICIO DE LA MODIFICACIÓN ---
        getActivity: (page = 1, type = '') => {
            const params = new URLSearchParams({ page });
            if (type) params.append('type', type);
            return fetch(`${BASE_URL}/dashboard/activity?${params.toString()}`, { headers: getAuthHeaders() }).then(handleProtectedResponse);
        }
        // --- FIN DE LA MODIFICACIÓN ---
    },

    // --- Suscripciones (Stripe) ---
    subscriptions: {
        createSubscription: (paymentMethodId) => fetch(`${BASE_URL}/subscriptions/create-subscription`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ paymentMethodId }) }).then(handleProtectedResponse),
        getSubscriptionStatus: () => fetch(`${BASE_URL}/subscriptions/status`, { headers: getAuthHeaders() }).then(handleProtectedResponse),
        cancelSubscription: () => fetch(`${BASE_URL}/subscriptions/cancel-subscription`, { method: 'POST', headers: getAuthHeaders() }).then(handleProtectedResponse),
        reactivateSubscription: () => fetch(`${BASE_URL}/subscriptions/reactivate-subscription`, { method: 'POST', headers: getAuthHeaders() }).then(handleProtectedResponse),
        syncSubscription: () => fetch(`${BASE_URL}/subscriptions/sync`, { method: 'POST', headers: getAuthHeaders() }).then(handleProtectedResponse)
    },

    company: {
        inviteUser: (inviteData) => fetch(`${BASE_URL}/company/invite`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(inviteData) }).then(handleProtectedResponse),
        verifyInvitation: (token) => fetch(`${BASE_URL}/company/invitations/verify/${token}`, { method: 'GET' }).then(handlePublicResponse),
        acceptInvitation: (data) => fetch(`${BASE_URL}/company/invitations/accept`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) }).then(handleProtectedResponse),
        expelUser: (userId) => fetch(`${BASE_URL}/company/users/${userId}/expel`, { method: 'DELETE', headers: getAuthHeaders() }).then(handleProtectedResponse),
    },
};

export default api;