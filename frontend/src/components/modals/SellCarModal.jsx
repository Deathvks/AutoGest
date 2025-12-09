// autogest-app/frontend/src/components/modals/SellCarModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faEuroSign, faUser, faIdCard, faPhone, faEnvelope, faMapMarkerAlt, faBuilding, faFileInvoice, faRoad } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import DatePicker from '../DatePicker';

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, icon, required = false }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">
            {label}
            {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FontAwesomeIcon icon={icon} className="h-4 w-4 text-gray-400" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors ${icon ? 'pl-11' : ''} min-w-0 text-left`}
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
        streetAddress: '',
        postalCode: '',
        city: '',
        province: '',
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
                streetAddress: buyerDetails.streetAddress || buyerDetails.address || '',
                postalCode: buyerDetails.postalCode || '',
                city: buyerDetails.city || '',
                province: buyerDetails.province || '',
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
            if (i % 2 === 0) {
                num *= 2;
                sum += num < 10 ? num : Math.floor(num / 10) + (num % 10);
            } else {
                sum += num;
            }
        }
        const lastDigitOfSum = sum % 10;
        const calculatedControl = lastDigitOfSum === 0 ? 0 : 10 - lastDigitOfSum;

        if (/[A-Z]/.test(controlDigit)) {
            return String.fromCharCode(64 + calculatedControl) === controlDigit;
        } else {
            return calculatedControl === parseInt(controlDigit, 10);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSaleData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setSaleData(prev => ({ ...prev, saleDate: date }));
    };

    const handleConfirm = () => {
        setError('');
        const price = parseFloat(saleData.salePrice);

        if (!saleData.salePrice || !saleData.saleDate || !saleData.streetAddress.trim() || !saleData.postalCode.trim() || !saleData.city.trim() || !saleData.province.trim()) {
            setError("Los campos de venta y la dirección completa son obligatorios.");
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
            streetAddress: saleData.streetAddress,
            postalCode: saleData.postalCode,
            city: saleData.city,
            province: saleData.province,
        };

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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <h2 className="text-lg font-bold uppercase tracking-wide">Vender Vehículo</h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors focus:outline-none"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 no-scrollbar overflow-x-hidden bg-white">
                    <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-sm uppercase font-medium">
                            Marcando como vendido el <span className="font-bold text-gray-900">{car.make} {car.model} ({car.licensePlate})</span>.
                        </p>
                        <div className="mt-2 flex justify-center gap-4 text-xs font-bold text-gray-500">
                            {(user.role === 'admin' || user.isOwner || !user.companyId) && (
                                <p>COMPRA: <span className="text-gray-800">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}</span></p>
                            )}
                            <p>VENTA: <span className="text-gray-800">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.price)}</span></p>
                        </div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b border-gray-100 pb-1">Datos de la Venta</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Precio Venta Final (€)" name="salePrice" value={saleData.salePrice} onChange={handleChange} type="number" placeholder="Ej: 23500" required={true} icon={faEuroSign} />
                                <DatePicker
                                    label="Fecha de Venta"
                                    value={saleData.saleDate}
                                    onChange={handleDateChange}
                                    required={true}
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide border-b border-gray-100 pb-1">Datos del Comprador</h3>

                            <div className="flex w-full max-w-sm mx-auto p-1 bg-gray-100 rounded-lg border border-gray-200 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setClientType('particular')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors uppercase ${clientType === 'particular' ? 'bg-white text-accent shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Particular
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setClientType('empresa')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors uppercase ${clientType === 'empresa' ? 'bg-white text-accent shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Empresa
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
                                <InputField label="Dirección (Calle, Número, Piso)" name="streetAddress" value={saleData.streetAddress} onChange={handleChange} icon={faMapMarkerAlt} required={true} />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <InputField label="Código Postal" name="postalCode" value={saleData.postalCode} onChange={handleChange} icon={faMapMarkerAlt} required={true} />
                                    <InputField label="Ciudad" name="city" value={saleData.city} onChange={handleChange} icon={faBuilding} required={true} />
                                    <InputField label="Provincia" name="province" value={saleData.province} onChange={handleChange} icon={faRoad} required={true} />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Confirmar Venta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SellCarModal;