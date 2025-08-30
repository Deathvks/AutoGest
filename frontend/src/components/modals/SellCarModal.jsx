// autogest-app/frontend/src/components/modals/SellCarModal.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const SellCarModal = ({ car, onClose, onConfirm }) => {
    const [salePrice, setSalePrice] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        setError('');
        const price = parseFloat(salePrice);

        if (!salePrice) {
            setError("El precio de venta es obligatorio.");
            return;
        }
        if (isNaN(price) || price <= 0) {
            setError("Por favor, introduce un precio de venta válido y mayor que cero.");
            return;
        }
        
        onConfirm(car.id, price);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-component-bg rounded-xl shadow-lg w-full max-w-md p-6 border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary">Vender Coche</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="text-center">
                        <p className="text-text-secondary">Vas a marcar como vendido el <span className="font-bold text-text-primary">{car.make} {car.model} ({car.licensePlate})</span>.</p>
                        <p className="text-sm text-text-secondary">Precio de compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}</p>
                    </div>
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Precio de Venta (€)</label>
                        <input 
                            type="number" 
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            placeholder="Ej: 23500"
                            className="w-full px-3 py-2 bg-background border border-border-color rounded-lg focus:ring-1 focus:ring-blue-accent focus:border-blue-accent text-text-primary"
                        />
                    </div>

                    {error && <p className="mt-4 text-sm text-red-accent text-center">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-component-bg-hover text-text-secondary px-4 py-2 rounded-lg hover:bg-border-color transition-colors">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-blue-accent text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">Confirmar Venta</button>
                </div>
            </div>
        </div>
    );
};

export default SellCarModal;