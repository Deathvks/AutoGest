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
                    className="group bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-accent cursor-default animate-fade-in-up flex items-start gap-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-accent transition-colors duration-300 border border-red-100 group-hover:border-accent">
                        <FontAwesomeIcon icon={benefit.icon} className="text-accent text-lg group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base mb-1 uppercase group-hover:text-accent transition-colors duration-300">{benefit.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SubscriptionBenefits;