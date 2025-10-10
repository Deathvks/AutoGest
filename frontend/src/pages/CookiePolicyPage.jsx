// frontend/src/pages/CookiePolicyPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicyPage = () => {
    // --- INICIO DE LA MODIFICACIÓN ---
    const handleManageCookies = (e) => {
        e.preventDefault();
        window.dispatchEvent(new Event('openCookieConsent'));
    };
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="fixed inset-0 bg-background p-4 sm:p-6 lg:p-8 pb-48 text-text-primary overflow-y-auto no-scrollbar flex justify-center">
            <div className="w-full max-w-4xl space-y-6 rounded-2xl bg-component-bg p-8 shadow-2xl backdrop-blur-lg border border-border-color my-8 h-fit">
                <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>
                
                <div className="space-y-4 text-text-secondary text-left leading-relaxed">
                    <p><strong>Última actualización:</strong> 10 de octubre de 2025</p>

                    <h2 className="text-xl font-semibold text-text-primary pt-4">1. ¿Qué son las cookies?</h2>
                    <p>
                        Una cookie es un pequeño fichero de texto que un sitio web almacena en tu navegador cuando lo visitas. En AutoGest, utilizamos cookies y tecnologías similares como el `localStorage` para hacer que nuestro sitio funcione de manera eficiente y para mejorar tu experiencia.
                    </p>

                    <h2 className="text-xl font-semibold text-text-primary pt-4">2. ¿Qué cookies utilizamos?</h2>
                    <p>
                        Utilizamos cookies propias y de terceros, que se pueden clasificar según su finalidad:
                    </p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">a) Cookies Técnicas (Estrictamente Necesarias)</h3>
                    <p>
                        Son esenciales para que la aplicación funcione correctamente. Permiten mantener tu sesión iniciada de forma segura y procesar funciones básicas.
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        <li><strong>authToken:</strong> Nos permite mantener tu sesión iniciada de forma segura sin que tengas que introducir tus credenciales en cada página.</li>
                        <li><strong>cookie_consent:</strong> Almacena tu preferencia sobre el uso de cookies en nuestro sitio para no volver a preguntarte.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">b) Cookies de Personalización</h3>
                    <p>
                        Nos permiten recordar tus preferencias para ofrecerte una experiencia más personal, como el tema visual que has elegido.
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        <li><strong>app-theme / app-custom-theme:</strong> Guardan tus preferencias sobre el tema visual de la aplicación.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">c) Cookies de Terceros (Necesarias para Pagos)</h3>
                    <p>
                        Utilizamos servicios de terceros que son necesarios para funcionalidades clave, como la gestión de pagos y suscripciones.
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        <li>
                            <strong>Stripe:</strong> Usamos Stripe como nuestra pasarela de pagos. Stripe utiliza cookies para procesar los pagos de forma segura, prevenir el fraude y para fines de análisis. Son necesarias si deseas suscribirte a nuestros planes. Puedes obtener más información en su <a href="https://stripe.com/es/legal/cookies" target="_blank" rel="noopener noreferrer" className="text-accent">Política de Cookies de Stripe</a>.
                        </li>
                    </ul>

                    <h2 className="text-xl font-semibold text-text-primary pt-4">3. ¿Cómo puedes gestionar tus preferencias?</h2>
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <p>
                        Puedes configurar tus preferencias a través del banner de consentimiento o, en cualquier momento, desde la sección de Ajustes. También puedes hacer clic en el siguiente enlace para reabrir el panel de configuración:
                    </p>
                    <div className="py-2">
                        <a href="#" onClick={handleManageCookies} className="text-accent font-semibold hover:underline">
                            Gestionar mis preferencias de cookies
                        </a>
                    </div>
                    <p>
                        Te ofrecemos tres opciones para gestionar tu privacidad:
                    </p>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                    <ul className="list-disc list-inside pl-4 space-y-2">
                        <li>
                            <strong>Aceptar Todas:</strong> Permites el uso de todas las cookies mencionadas (Técnicas, de Personalización y de Terceros). Disfrutarás de una experiencia completa, incluyendo la personalización del tema visual.
                        </li>
                        <li>
                            <strong>Aceptar solo necesarias:</strong> Permites únicamente las cookies esenciales para el funcionamiento del sitio. Esto incluye las cookies <strong>Técnicas</strong> y las de <strong>Terceros (Stripe)</strong> para que puedas gestionar tu suscripción sin problemas. Las cookies de personalización no se utilizarán.
                        </li>
                        <li>
                            <strong>Rechazar:</strong> Se utilizarán únicamente las cookies técnicas mínimas para mantener tu sesión. Las funcionalidades de pago y personalización no estarán disponibles o pueden no funcionar correctamente.
                        </li>
                    </ul>
                    <p className="mt-4">
                        Adicionalmente, siempre puedes gestionar y eliminar las cookies desde la configuración de tu navegador web:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-accent">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-accent">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-accent">Apple Safari</a></li>
                        <li><a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-accent">Microsoft Edge</a></li>
                    </ul>

                    <h2 className="text-xl font-semibold text-text-primary pt-4">4. Contacto</h2>
                    <p>
                        Si tienes alguna pregunta sobre nuestra Política de Cookies, puedes contactarnos en <a href="mailto:support@auto-gest.es" className="text-accent">support@auto-gest.es</a>.
                    </p>
                </div>
                <div className="pt-6 text-center">
                    <Link to="/" className="text-accent font-semibold">Volver a la página principal</Link>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicyPage;