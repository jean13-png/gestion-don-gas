export const DON_STATUS_LABELS = {
  SOUMIS: "Soumis",
  EN_VERIFICATION: "En vérification",
  INSPECTE: "Inspecté",
  VALIDE: "Validé",
  FICHE_GENEREE: "Fiche générée",
  REJETE: "Rejeté",
};

export const DON_STATUS_ORDER = [
  "SOUMIS",
  "EN_VERIFICATION",
  "INSPECTE",
  "VALIDE",
  "FICHE_GENEREE",
];

export const DON_STATUS_STYLES = {
  SOUMIS: "bg-yellow-50 text-yellow-700 border-yellow-200",
  EN_VERIFICATION: "bg-blue-50 text-blue-700 border-blue-200",
  INSPECTE: "bg-purple-50 text-purple-700 border-purple-200",
  VALIDE: "bg-green-50 text-green-700 border-green-200",
  FICHE_GENEREE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJETE: "bg-red-50 text-red-700 border-red-200",
};

export function getDonStatusLabel(status) {
  return DON_STATUS_LABELS[status] || "Statut inconnu";
}
