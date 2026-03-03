'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRef, useState } from 'react';

export interface ImportRow {
  /** Nom de l'entreprise (colonne Nom entreprise, Raison sociale, etc.) */
  companyName: string;
  /** Téléphone (colonne Contact, Téléphone, Phone, etc.) */
  phone?: string;
  /** Personne de contact (colonne Reçu par) */
  receivedBy?: string;
  /** Domaine d'activités (colonne Domaine d'activités) */
  domain?: string;
  /** Adresse / localisation (colonne Situation géographique, Localisation, etc.) */
  location?: string;
  /** Observation / notes libres */
  observation?: string;
  /** Civilité (M., Mme...) */
  civility?: string;
  /** Email (colonne email) */
  email?: string;
  /** Colonne "nom" (ex. Nguessan, Zile) → Lead.firstName */
  firstName?: string;
  /** Colonne "prenoms" (ex. Jean Modeste, Kouassi) → Lead.lastName */
  lastName?: string;
}

interface LeadImportSheetProps {
  open: boolean;
  onClose: () => void;
  onImported?: (count: number) => void;
}

/** Normalise un en-tête Excel pour le comparer de façon robuste. */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Classe un en-tête normalisé vers un champ logique.
 *
 * On se base sur le texte de l'en-tête (sans accents, en minuscules)
 * pour déterminer s'il s'agit de :
 *  - Nom entreprise (companyName)
 *  - nom / prenoms (colonnes H et I du fichier prospect) → firstName / lastName
 *  - Contact téléphone, etc.
 */
function classifyHeader(normalized: string): keyof ImportRow | undefined {
  // Nom de l'entreprise : "Nom entreprise", "Raison sociale", ...
  if (
    normalized.includes('nomentreprise') ||
    (normalized.includes('entreprise') && !normalized.includes('domaine'))
  ) {
    return 'companyName';
  }
  // Colonne "nom" (BASE DE DONNEES PROSPECT.xlsx) → Lead.firstName
  if (
    normalized === 'nom' ||
    (normalized.includes('nom') &&
      !normalized.includes('entreprise') &&
      !normalized.includes('domaine'))
  ) {
    return 'firstName';
  }
  // Colonne "prenoms" (BASE DE DONNEES PROSPECT.xlsx) → Lead.lastName
  if (
    normalized === 'prenoms' ||
    normalized === 'prenom' ||
    normalized.includes('prenom')
  ) {
    return 'lastName';
  }
  // email
  if (normalized.includes('email') || normalized === 'mail') {
    return 'email';
  }
  if (
    normalized === 'contact' ||
    normalized.includes('telephone') ||
    normalized.includes('tel') ||
    normalized.includes('phone')
  ) {
    return 'phone';
  }
  if (
    normalized.includes('recup') ||
    normalized.includes('recupar') ||
    normalized.includes('recupart') ||
    normalized.includes('personne')
  ) {
    return 'receivedBy';
  }
  // civilité / titre (M., Mme, etc.)
  if (
    normalized.includes('civilite') ||
    normalized.includes('civility') ||
    normalized.includes('titre')
  ) {
    return 'civility';
  }
  if (normalized.includes('domaine') || normalized.includes('activite')) {
    return 'domain';
  }
  if (
    normalized.includes('situationgeographique') ||
    normalized.includes('localisation') ||
    normalized.includes('lieu') ||
    normalized.includes('adresse')
  ) {
    return 'location';
  }
  if (normalized.includes('observation') || normalized.includes('note')) {
    return 'observation';
  }
  return undefined;
}

function parseExcelFile(file: File): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data || !(data instanceof ArrayBuffer)) {
          reject(new Error('Fichier illisible'));
          return;
        }
        // Import dynamique pour éviter erreur de build si xlsx n'est pas installé
        import('xlsx')
          .then((XLSX) => {
            const wb = XLSX.read(data, { type: 'array' });
            const firstSheet = wb.Sheets[wb.SheetNames[0]];
            if (!firstSheet) {
              reject(new Error('Aucune feuille trouvée'));
              return;
            }
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
              firstSheet,
              {
                defval: '',
                raw: false,
              },
            );
            if (!rows.length) {
              resolve([]);
              return;
            }

            // Construire une table de correspondance en-tête -> champ logique à partir de la première ligne.
            const headerMap: Record<string, keyof ImportRow> = {};
            for (const key of Object.keys(rows[0])) {
              const norm = normalizeHeader(key);
              const field = classifyHeader(norm);
              if (field) {
                headerMap[key] = field;
              }
            }

            const mapped: ImportRow[] = rows.map((row) => {
              const result: ImportRow = { companyName: '' };
              const resultAny = result as unknown as Record<string, unknown>;
              for (const [key, value] of Object.entries(row)) {
                const field = headerMap[key];
                if (!field) continue;
                const v = String(value ?? '').trim();
                if (!v) continue;

                if (field === 'companyName') {
                  if (!result.companyName) result.companyName = v;
                } else if (!resultAny[field]) {
                  resultAny[field] = v;
                }
              }
              if (!result.companyName) {
                result.companyName = 'Sans nom';
              }
              return result;
            });
            resolve(mapped);
          })
          .catch(reject);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
}

