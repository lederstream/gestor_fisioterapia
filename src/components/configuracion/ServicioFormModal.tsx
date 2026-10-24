"use client";

import { useState, useEffect } from "react";
import { ServicioItem } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { 
  X, 
  DollarSign, 
  Clock, 
  Tag, 
  Sparkles, 
  Check, 
  Globe, 
  AlertCircle, 
  Eye, 
  FileText 
} from "lucide-react";
import { Switch } from "./Switch";

interface ServicioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    nombre: string;
    categoriaTag: string;
    descripcion: string;
    duracionMinutos: number;
    precioBase: number;
    precioPromocional?: number;
    textoPromocion?: string;
    mostrarEnWeb: boolean;
  }) => Promise<void>;
  servicioParaEditar?: ServicioItem | null;
}

const CATEGORIAS_PREDEFINIDAS = [
  "DOLOR & MOVILIDAD",
  "DEPORTIVA & READAPTACIÓN",
  "NEUROREHABILITACIÓN",
  "TERAPIA MANUAL Y COLUMNA",
  "ADULTO MAYOR",
  "PEDIATRÍA Y POSTURAL",
];

const DURACIONES_CHIPS = [30, 45, 60, 90];

export function ServicioFormModal({
  isOpen,
  onClose,
  onSave,
  servicioParaEditar,
}: ServicioFormModalProps) {
  const [nombre, setNombre] = useState("");
  const [categoriaTag, setCategoriaTag] = useState("DOLOR & MOVILIDAD");
  const [descripcion, setDescripcion] = useState("");
  const [duracionMinutos, setDuracionMinutos] = useState(45);
  const [precioBase, setPrecioBase] = useState<number>(85);
  const [tienePromo, setTienePromo] = useState(false);
  const [precioPromocional, setPrecioPromocional] = useState<number | undefined>(undefined);
  const [textoPromocion, setTextoPromocion] = useState("");
  const [mostrarEnWeb, setMostrarEnWeb] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicializar estado al abrir o cambiar de servicio
  useEffect(() => {
    if (servicioParaEditar) {
      setNombre(servicioParaEditar.nombre || "");
      setCategoriaTag(servicioParaEditar.categoriaTag || "DOLOR & MOVILIDAD");
      setDescripcion(servicioParaEditar.descripcion || "");
      setDuracionMinutos(servicioParaEditar.duracionMinutos || 45);
      setPrecioBase(Number(servicioParaEditar.precioBase) || 85);
      const promo = servicioParaEditar.precioPromocional ? Number(servicioParaEditar.precioPromocional) : undefined;
      setPrecioPromocional(promo);
      setTienePromo(Boolean(promo && promo > 0));
      setTextoPromocion(servicioParaEditar.textoPromocion || "");
      setMostrarEnWeb(servicioParaEditar.mostrarEnWeb !== false);
    } else {
      setNombre("");
      setCategoriaTag("DOLOR & MOVILIDAD");
      setDescripcion("");
      setDuracionMinutos(45);
      setPrecioBase(85);
      setTienePromo(false);
      setPrecioPromocional(undefined);
      setTextoPromocion("");
      setMostrarEnWeb(true);
    }
    setErrorMsg(null);
  }, [servicioParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNombre = nombre.trim();
    if (!cleanNombre) {
      setErrorMsg("El nombre del servicio es obligatorio.");
      return;
    }

    if (precioBase <= 0) {
      setErrorMsg("El precio regular debe ser mayor a S/ 0.");
      return;
    }

    if (duracionMinutos <= 0) {
      setErrorMsg("La duración de la sesión debe ser de al menos 15 minutos.");
      return;
    }

    if (tienePromo) {
      if (!precioPromocional || precioPromocional <= 0) {
        setErrorMsg("Ingresa un monto válido para el precio promocional.");
        return;
      }
      if (precioPromocional >= precioBase) {
        setErrorMsg("El precio promocional debe ser menor al precio regular.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSave({
        id: servicioParaEditar?.id,
        nombre: cleanNombre,
        categoriaTag: categoriaTag.trim() || "CLÍNICO",
        descripcion: descripcion.trim(),
        duracionMinutos: Number(duracionMinutos),
        precioBase: Number(precioBase),
        precioPromocional: tienePromo && precioPromocional ? Number(precioPromocional) : undefined,
        textoPromocion: tienePromo && textoPromocion.trim() ? textoPromocion.trim() : undefined,
        mostrarEnWeb,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  const discountPercent =
    tienePromo && precioPromocional && precioBase > precioPromocional
      ? Math.round(((precioBase - precioPromocional) / precioBase) * 100)
      : null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100/80 shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                {servicioParaEditar ? "Editar Servicio y Aranceles" : "Registrar Nuevo Servicio Clínico"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura tarifas por sesión, duración, promociones y visibilidad pública.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Formulario con scroll independiente */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Columna Izquierda: Información Clínica y Técnica */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre del Tratamiento o Sesión <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Fisioterapia Traumatológica y Deportiva"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-slate-800 text-xs"
                  required
                />
              </div>

              {/* Categoría / Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Etiqueta de Especialidad / Categoría
                </label>
                <input
                  type="text"
                  value={categoriaTag}
                  onChange={(e) => setCategoriaTag(e.target.value.toUpperCase())}
                  placeholder="DOLOR & MOVILIDAD"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-xs uppercase text-rose-600 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIAS_PREDEFINIDAS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoriaTag(cat)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                        categoriaTag === cat
                          ? "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-300"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duración de la Sesión */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Duración de la Sesión (Minutos) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {DURACIONES_CHIPS.map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDuracionMinutos(mins)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          duracionMinutos === mins
                            ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="15"
                    step="5"
                    value={duracionMinutos}
                    onChange={(e) => setDuracionMinutos(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                  />
                </div>
              </div>

              {/* Descripción Clínica */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Descripción o Enfoque Clínico
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Enfoque de readaptación funcional, terapia manual o aparatología..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-xs text-slate-700 h-24 resize-none"
                />
              </div>
            </div>

            {/* Columna Derecha: Aranceles, Promociones y Preview */}
            <div className="md:col-span-5 space-y-4">
              {/* Tarjeta de Precios */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Precio Regular por Sesión (S/) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                      S/
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={precioBase}
                      onChange={(e) => setPrecioBase(Number(e.target.value))}
                      placeholder="85"
                      className="w-full pl-8 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Switch Promoción */}
                <div className="pt-2 border-t border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        ¿Tiene Tarifa Promocional?
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Aplica descuento visible en la web
                      </span>
                    </div>
                    <Switch
                      checked={tienePromo}
                      onChange={(checked) => {
                        setTienePromo(checked);
                        if (!checked) {
                          setPrecioPromocional(undefined);
                          setTextoPromocion("");
                        } else if (!precioPromocional) {
                          setPrecioPromocional(Math.max(1, precioBase - 15));
                          setTextoPromocion("15% DSCTO PRIMERA SESIÓN");
                        }
                      }}
                    />
                  </div>

                  {tienePromo && (
                    <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-200/50 animate-in fade-in duration-200">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700">
                            Precio Promoción (S/)
                          </label>
                          {discountPercent && discountPercent > 0 && (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              -{discountPercent}% Dscto.
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={precioPromocional || ""}
                          onChange={(e) => setPrecioPromocional(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Ej: 70"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-emerald-700 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Texto del Cartel / Insignia Roja
                        </label>
                        <input
                          type="text"
                          value={textoPromocion}
                          onChange={(e) => setTextoPromocion(e.target.value)}
                          placeholder="Ej: 15% DSCTO PRIMERA SESIÓN"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-rose-600 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Visibilidad Web */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Mostrar en la Web Pública
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Permite reserva online directa
                    </span>
                  </div>
                </div>
                <Switch
                  checked={mostrarEnWeb}
                  onChange={(checked) => setMostrarEnWeb(checked)}
                />
              </div>

              {/* Previsualización en Tiempo Real de la Tarjeta Web */}
              <div className="p-3.5 bg-gradient-to-b from-stone-50 to-stone-100/70 rounded-2xl border border-stone-200/90 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-stone-400" />
                    <span>Vista Previa en Web</span>
                  </span>
                  <span>{duracionMinutos} min</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide block">
                    {categoriaTag || "CLÍNICO"}
                  </span>
                  <div className="font-bold text-slate-900 text-xs leading-tight line-clamp-1">
                    {nombre || "Nombre del tratamiento"}
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-stone-100">
                    <span className="font-extrabold text-xs text-slate-900">
                      Desde {formatCurrency(tienePromo && precioPromocional ? precioPromocional : precioBase)}
                    </span>
                    {tienePromo && precioPromocional && (
                      <span className="line-through text-stone-400 text-[10px]">
                        {formatCurrency(precioBase)}
                      </span>
                    )}
                  </div>
                  {tienePromo && textoPromocion && (
                    <div className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 rounded px-2 py-0.5 text-center">
                      {textoPromocion}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pie del Modal con Botones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {submitting
                  ? "Guardando..."
                  : servicioParaEditar
                  ? "Guardar Cambios"
                  : "Crear Servicio"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
