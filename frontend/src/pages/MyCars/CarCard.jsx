// autogest-app/frontend/src/pages/MyCars/CarCard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faBan, faBell, faHandHoldingUsd,
  faExclamationTriangle, faClock, faEllipsisV, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import CarPlaceholderImage from './CarPlaceholderImage';

const CarCard = ({
  car,
  onViewDetailsClick,
  onSellClick,
  onReserveClick,
  onCancelReservationClick,
  onUpdateInsurance,
  onAddIncidentClick,
}) => {
  const { user } = useContext(AuthContext);
  const [remainingTime, setRemainingTime] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isReservedAndActive = car.status === 'Reservado' && car.reservationExpiry && new Date(car.reservationExpiry) > new Date();
  const isLockedForUser = isReservedAndActive && user.role !== 'admin';

  // Como ahora es modelo B2C individual, el propietario siempre ve los datos
  const canViewSensitiveData = true;

  useEffect(() => {
    if (!isReservedAndActive) return;
    const interval = setInterval(() => {
      const diff = new Date(car.reservationExpiry) - new Date();
      if (diff <= 0) { setRemainingTime('Expirado'); clearInterval(interval); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0 || (!d && !h)) parts.push(`${m}m`);
      setRemainingTime(parts.join(' '));
    }, 1000);
    return () => clearInterval(interval);
  }, [car.reservationExpiry, isReservedAndActive]);

  const year = car.registrationDate ? new Date(car.registrationDate).getFullYear() : null;
  const kmFormatted = car.km ? new Intl.NumberFormat('es-ES').format(car.km) + ' km' : null;
  const specParts = [car.fuel, car.transmission, year].filter(Boolean);
  const specLine = specParts.join(' · ');

  const formatEur = (val) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  // --- LÓGICA DE GASTOS UNIFICADA ---
  const basePurchasePrice = car.purchasePrice != null ? Number(car.purchasePrice) : 0;

  // Sumamos los gastos adicionales (si vienen precalculados o en un array)
  const additionalExpenses = Number(car.totalExpenses) ||
    (Array.isArray(car.expenses) ? car.expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) : 0);

  // Gasto total = Compra inicial + Gastos de taller/piezas, etc.
  const totalGasto = (car.purchasePrice != null || additionalExpenses > 0) ? basePurchasePrice + additionalExpenses : null;

  const salePrice = car.status === 'Vendido' ? (car.salePrice ?? null) : (car.price ?? null);
  const beneficio = totalGasto != null && salePrice != null ? salePrice - totalGasto : null;

  const daysAgo = car.createdAt ? Math.floor((Date.now() - new Date(car.createdAt)) / 86400000) : null;

  // --- ESTILOS PANELPRO PARA ESTADOS ---
  const statusStyles = {
    'Vendido': 'bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20',
    'En venta': 'bg-[#DBEAFE] text-[#1E3A8A] border border-[#1E3A8A]/20',
    'Reservado': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'Taller': 'bg-[#F2F4F8] text-[#6B7280] border border-[#E5E7EB]',
  };
  const chipClass = statusStyles[car.status] ?? 'bg-[#F2F4F8] text-[#6B7280] border border-[#E5E7EB]';

  return (
    <div className={`bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#020B1C]/30 transition-all duration-200 overflow-hidden select-none ${isLockedForUser ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-2">
        <button
          className="font-extrabold text-[#06122A] text-lg uppercase tracking-tight leading-tight text-left hover:opacity-80 transition-opacity line-clamp-1 flex-1"
          onClick={() => onViewDetailsClick(car)}
        >
          {car.make} {car.model}
        </button>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#F2F4F8] text-[#6B7280] hover:text-[#020B1C] transition-colors"
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 bg-white border border-[#E5E7EB] rounded-[14px] shadow-xl py-2 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
              <button className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-[#06122A] hover:bg-[#F2F4F8] flex items-center gap-3 transition-colors" onClick={() => { setMenuOpen(false); onViewDetailsClick(car); }}>
                <FontAwesomeIcon icon={faEye} className="text-[#6B7280] w-4" /> Ver detalle
              </button>

              {(car.status === 'En venta' || car.status === 'Reservado') && (
                <button className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-[#16A34A] hover:bg-[#DCFCE7] flex items-center gap-3 disabled:opacity-40 transition-colors" disabled={isLockedForUser} onClick={() => { setMenuOpen(false); onSellClick(car); }}>
                  <FontAwesomeIcon icon={faHandHoldingUsd} className="w-4" /> Vender
                </button>
              )}

              {car.status === 'En venta' && (
                <button className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-yellow-700 hover:bg-yellow-50 flex items-center gap-3 disabled:opacity-40 transition-colors" disabled={isLockedForUser} onClick={() => { setMenuOpen(false); onReserveClick(car); }}>
                  <FontAwesomeIcon icon={faBell} className="w-4" /> Reservar
                </button>
              )}

              {car.status === 'Reservado' && (
                <button className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] flex items-center gap-3 transition-colors" onClick={() => { setMenuOpen(false); onCancelReservationClick(car); }}>
                  <FontAwesomeIcon icon={faBan} className="w-4" /> Cancelar reserva
                </button>
              )}

              {car.status === 'Vendido' && (
                <button className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-[#DC2626] hover:bg-[#FEE2E2] flex items-center gap-3 transition-colors" onClick={() => { setMenuOpen(false); onAddIncidentClick(car); }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-4" /> Añadir incidencia
                </button>
              )}

              <button className="w-full text-left px-4 py-2.5 text-[14px] font-medium text-[#06122A] hover:bg-[#F2F4F8] flex items-center gap-3 transition-colors" onClick={() => { setMenuOpen(false); onUpdateInsurance(car, !car.hasInsurance); }}>
                <FontAwesomeIcon icon={faShieldAlt} className={`w-4 ${car.hasInsurance ? 'text-[#16A34A]' : 'text-[#6B7280]'}`} /> {car.hasInsurance ? 'Quitar seguro' : 'Añadir seguro'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 px-5 pb-4 cursor-pointer" onClick={() => onViewDetailsClick(car)}>
        <div className="flex-shrink-0 w-28 h-24 rounded-[14px] overflow-hidden bg-[#F2F4F8] border border-[#E5E7EB]">
          {car.imageUrl ? (
            <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CarPlaceholderImage car={car} />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-1.5 min-w-0">
          {specLine && <p className="text-[13px] font-medium text-[#6B7280] truncate capitalize">{specLine}</p>}
          {kmFormatted && <p className="text-[13px] font-medium text-[#6B7280] truncate">{kmFormatted}</p>}
          {car.licensePlate && <p className="text-[14px] font-bold text-[#06122A] uppercase tracking-wider">{car.licensePlate}</p>}
          {isReservedAndActive && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow-800 bg-yellow-100 border border-yellow-200 rounded-[6px] px-2.5 py-1 w-fit mt-1 uppercase">
              <FontAwesomeIcon icon={faClock} /> Quedan: {remainingTime}
            </span>
          )}
        </div>
      </div>

      {canViewSensitiveData && (totalGasto != null || salePrice != null) && (
        <div className="mx-5 mb-4 rounded-[12px] bg-[#F2F4F8] border border-[#E5E7EB] grid grid-cols-3 divide-x divide-[#E5E7EB] text-center py-2.5">
          {totalGasto != null && (
            <div className="px-2">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Gastos</p>
              <p className="text-[14px] font-bold text-[#DC2626]">-{formatEur(totalGasto)}</p>
            </div>
          )}
          {salePrice != null && (
            <div className="px-2">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Venta</p>
              <p className="text-[14px] font-extrabold text-[#06122A]">{formatEur(salePrice)}</p>
            </div>
          )}
          {beneficio != null && (
            <div className="px-2">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Beneficio</p>
              <p className={`text-[14px] font-bold ${beneficio >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{beneficio >= 0 ? '+' : ''}{formatEur(beneficio)}</p>
            </div>
          )}
          {totalGasto == null && salePrice != null && beneficio == null && (
            <div className="col-span-2 px-2">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Precio venta</p>
              <p className="text-[14px] font-extrabold text-[#06122A]">{formatEur(salePrice)}</p>
            </div>
          )}
        </div>
      )}

      {!canViewSensitiveData && salePrice != null && (
        <div className="mx-5 mb-4 rounded-[12px] bg-[#F2F4F8] border border-[#E5E7EB] text-center py-2.5 px-4">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Precio venta</p>
          <p className="text-[14px] font-extrabold text-[#06122A]">{formatEur(salePrice)}</p>
        </div>
      )}

      <div className="flex items-center justify-between px-5 pb-4">
        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-[8px] uppercase tracking-wide ${chipClass}`}>
          {car.status}
        </span>
        {car.hasInsurance && (
          <span className="text-[11px] text-[#6B7280] flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <FontAwesomeIcon icon={faShieldAlt} className="text-[#16A34A] text-[12px]" /> Asegurado
          </span>
        )}
      </div>

      <div className="border-t border-[#E5E7EB] flex items-center justify-between px-5 py-3 gap-2 bg-[#F2F4F8]/50">
        <button onClick={() => onViewDetailsClick(car)} className="flex items-center gap-2 text-[12px] font-bold text-[#1E3A8A] hover:underline uppercase tracking-wide transition-all">
          <FontAwesomeIcon icon={faEye} /> Ver detalle
        </button>

        <div className="flex items-center gap-3">
          {daysAgo != null && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
              <FontAwesomeIcon icon={faClock} className="text-[#6B7280]" />
              Insertado {daysAgo === 0 ? 'hoy' : `hace ${daysAgo} ${daysAgo === 1 ? 'día' : 'días'}`}
            </span>
          )}
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />}
    </div>
  );
};

export default CarCard;