// frontend/src/pages/CookiePolicyPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicyPage = () => {
    const handleManageCookies = (e) => {
        e.preventDefault();
        window.dispatchEvent(new Event('openCookieConsent'));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Ajuste de padding inferior responsivo:
                - pb-96 (384px) para móvil: El banner es muy alto al apilarse los botones.
                - lg:pb-36 (144px) para escritorio: El banner es horizontal y ocupa poco espacio.
            */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-96 lg:pb-36">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-6 uppercase tracking-tight border-b border-gray-100 pb-4">
                        Política de Cookies
                    </h1>
                    
                    <div className="space-y-8 text-gray-600 text-left leading-relaxed">
                        <p className="text-sm text-gray-500"><strong>Última actualización:</strong> 10 de octubre de 2025</p>

                        {/* Sección 1 */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">1. ¿Qué son las cookies?</h2>
                            <p>
                                Una cookie es un pequeño fichero de texto que un sitio web almacena en tu navegador cuando lo visitas. En AutoGest, utilizamos cookies y tecnologías similares como el `localStorage` para hacer que nuestro sitio funcione de manera eficiente y para mejorar tu experiencia.
                            </p>
                        </div>

                        {/* Sección 2 */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">2. ¿Qué cookies utilizamos?</h2>
                            <p className="mb-4">
                                Utilizamos cookies propias y de terceros, que se pueden clasificar según su finalidad:
                            </p>

                            <div className="space-y-6 pl-4 border-l-2 border-accent/20">
                                <div>
                                    <h3 className="text-base font-bold text-gray-800 mb-1">a) Cookies Técnicas (Estrictamente Necesarias)</h3>
                                    <p className="text-sm mb-2">
                                        Son esenciales para que la aplicación funcione correctamente. Permiten mantener tu sesión iniciada de forma segura y procesar funciones básicas.
                                    </p>
                                    <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                                        <li><strong className="text-gray-900">authToken:</strong> Nos permite mantener tu sesión iniciada de forma segura sin que tengas que introducir tus credenciales en cada página.</li>
                                        <li><strong className="text-gray-900">cookie_consent:</strong> Almacena tu preferencia sobre el uso de cookies en nuestro sitio para no volver a preguntarte.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-gray-800 mb-1">b) Cookies de Personalización</h3>
                                    <p className="text-sm mb-2">
                                        Nos permiten recordar tus preferencias para ofrecerte una experiencia más personal, como el tema visual que has elegido.
                                    </p>
                                    <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                                        <li><strong className="text-gray-900">app-theme / app-custom-theme:</strong> Guardan tus preferencias sobre el tema visual de la aplicación.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-gray-800 mb-1">c) Cookies de Terceros (Necesarias para Pagos)</h3>
                                    <p className="text-sm mb-2">
                                        Utilizamos servicios de terceros que son necesarios para funcionalidades clave, como la gestión de pagos y suscripciones.
                                    </p>
                                    <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                                        <li>
                                            <strong className="text-gray-900">Stripe:</strong> Usamos Stripe como nuestra pasarela de pagos. Stripe utiliza cookies para procesar los pagos de forma segura, prevenir el fraude y para fines de análisis. Son necesarias si deseas suscribirte a nuestros planes. Puedes obtener más información en su <a href="https://stripe.com/es/legal/cookies-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">Política de Cookies de Stripe</a>.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Sección 3 */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">3. ¿Cómo puedes gestionar tus preferencias?</h2>
                            <p className="mb-4">
                                Puedes configurar tus preferencias a través del banner de consentimiento o, en cualquier momento, desde la sección de Ajustes. También puedes hacer clic en el siguiente enlace para reabrir el panel de configuración:
                            </p>
                            <div className="py-2 mb-4">
                                <a 
                                    href="#" 
                                    onClick={handleManageCookies} 
                                    className="inline-block bg-white border border-accent text-accent font-bold px-6 py-2.5 rounded hover:bg-accent hover:text-white transition-colors uppercase text-xs tracking-wide shadow-sm"
                                >
                                    Gestionar mis preferencias de cookies
                                </a>
                            </div>
                            <p className="mb-2">
                                Te ofrecemos tres opciones para gestionar tu privacidad:
                            </p>
                            <ul className="list-disc list-inside pl-4 space-y-2 text-sm mb-6">
                                <li>
                                    <strong className="text-gray-900">Aceptar Todas:</strong> Permites el uso de todas las cookies mencionadas (Técnicas, de Personalización y de Terceros). Disfrutarás de una experiencia completa.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Aceptar solo necesarias:</strong> Permites únicamente las cookies esenciales para el funcionamiento del sitio. Esto incluye las cookies <strong>Técnicas</strong> y las de <strong>Terceros (Stripe)</strong> para que puedas gestionar tu suscripción. Las cookies de personalización no se utilizarán.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Rechazar:</strong> Se utilizarán únicamente las cookies técnicas mínimas para mantener tu sesión. Las funcionalidades de pago y personalización no estarán disponibles.
                                </li>
                            </ul>
                            
                            <p className="text-sm font-medium text-gray-900 mb-2">
                                Gestión desde el navegador:
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Chrome</a>
                                <span className="text-gray-300">|</span>
                                <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Mozilla Firefox</a>
                                <span className="text-gray-300">|</span>
                                <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Apple Safari</a>
                                <span className="text-gray-300">|</span>
                                <a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Microsoft Edge</a>
                            </div>
                        </div>

                        {/* Sección 4 */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">4. Contacto</h2>
                            <p>
                                Si tienes alguna pregunta sobre nuestra Política de Cookies, puedes contactarnos en <a href="mailto:support@auto-gest.es" className="text-accent font-medium hover:underline">support@auto-gest.es</a>.
                            </p>
                        </div>
                    </div>
                    
                    <div className="pt-8 mt-8 border-t border-gray-200 text-center">
                        <Link to="/" className="text-gray-500 font-bold text-sm hover:text-accent transition-colors uppercase tracking-wide">
                            Volver a la página principal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicyPage;