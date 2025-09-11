// autogest-app/frontend/src/components/modals/SellCarModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, helpText, required = false }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
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

    // --- INICIO DE LA MODIFICACIÓN ---
    const isValidDniNie = (value) => {
        const dniRegex = /^([0-9]{8}[A-Z])$/i;
        const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;
        value = value.toUpperCase();

        if (!dniRegex.test(value) && !nieRegex.test(value)) {
            return false;
        }

        const controlChars = 'TRWAGMYFPDXBNJZSQVHLCKE';
        let number;

        if (nieRegex.test(value)) {
            const firstChar = value.charAt(0);
            let numPrefix;
            if (firstChar === 'X') numPrefix = '0';
            else if (firstChar === 'Y') numPrefix = '1';
            else if (firstChar === 'Z') numPrefix = '2';
            number = parseInt(numPrefix + value.substring(1, 8), 10);
        } else {
            number = parseInt(value.substring(0, 8), 10);
        }

        const calculatedChar = controlChars.charAt(number % 23);
        const providedChar = value.charAt(value.length - 1);

        return calculatedChar === providedChar;
    };
    // --- FIN DE LA MODIFICACIÓN ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSaleData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = () => {
        setError('');
        const price = parseFloat(saleData.salePrice);
    
        if (!saleData.salePrice || !saleData.saleDate || !saleData.buyerName.trim() || !saleData.buyerLastName.trim() || !saleData.buyerDni.trim() || !saleData.buyerPhone.trim() || !saleData.buyerEmail.trim()) {
            setError("Todos los campos marcados con * son obligatorios.");
            return;
        }
        if (isNaN(price) || price <= 0) {
            setError("Por favor, introduce un precio de venta válido.");
            return;
        }
        
        // --- INICIO DE LA MODIFICACIÓN ---
        if (!isValidDniNie(saleData.buyerDni)) {
            setError("EL FORMATO DEL DNI/NIE DEL COMPRADOR NO ES VÁLIDO.");
            return;
        }
        // --- FIN DE LA MODIFICACIÓN ---
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(saleData.buyerEmail)) {
            setError("Por favor, introduce un email válido.");
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
                    <h2 className="text-xl font-bold text-text-primary">VENDER COCHE</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <div className="text-center mb-6">
                        <p className="text-text-secondary">VAS A MARCAR COMO VENDIDO EL <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>.</p>
                        <p className="text-sm text-text-secondary mt-1">
                            PRECIO DE COMPRA: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}
                        </p>
                        <p className="text-sm text-text-secondary">
                            PRECIO DE VENTA: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}
                        </p>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2">DATOS DE LA VENTA</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField 
                                label="PRECIO DE VENTA FINAL (€)" 
                                name="salePrice" 
                                value={saleData.salePrice} 
                                onChange={handleChange} 
                                type="number" 
                                placeholder="EJ: 23500"
                                required={true}
                            />
                            <InputField 
                                label="FECHA DE VENTA" 
                                name="saleDate" 
                                value={saleData.saleDate} 
                                onChange={handleChange} 
                                type="date" 
                                required={true}
                            />
                        </div>
                        
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border-color pb-2 pt-4">DATOS DEL COMPRADOR</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="NOMBRE" name="buyerName" value={saleData.buyerName} onChange={handleChange} required={true} />
                            <InputField label="APELLIDOS" name="buyerLastName" value={saleData.buyerLastName} onChange={handleChange} required={true} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField label="DNI/NIE" name="buyerDni" value={saleData.buyerDni} onChange={handleChange} required={true} />
                            <InputField label="TELÉFONO" name="buyerPhone" value={saleData.buyerPhone} onChange={handleChange} required={true} />
                        </div>
                        <InputField label="CORREO ELECTRÓNICO" name="buyerEmail" value={saleData.buyerEmail} onChange={handleChange} type="email" required={true} />
                        <InputField label="DIRECCIÓN" name="buyerAddress" value={saleData.buyerAddress} onChange={handleChange} />

                        {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                    </form>
                </div>
                
                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">CANCELAR</button>
                    <button onClick={handleConfirm} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">CONFIRMAR VENTA</button>
                </div>
            </div>
        </div>
    );
};

export default SellCarModal;