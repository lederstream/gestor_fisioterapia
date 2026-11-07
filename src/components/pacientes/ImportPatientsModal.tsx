"use client";

import { useState, useRef } from "react";
import { importarPacientesMasivo, ImportarPacienteItemInput } from "@/server/actions/pacientes";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Users, 
  ArrowRight, 
  FileText,
  AlertCircle
} from "lucide-react";

interface ImportPatientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacientesExistentes: any[];
  onPatientsImported: (count: number) => void;
}

interface ParsedRow {
  data: ImportarPacienteItemInput;
  status: "valido" | "duplicado" | "invalido";
  motivo?: string;
}

export function ImportPatientsModal({
  isOpen,
  onClose,
  pacientesExistentes,
  onPatientsImported,
}: ImportPatientsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Descargar Plantilla Oficial CSV lista para Excel
  const handleDownloadTemplate = () => {
    const headers = [
      "tipo_documento",
      "numero_documento",
      "primer_nombre",
      "segundo_nombre",
      "apellido_paterno",
      "apellido_materno",
      "telefono",
      "email",
      "fecha_nacimiento",
      "contacto_emergencia_nombre",
      "contacto_emergencia_parentesco",
      "contacto_emergencia_telefono",
    ];

    const sampleRow1 = [
      "DNI",
      "46820199",
      "Rodrigo",
      "Alonso",
      "Vargas",
      "Mendoza",
      "987654321",
      "rodrigo.vargas@gmail.com",
      "1994-08-20",
      "María Mendoza",
      "Madre",
      "987000111",
    ];

    const sampleRow2 = [
      "DNI",
      "71904582",
      "Valeria",
      "",
      "Flores",
      "Paredes",
      "976543210",
      "valeria.flores@hotmail.com",
      "1997-11-14",
      "Carlos Flores",
      "Padre",
      "976111222",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), sampleRow1.join(","), sampleRow2.join(",")].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_importacion_pacientes_clinica.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 2. Parsear el archivo subido en el cliente
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setErrorMsg(null);
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("El archivo está vacío.");

        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          throw new Error("El archivo solo contiene la cabecera o no tiene registros.");
        }

        const delimiter = lines[0].includes(";") ? ";" : ",";
        const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/["']/g, ""));

        // Índices de columnas
        const colDoc = headers.findIndex((h) => h.includes("documento") || h.includes("dni"));
        const colTipo = headers.findIndex((h) => h.includes("tipo"));
        const colPName = headers.findIndex((h) => h.includes("primer_nombre") || h === "nombre" || h === "nombres");
        const colSName = headers.findIndex((h) => h.includes("segundo_nombre"));
        const colPAp = headers.findIndex((h) => h.includes("apellido_paterno") || h === "apellido" || h === "apellidos");
        const colMAp = headers.findIndex((h) => h.includes("apellido_materno"));
        const colTel = headers.findIndex((h) => h.includes("telefono") || h.includes("celular") || h.includes("movil"));
        const colEmail = headers.findIndex((h) => h.includes("email") || h.includes("correo"));
        const colNac = headers.findIndex((h) => h.includes("nacimiento") || h.includes("fecha"));
        const colEmergNom = headers.findIndex((h) => h.includes("contacto_emergencia_nombre") || h.includes("emergencia_nombre"));
        const colEmergPar = headers.findIndex((h) => h.includes("contacto_emergencia_parentesco") || h.includes("parentesco"));
        const colEmergTel = headers.findIndex((h) => h.includes("contacto_emergencia_telefono") || h.includes("emergencia_telefono"));

        const existingDniSet = new Set(pacientesExistentes.map((p) => p.dni?.trim()));
        const fileDniSet = new Set<string>();
        const results: ParsedRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          const rawRow = lines[i];
          if (!rawRow.trim()) continue;

          // Separación respetando comillas
          const cols = rawRow.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ""));
          const dni = colDoc !== -1 ? cols[colDoc]?.replace(/\D/g, "") : "";
          const tipoDoc = colTipo !== -1 && cols[colTipo] ? (cols[colTipo].toUpperCase() as any) : "DNI";
          const primerNombre = colPName !== -1 ? cols[colPName] : "";
          const segundoNombre = colSName !== -1 ? cols[colSName] : "";
          const apellidoPaterno = colPAp !== -1 ? cols[colPAp] : "";
          const apellidoMaterno = colMAp !== -1 ? cols[colMAp] : "";
          const telefono = colTel !== -1 ? cols[colTel]?.replace(/\D/g, "") : "";
          const email = colEmail !== -1 ? cols[colEmail] : "";
          const fechaNac = colNac !== -1 ? cols[colNac] : "1995-01-01";
          const emNom = colEmergNom !== -1 ? cols[colEmergNom] : "";
          const emPar = colEmergPar !== -1 ? cols[colEmergPar] : "";
          const emTel = colEmergTel !== -1 ? cols[colEmergTel] : "";

          const itemData: ImportarPacienteItemInput = {
            tipoDocumento: ["DNI", "CE", "PASAPORTE", "CEDULA", "OTRO"].includes(tipoDoc) ? tipoDoc : "DNI",
            dni: dni || "",
            primerNombre,
            segundoNombre,
            apellidoPaterno,
            apellidoMaterno,
            nombres: [primerNombre, segundoNombre].filter(Boolean).join(" ") || primerNombre,
            apellidos: [apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ") || apellidoPaterno,
            telefono: telefono || "999999999",
            email: email || undefined,
            fechaNacimiento: fechaNac || undefined,
            contactoEmergenciaNombre: emNom || undefined,
            contactoEmergenciaParentesco: emPar || undefined,
            contactoEmergenciaTelefono: emTel || undefined,
          };

          if (!dni || dni.length < 5) {
            results.push({ data: itemData, status: "invalido", motivo: "DNI inválido o vacío" });
          } else if (!primerNombre && !apellidoPaterno) {
            results.push({ data: itemData, status: "invalido", motivo: "Falta nombre y apellido" });
          } else if (existingDniSet.has(dni)) {
            results.push({ data: itemData, status: "duplicado", motivo: "DNI ya registrado en clínica" });
          } else if (fileDniSet.has(dni)) {
            results.push({ data: itemData, status: "duplicado", motivo: "DNI repetido en el archivo" });
          } else {
            fileDniSet.add(dni);
            results.push({ data: itemData, status: "valido" });
          }
        }

        setParsedRows(results);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error al procesar el archivo CSV.");
      }
    };

    reader.readAsText(uploadedFile, "UTF-8");
  };

  // 3. Confirmar la importación por lotes
  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.status === "valido").map((r) => r.data);
    if (validRows.length === 0) {
      setErrorMsg("No hay filas válidas para importar.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await importarPacientesMasivo(validRows);
      if (!res.success) {
        setErrorMsg(res.error || "Ocurrió un error durante la importación.");
        setLoading(false);
        return;
      }

      onPatientsImported(res.data?.importados || validRows.length);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado al importar.");
    } finally {
      setLoading(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.status === "valido").length;
  const duplicateCount = parsedRows.filter((r) => r.status === "duplicado").length;
  const invalidCount = parsedRows.filter((r) => r.status === "invalido").length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200/80">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Importación Masiva de Pacientes
              </h3>
              <p className="text-[11px] text-slate-500">
                Carga expedientes clínicos desde Excel o archivo CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Paso 1: Descargar Plantilla */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                Paso 1: Descarga la plantilla oficial en Excel / CSV
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Usa las columnas estándar (DNI, Nombres, Apellidos, Teléfono) para evitar errores.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-teal-800 border border-teal-200/80 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>

          {/* Paso 2: Subir Archivo */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs block">
              Paso 2: Sube el archivo con los datos de tu clínica
            </span>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50/60 hover:bg-teal-50/20 rounded-2xl p-6 text-center cursor-pointer transition space-y-2"
            >
              <Upload className="w-8 h-8 text-teal-600 mx-auto" />
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  {file ? file.name : "Haz clic aquí para seleccionar tu archivo CSV"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "Formato delimitado por comas (,) o punto y coma (;)"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv, application/vnd.ms-excel"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Paso 3: Previsualización y Validación de Filas */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-slate-900 text-xs block">
                  Paso 3: Validación y Previsualización ({parsedRows.length} filas analizadas)
                </span>

                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {validCount} Válidos
                  </span>
                  {duplicateCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {duplicateCount} Duplicados
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      {invalidCount} Inválidos
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Estado</th>
                      <th className="py-2 px-3">DNI / Doc</th>
                      <th className="py-2 px-3">Paciente</th>
                      <th className="py-2 px-3">Teléfono</th>
                      <th className="py-2 px-3 text-right">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 font-semibold">
                          {row.status === "valido" && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Válido</span>
                            </span>
                          )}
                          {row.status === "duplicado" && (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Duplicado</span>
                            </span>
                          )}
                          {row.status === "invalido" && (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                              <X className="w-3.5 h-3.5" />
                              <span>Inválido</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono font-medium">{row.data.dni || "—"}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {row.data.nombres} {row.data.apellidos}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{row.data.telefono || "—"}</td>
                        <td className="py-2 px-3 text-right text-[11px] text-slate-400">
                          {row.motivo || "Listo para importar"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">
            {validCount > 0 ? `${validCount} expediente(s) listo(s) para crearse.` : "Esperando archivo válido."}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={validCount === 0 || loading}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/25 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? "Importando..." : `Importar (${validCount}) Pacientes`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

