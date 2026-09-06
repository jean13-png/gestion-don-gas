import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1C2B3A",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "2 solid #1A3A6B",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A3A6B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7A8D",
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    color: "#6B7A8D",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    color: "#1C2B3A",
    marginBottom: 8,
  },
  badge: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#E6F7F2",
    borderRadius: 4,
    textAlign: "center",
  },
  badgeText: {
    color: "#00A878",
    fontWeight: "bold",
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: "1 solid #D9E4F0",
    fontSize: 9,
    color: "#6B7A8D",
    textAlign: "center",
  },
});

interface FicheDonData {
  reference: string;
  donateur: {
    nom: string;
    prenom: string;
    organisme?: string | null;
    email: string;
    telephone: string;
  };
  nature: string;
  description: string;
  localisation: string;
  validatedAt: Date | null;
}

function FicheDonPDF({ data }: { data: FicheDonData }) {
  const dateValidation = data.validatedAt
    ? data.validatedAt.toLocaleDateString("fr-FR")
    : "Non validée";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ONG Global Actions Solidarité (GAS)</Text>
          <Text style={styles.subtitle}>Projet Informatique Pour Tous (PIPT)</Text>
          <Text style={styles.subtitle}>Fiche de donation officielle</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Référence</Text>
          <Text style={styles.value}>{data.reference}</Text>

          <Text style={styles.label}>Donateur</Text>
          <Text style={styles.value}>
            {data.donateur.prenom} {data.donateur.nom}
            {data.donateur.organisme ? ` — ${data.donateur.organisme}` : ""}
          </Text>
          <Text style={styles.value}>{data.donateur.email}</Text>
          <Text style={styles.value}>{data.donateur.telephone}</Text>

          <Text style={styles.label}>Nature du don</Text>
          <Text style={styles.value}>{data.nature}</Text>

          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{data.description}</Text>

          <Text style={styles.label}>Localisation</Text>
          <Text style={styles.value}>{data.localisation}</Text>

          <Text style={styles.label}>Date de validation</Text>
          <Text style={styles.value}>{dateValidation}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            ONG-GAS PIPT — Don Vérifié
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Document généré automatiquement — ONG Global Actions Solidarité</Text>
          <Text>Abomey-Calavi, Bénin — Récépissé n° 123/2024 — IFU 3201987654001</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateFichePDF(data: FicheDonData): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const buffer = await renderToBuffer(<FicheDonPDF data={data} />);
  return buffer;
}