export default function LeadImportSheet({
  open,
  onClose,
  onImported,
}: LeadImportSheetProps) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<
    { row: number; message: string }[] | null
  >(null);
  const [importSummary, setImportSummary] = useState<{
    created: number;
    total: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    setError(null);
    try {
      const XLSX = await import('xlsx');

      const headerRow = [
        "Domaine d'activités",
        "Nom de l'entreprise",
        'Contact',
        'Situation géographique',
        'Reçu par',
        'Observation',
        'Civilité',
        'Email',
        'Nom',
        'Prenoms',
      ];

      const exampleRow = [
        'Informatique / SaaS',
        'Acme Corp',
        '+225 01 23 45 67',
        'Abidjan, Cocody',
        'Jean Dupont',
        'Client rencontré au salon X',
        'M.',
        'contact@acme.ci',
        'Dupont',
        'Jean',
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');
      XLSX.writeFile(wb, 'modele_import_leads.xlsx');
    } catch (e) {
      setError(
        "Impossible de générer le modèle Excel. Veuillez réessayer plus tard.",
      );
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadError(null);
    setImportErrors(null);
    setImportSummary(null);
    const ext = file.name.toLowerCase().slice(-5);
    if (!ext.includes('xlsx') && !ext.includes('xls')) {
      setError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls).');
      return;
    }
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        setError(
          "Aucune ligne trouvée. Vérifiez les en-têtes : Domaine d'activités, Nom de l'entreprise, Contact, Situation Géographique, reçu par, observation.",
        );
        setRows([]);
      } else {
        setRows(parsed);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la lecture du fichier.',
      );
      setRows([]);
    }
    e.target.value = '';
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setLoading(true);
    setUploadError(null);
    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: rows }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Import impossible');
      const created = Number(data.created ?? 0);
      const total = Number(data.total ?? rows.length);
      const errors: { row: number; message: string }[] = Array.isArray(
        data.errors,
      )
        ? data.errors
        : [];

      onImported?.(created);

      if (errors.length > 0) {
        setImportErrors(errors);
        setImportSummary({ created, total });
      } else {
        setRows([]);
        handleClose();
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur d’import');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRows([]);
    setError(null);
    setUploadError(null);
    setImportErrors(null);
    setImportSummary(null);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className='flex flex-col max-w-xl overflow-hidden'>
        <SheetHeader>
          <SheetTitle>Importer des leads depuis un fichier Excel</SheetTitle>
          <SheetDescription>
            Vous pouvez d&apos;abord télécharger le modèle Excel, le remplir
            avec vos prospects, puis l&apos;importer ici. Colonnes attendues :
            Domaine d&apos;activités, Nom de l&apos;entreprise, Contact
            (téléphone), Situation géographique, Reçu par, Observation,
            Civilité, Email, Nom, Prenoms.
          </SheetDescription>
        </SheetHeader>

        <div className='flex flex-col gap-4 flex-1 min-h-0 overflow-hidden'>
          <div className='flex flex-wrap items-center gap-2'>
            <input
              ref={fileInputRef}
              type='file'
              accept='.xlsx,.xls'
              onChange={handleFileChange}
              className='hidden'
            />
            <button
              type='button'
              onClick={handleDownloadTemplate}
              className='px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50'
            >
              Télécharger le modèle Excel
            </button>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='px-3 py-2 rounded-xl bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50'
            >
              Choisir un fichier Excel
            </button>
          </div>

          {error && <p className='text-xs text-rose-600'>{error}</p>}
          {uploadError && (
            <p className='text-xs text-rose-600'>{uploadError}</p>
          )}
          {importSummary && importErrors && importErrors.length > 0 && (
            <div className='rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800'>
              <p className='font-semibold mb-1'>
                Certaines lignes n&apos;ont pas été importées
              </p>
              <p className='mb-1'>
                {importSummary.created} lead(s) créé(s) sur {importSummary.total}{' '}
                ligne(s) du fichier.
              </p>
              <ul className='list-disc list-inside space-y-0.5'>
                {importErrors.slice(0, 5).map((err, idx) => (
                  <li key={`${err.row}-${idx}`}>
                    Ligne {err.row} : {err.message}
                  </li>
                ))}
              </ul>
              {importErrors.length > 5 && (
                <p className='mt-1 text-[10px] text-amber-700'>
                  {importErrors.length - 5} autre(s) erreur(s) non affichée(s).
                </p>
              )}
            </div>
          )}

          {rows.length > 0 && (
            <>
              <p className='text-[11px] text-gray-500'>
                {rows.length} ligne(s) prête(s) à l&apos;import. Aperçu (20
                premières) :
              </p>
              <div className='flex-1 min-h-0 overflow-auto rounded-xl border border-gray-100'>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-100'>
                      <TableHead className='text-[10px]'>Entreprise</TableHead>
                      <TableHead className='text-[10px]'>Contact</TableHead>
                      <TableHead className='text-[10px]'>Reçu par</TableHead>
                      <TableHead className='text-[10px]'>Lieu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 20).map((r, i) => (
                      <TableRow key={i} className='border-b border-gray-50'>
                        <TableCell className='py-1.5 text-[11px]'>
                          {r.companyName}
                        </TableCell>
                        <TableCell className='py-1.5 text-[11px]'>
                          {r.phone ?? '—'}
                        </TableCell>
                        <TableCell className='py-1.5 text-[11px]'>
                          {r.receivedBy ?? '—'}
                        </TableCell>
                        <TableCell className='py-1.5 text-[11px]'>
                          {r.location ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className='flex items-center gap-2 pt-2 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={handleImport}
                  disabled={loading}
                  className='px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium shadow-neu disabled:opacity-60'
                >
                  {loading
                    ? 'Import en cours…'
                    : `Importer ${rows.length} lead(s)`}
                </button>
                <button
                  type='button'
                  onClick={handleClose}
                  className='px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs'
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
