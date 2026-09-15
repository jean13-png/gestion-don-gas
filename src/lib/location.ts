export function buildDonLocalisation({
  localisation = "",
  pays = "",
  ville = "",
  quartierVillage = "",
}: {
  localisation?: string;
  pays?: string;
  ville?: string;
  quartierVillage?: string;
}) {
  return [pays, ville, quartierVillage, localisation]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0))
    .join(", ");
}
