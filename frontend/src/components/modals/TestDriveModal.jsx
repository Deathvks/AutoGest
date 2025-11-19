// autogest-app/frontend/src/components/modals/TestDriveModal.jsx
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faIdCard, faFileSignature } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

const InputField = ({ label, name, value, onChange, icon, required = false }) => (
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
                type="text" name={name} value={value} onChange={onChange}
                className={`w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent text-gray-900 placeholder:text-gray-400 transition-colors ${icon ? 'pl-11' : ''}`}
            />
        </div>
    </div>
);

const TestDriveModal = ({ car, onClose }) => {
    const { user } = useContext(AuthContext);
    const [clientData, setClientData] = useState({
        name: '',
        lastName: '',
        dni: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClientData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!clientData.name.trim() || !clientData.lastName.trim() || !clientData.dni.trim()) {
            setError('Todos los campos son obligatorios.');
            return false;
        }
        setError('');
        return true;
    };

    const handleGenerateDocument = async () => {
        if (!validateForm()) return;

        const doc = new jsPDF();
        const today = new Date().toLocaleDateString('es-ES');
        let currentY = 20;

        if (user.logoUrl) {
            const logoUrl = `${API_BASE_URL}${user.logoUrl}`;
            try {
                const response = await fetch(logoUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    const logoData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    
                    const img = new Image();
                    img.src = logoData;
                    await new Promise(resolve => { img.onload = resolve; });

                    const maxW = 50;
                    const maxH = 25;
                    const aspectRatio = img.width / img.height;
                    let imgWidth = maxW;
                    let imgHeight = imgWidth / aspectRatio;

                    if (imgHeight > maxH) {
                        imgHeight = maxH;
                        imgWidth = imgHeight * aspectRatio;
                    }
                    doc.addImage(logoData, 'PNG', 14, 15, imgWidth, imgHeight);
                    currentY = 15 + imgHeight + 15;
                }
            } catch (error) {
                console.error("Error al cargar el logo para el PDF:", error);
            }
        }

        doc.setFontSize(18);
        doc.text("PRUEBA DE VEHÍCULO", 105, currentY, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Fecha: ${today}`, 196, currentY + 10, { align: 'right' });

        currentY += 25;

        doc.setFontSize(12);
        doc.text("DATOS DEL CONDUCTOR", 14, currentY);
        doc.setLineWidth(0.5);
        doc.line(14, currentY + 2, 196, currentY + 2);

        autoTable(doc, {
            startY: currentY + 5,
            theme: 'plain',
            body: [
                ['Nombre:', `${clientData.name} ${clientData.lastName}`],
                ['DNI/NIE:', clientData.dni],
            ],
            styles: { fontSize: 11 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
        });

        currentY = doc.lastAutoTable.finalY + 15;

        doc.text("DATOS DEL VEHÍCULO", 14, currentY);
        doc.line(14, currentY + 2, 196, currentY + 2);
        
        autoTable(doc, {
            startY: currentY + 5,
            theme: 'plain',
            body: [
                ['Marca:', car.make],
                ['Modelo:', car.model],
                ['Matrícula:', car.licensePlate],
                ['Nº de Bastidor:', car.vin || 'No especificado'],
            ],
            styles: { fontSize: 11 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
        });

        currentY = doc.lastAutoTable.finalY + 20;

        doc.setFontSize(11);
        doc.text("CLÁUSULA DE RESPONSABILIDAD", 105, currentY, { align: 'center' });
        doc.line(14, currentY + 2, 196, currentY + 2);

        currentY += 10;
        
        const disclaimerText = `Por la presente, D./Dña. ${clientData.name} ${clientData.lastName}, con DNI/NIE ${clientData.dni}, declara realizar una prueba dinámica del vehículo arriba referenciado bajo su entera responsabilidad.\n\nEl abajo firmante se compromete a conducir de manera responsable, respetando en todo momento las normas de circulación vigentes.\n\nLa empresa ${user.businessName || user.name}, con CIF/NIF ${user.cif || user.dni}, queda eximida de cualquier responsabilidad civil o penal derivada de accidentes, multas, infracciones de tráfico o cualquier tipo de daño material o personal que pudiera ocurrir durante la prueba del vehículo.`;

        const splitText = doc.splitTextToSize(disclaimerText, 182);
        doc.setFontSize(10);
        doc.text(splitText, 14, currentY);
        
        currentY = doc.getTextDimensions(splitText).h + currentY + 40;

        doc.text("Firma del Conductor:", 14, currentY);
        doc.line(55, currentY, 196, currentY);

        doc.save(`Prueba_${car.licensePlate}_${clientData.dni}.pdf`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in-up backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-300 overflow-hidden">
                {/* Header Rojo Occident */}
                <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 bg-accent text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-full">
                            <FontAwesomeIcon icon={faFileSignature} className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide">Prueba de Vehículo</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                    >
                        <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
                    <div className="text-center mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                         <p className="text-gray-600 text-sm font-medium">
                            Introduce los datos del cliente para generar el documento de exoneración de responsabilidad para la prueba del <span className="font-bold text-gray-900">{car.make} {car.model}</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Nombre" name="name" value={clientData.name} onChange={handleChange} icon={faUser} required={true} />
                        <InputField label="Apellidos" name="lastName" value={clientData.lastName} onChange={handleChange} required={true} />
                    </div>
                    <InputField label="DNI / NIE" name="dni" value={clientData.dni} onChange={handleChange} icon={faIdCard} required={true} />
                    
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-600 text-red-700 text-sm font-bold uppercase rounded-r">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 mt-auto flex justify-end gap-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={onClose} 
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded hover:bg-gray-100 transition-colors font-bold uppercase text-xs tracking-wide shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleGenerateDocument} 
                        className="bg-accent text-white px-6 py-2.5 rounded hover:bg-accent-hover transition-colors font-bold uppercase text-xs tracking-wide shadow-sm flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faFileSignature} />
                        Generar Documento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestDriveModal;