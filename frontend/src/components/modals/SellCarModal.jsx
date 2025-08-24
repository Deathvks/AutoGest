import React, { useState } from 'react';

// --- Icono ---
const XIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );

// --- Componente Principal del Modal ---
const SellCarModal = ({ car, onClose, onConfirm }) => {
    const [salePrice, setSalePrice] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        setError(''); // Limpia errores previos
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
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vender Coche</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                    <div className="text-center">
                        <p className="text-slate-600 dark:text-slate-400">Vas a marcar como vendido el <span className="font-bold text-slate-800 dark:text-slate-200">{car.make} {car.model}</span>.</p>
                        <p className="text-sm text-slate-500">Precio de compra: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(car.purchasePrice)}</p>
                    </div>
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Precio de Venta (€)</label>
                        <input 
                            type="number" 
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            placeholder="Ej: 23500"
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {error && <p className="mt-4 text-sm text-rose-600 text-center">{error}</p>}
                </form>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                    <button onClick={handleConfirm} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Confirmar Venta</button>
                </div>
            </div>
        </div>
    );
};

export default SellCarModal;