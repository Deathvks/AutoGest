// autogest-app/frontend/src/pages/Subscription/SubscriptionBenefits.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar, faFileInvoiceDollar, faChartLine, faWrench, faUsers, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

const SubscriptionBenefits = () => {
    const benefits = [
        { icon: faCar, title: 'Gestión de Inventario Sin Límites', description: 'Añade, edita y controla todos los vehículos de tu stock sin restricciones.' },
        { icon: faFileInvoiceDollar, title: 'Análisis de Rentabilidad', description: 'Calcula automáticamente el beneficio real de cada venta, incluyendo gastos asociados.' },
        { icon: faChartLine, title: 'Dashboard Inteligente', description: 'Visualiza el rendimiento de tu negocio con gráficos y estadísticas clave en tiempo real.' },
        { icon: faUsers, title: 'Facturación Profesional', description: 'Genera facturas y proformas con los datos de tu empresa y tus clientes en segundos.' },
        { icon: faWrench, title: 'Control Post-Venta', description: 'Registra y gestiona incidencias para ofrecer un servicio al cliente excepcional.' },
        { icon: faShieldAlt, title: 'Seguridad y Confianza', description: 'Tus datos están protegidos con copias de seguridad automáticas en la nube.' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
                <div 
                    key={benefit.title} 
                    // --- INICIO DE LA MODIFICACIÓN ---
                    // Se añade el fondo animado y se elimina el `style` que causaba el problema de visibilidad.
                    className="group p-6 rounded-xl border border-border-color shadow-sm transition-all duration-300 hover:shadow-xl hover:border-accent hover:scale-[1.03] cursor-pointer animate-fade-in-up animated-premium-background"
                    style={{ animationDelay: `${index * 100}ms` }}
                    // --- FIN DE LA MODIFICACIÓN ---
                >
                    <FontAwesomeIcon icon={benefit.icon} className="text-accent text-3xl mb-4 transition-transform duration-300 group-hover:scale-110" />
                    <h4 className="font-bold text-text-primary text-lg mb-2 transition-colors duration-300 group-hover:text-accent">{benefit.title}</h4>
                    <p className="text-text-secondary text-sm leading-relaxed">{benefit.description}</p>
                </div>
            ))}
        </div>
    );
};

export default SubscriptionBenefits;