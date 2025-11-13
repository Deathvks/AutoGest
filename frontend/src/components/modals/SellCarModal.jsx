// autogest-app/frontend/src/components/modals/SellCarModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faCalendarDay, faUser, faIdCard, faPhone, faEnvelope, faMapMarkerAlt, faBuilding, faFileInvoice } from '@fortawesome/free-solid-svg-icons';
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
    const [clientType, setClientType] = useState('particular');
    const [saleData, setSaleData] = useState({
        salePrice: '',
        saleDate: new Date().toISOString().split('T')[0],
        buyerName: '',
        buyerLastName: '',
        buyerDni: '',
        businessName: '',
        cif: '',
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
            
            const isCompany = buyerDetails.cif && !buyerDetails.dni;
            setClientType(isCompany ? 'empresa' : 'particular');
            
            setSaleData({
                salePrice: '', 
                saleDate: new Date().toISOString().split('T')[0],
                buyerName: buyerDetails.name || '',
                buyerLastName: buyerDetails.lastName || '',
                buyerDni: buyerDetails.dni || '',
                businessName: buyerDetails.businessName || '',
                cif: buyerDetails.cif || '',
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

    const isValidCif = (value) => {
        value = value.toUpperCase();
        if (!/^[A-Z][0-9]{8}$/.test(value)) return false;
        const controlDigit = value.charAt(value.length - 1);
        const numberPart = value.substring(1, 8);
        let sum = 0;
        for (let i = 0; i < numberPart.length; i++) {
            let num = parseInt(numberPart[i], 10);
            if (i % 2 === 0) { // Posiciones impares (índice par)
                num *= 2;
                sum += num < 10 ? num : Math.floor(num / 10) + (num % 10);
            } else { // Posiciones pares (índice impar)
                sum += num;
            }
        }
        const lastDigitOfSum = sum % 10;
        const calculatedControl = lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;
        
        if (/[A-Z]/.test(controlDigit)) { // Letra
            return String.fromCharCode(64 + calculatedControl) === controlDigit;
        } else { // Número
            return calculatedControl === parseInt(controlDigit, 10);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSaleData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = () => {
        setError('');
        const price = parseFloat(saleData.salePrice);
    
        // General validation
        if (!saleData.salePrice || !saleData.saleDate || !saleData.buyerAddress.trim()) {
            setError("Los campos de venta (precio, fecha) y la dirección del comprador son obligatorios.");
            return;
        }
        if (isNaN(price) || price <= 0) {
            setError("Por favor, introduce un precio de venta válido.");
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (saleData.buyerEmail.trim() && !emailRegex.test(saleData.buyerEmail)) {
            setError("Por favor, introduce un email válido.");
            return;
        }

        const buyerDetails = {
            phone: saleData.buyerPhone,
            email: saleData.buyerEmail,
            address: saleData.buyerAddress,
        };

        // Type-specific validation
        if (clientType === 'empresa') {
            if (!saleData.businessName.trim() || !saleData.cif.trim()) {
                setError("La Razón Social y el CIF son obligatorios para empresas.");
                return;
            }
            if (!isValidCif(saleData.cif)) {
                setError("EL FORMATO DEL CIF NO ES VÁLIDO.");
                return;
            }
            buyerDetails.businessName = saleData.businessName;
            buyerDetails.cif = saleData.cif;
            buyerDetails.name = ''; 
            buyerDetails.lastName = '';
            buyerDetails.dni = '';
        } else {
            if (!saleData.buyerName.trim() || !saleData.buyerLastName.trim() || !saleData.buyerDni.trim()) {
                setError("El Nombre, Apellidos y DNI/NIE son obligatorios para particulares.");
                return;
            }
            if (!isValidDniNie(saleData.buyerDni)) {
                setError("EL FORMATO DEL DNI/NIE DEL COMPRADOR NO ES VÁLIDO.");
                return;
            }
            buyerDetails.name = saleData.buyerName;
            buyerDetails.lastName = saleData.buyerLastName;
            buyerDetails.dni = saleData.buyerDni;
            buyerDetails.businessName = `${saleData.buyerName} ${saleData.buyerLastName}`;
            buyerDetails.cif = '';
        }
    
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
                            {(user.role === 'admin' || user.isOwner || !user.companyId) && (
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
                            
                            <div className="relative flex w-full max-w-sm mx-auto p-1 rounded-full bg-component-bg-hover border border-border-color mb-6 overflow-hidden">
                                <div
                                    className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-component-bg backdrop-blur-sm shadow-lg transition-transform duration-300 ease-in-out ${
                                        // --- INICIO DE LA MODIFICACIÓN ---
                                        // Ajustada la lógica de translación para que sea 100% (translate-x-full)
                                        clientType === 'empresa' ? 'translate-x-full' : 'translate-x-0'
                                        // --- FIN DE LA MODIFICACIÓN ---
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setClientType('particular')}
                                    className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-300 ${
                                        clientType === 'particular' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                    AUTÓNOMO
                                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setClientType('empresa')}
                                    className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors duration-300 ${
                                        clientType === 'empresa' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    EMPRESA
                                </button>
                            </div>

                            <div className="space-y-4">
                                {clientType === 'particular' ? (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InputField label="Nombre" name="buyerName" value={saleData.buyerName} onChange={handleChange} required={true} icon={faUser} />
                                            <InputField label="Apellidos" name="buyerLastName" value={saleData.buyerLastName} onChange={handleChange} required={true} />
                                        </div>
                                        <InputField label="DNI/NIE" name="buyerDni" value={saleData.buyerDni} onChange={handleChange} required={true} icon={faIdCard} />
                                    </>
                                ) : (
                                    <>
                                        <InputField label="Razón Social" name="businessName" value={saleData.businessName} onChange={handleChange} required={true} icon={faBuilding} />
                                        <InputField label="CIF" name="cif" value={saleData.cif} onChange={handleChange} required={true} icon={faFileInvoice} />
                                    </>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="Teléfono" name="buyerPhone" value={saleData.buyerPhone} onChange={handleChange} required={false} icon={faPhone} />
                                    <InputField label="Correo Electrónico" name="buyerEmail" value={saleData.buyerEmail} onChange={handleChange} type="email" required={false} icon={faEnvelope} />
                                </div>
                                <InputField label="Dirección" name="buyerAddress" value={saleData.buyerAddress} onChange={handleChange} icon={faMapMarkerAlt} required={true} />
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