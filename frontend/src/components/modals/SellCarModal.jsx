// autogest-app/frontend/src/components/modals/SellCarModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faCalendarDay, faUser, faIdCard, faPhone, faEnvelope, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, icon, required = false }) => (
    <div>
        <label className="block text-sm font-semibold text-text-primary mb-1">
            {label}
            {required && <span className="text-red-accent ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-text-secondary" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 bg-component-bg-hover border rounded-lg focus:ring-1 focus:border-accent text-text-primary transition-colors border-border-color focus:ring-accent placeholder:text-text-secondary/70 ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

const SellCarModal = ({ car, onClose, onConfirm }) => {
    const { user } = useContext(AuthContext);
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

    useEffect(() => {
        if (car) {
            let buyerDetails = {};
            if (car.buyerDetails) {
                try {
                    buyerDetails = typeof car.buyerDetails === 'string'
                        ? JSON.parse(car.buyerDetails)
                        : car.buyerDetails;
                } catch (e) {
                    console.error("Error al parsear los datos del comprador:", e);
                }
            }

            setSaleData({
                salePrice: '', 
                saleDate: new Date().toISOString().split('T')[0],
                buyerName: buyerDetails.name || '',
                buyerLastName: buyerDetails.lastName || '',
                buyerDni: buyerDetails.dni || '',
                buyerPhone: buyerDetails.phone || '',
                buyerEmail: buyerDetails.email || '',
                buyerAddress: buyerDetails.address || '',
            });
        }
    }, [car]);

    const isValidDniNie = (value) => {
        const dniRegex = /^([0-9]{8}[A-Z])$/i;
        const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/i;
        value = value.toUpperCase();

        if (!dniRegex.test(value) && !nieRegex.test(value)) return false;

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

        return controlChars.charAt(number % 23) === value.charAt(value.length - 1);
    };

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
        if (!isValidDniNie(saleData.buyerDni)) {
            setError("EL FORMATO DEL DNI/NIE DEL COMPRADOR NO ES VÁLIDO.");
            return;
        }
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-component-bg backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-border-color">
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary uppercase">Vender Coche</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
                    <div className="text-center mb-6 p-4 bg-background/50 rounded-xl border border-border-color">
                        <p className="text-text-secondary uppercase">Marcando como vendido el <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>.</p>
                        <div className="mt-2 flex justify-center gap-4 text-sm">
                            {(user.role === 'admin' || user.role === 'technician' || user.isOwner) && (
                                <p className="text-text-secondary uppercase">Compra: <span className="font-semibold text-text-primary">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}</span></p>
                            )}
                            <p className="text-text-secondary uppercase">Venta: <span className="font-semibold text-text-primary">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}</span></p>
                        </div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-3">Datos de la Venta</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Precio Venta Final (€)" name="salePrice" value={saleData.salePrice} onChange={handleChange} type="number" placeholder="Ej: 23500" required={true} icon={faEuroSign}/>
                                <InputField label="Fecha de Venta" name="saleDate" value={saleData.saleDate} onChange={handleChange} type="date" required={true} icon={faCalendarDay} />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-3 pt-4 border-t border-border-color">Datos del Comprador</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Nombre" name="buyerName" value={saleData.buyerName} onChange={handleChange} required={true} icon={faUser} />
                                    <InputField label="Apellidos" name="buyerLastName" value={saleData.buyerLastName} onChange={handleChange} required={true} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="DNI/NIE" name="buyerDni" value={saleData.buyerDni} onChange={handleChange} required={true} icon={faIdCard} />
                                    <InputField label="Teléfono" name="buyerPhone" value={saleData.buyerPhone} onChange={handleChange} required={true} icon={faPhone} />
                                </div>
                                <InputField label="Correo Electrónico" name="buyerEmail" value={saleData.buyerEmail} onChange={handleChange} type="email" required={true} icon={faEnvelope} />
                                <InputField label="Dirección" name="buyerAddress" value={saleData.buyerAddress} onChange={handleChange} icon={faMapMarkerAlt} required={false} />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-accent text-center font-semibold uppercase">{error}</p>}
                    </form>
                </div>
                
                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-border-color">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-primary px-4 py-2 rounded-lg hover:bg-border-color transition-colors font-semibold">CANCELAR</button>
                    <button onClick={handleConfirm} className="bg-accent text-white px-6 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent-hover transition-opacity font-semibold">CONFIRMAR VENTA</button>
                </div>
            </div>
        </div>
    );
};

export default SellCarModal;