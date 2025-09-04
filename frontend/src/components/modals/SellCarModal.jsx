// autogest-app/frontend/src/components/modals/SellCarModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, helpText }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary"
        />
        {helpText && <p className="mt-1 text-xs text-text-secondary">{helpText}</p>}
    </div>
);

const SellCarModal = ({ car, onClose, onConfirm }) => {
    const [saleData, setSaleData] = useState({
        salePrice: '',
        saleDate: new Date().toISOString().split('T')[0],
        buyerName: '',
        buyerLastName: '',
        buyerDni: '',
        buyerPhone: '',
        buyerEmail: '',
        buyerAddress: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSaleData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = () => {
        setError('');
        const price = parseFloat(saleData.salePrice);

        if (!saleData.salePrice || !saleData.saleDate) {
            setError("El precio y la fecha de venta son obligatorios.");
            return;
        }
        if (isNaN(price) || price <= 0) {
            setError("Por favor, introduce un precio de venta válido.");
            return;
        }
        
        const buyerDetails = {
            name: saleData.buyerName,
            lastName: saleData.buyerLastName,
            dni: saleData.buyerDni,
            phone: saleData.buyerPhone,
            email: saleData.buyerEmail,
            address: saleData.buyerAddress,
        };

        onConfirm(car.id, saleData.salePrice, saleData.saleDate, buyerDetails);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary">Vender Coche</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="text-center mb-6">
                        <p className="text-text-secondary">Vas a marcar como vendido el <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>.</p>
                        <p className="text-sm text-text-secondary mt-1">
                            Precio de compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                        </p>
                        <p className="text-sm text-text-secondary">
                            Precio de venta: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}
                        </p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2">Datos de la Venta</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField 
                                label="Precio de Venta Final (€)" 
                                name="salePrice" 
                                value={saleData.salePrice} 
                                onChange={handleChange} 
                                type="number" 
                                placeholder="Ej: 23500"
                            />
                            <InputField 
                                label="Fecha de Venta" 
                                name="saleDate" 
                                value={saleData.saleDate} 
                                onChange={handleChange} 
                                type="date" 
                            />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2 pt-4">Datos del Comprador (Opcional)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="Nombre" name="buyerName" value={saleData.buyerName} onChange={handleChange} />
                            <InputField label="Apellidos" name="buyerLastName" value={saleData.buyerLastName} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="DNI/NIE" name="buyerDni" value={saleData.buyerDni} onChange={handleChange} />
                            <InputField label="Teléfono" name="buyerPhone" value={saleData.buyerPhone} onChange={handleChange} />
                        </div>
                        <InputField label="Correo Electrónico" name="buyerEmail" value={saleData.buyerEmail} onChange={handleChange} type="email" />
                        <InputField label="Dirección" name="buyerAddress" value={saleData.buyerAddress} onChange={handleChange} />

                        {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                    </form>
                </div>
                
                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Confirmar Venta</button>
                </div>
            </div>
        </div>
    );
};

export default SellCarModal;