require('dotenv').config();
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Define original sectors from src/data/sectors.ts
const SECTORS = {
    "Distrito Nacional": [
        "Arroyo Hondo", "Bella Vista", "Ciudad Nueva", "Cristo Rey", "El Millón", "Ensanche La Fe",
        "Ensanche Quisqueya", "Evaristo Morales", "Gascue", "Honduras", "La Esperilla", "La Julia",
        "Los Cacicazgos", "Los Girasoles", "Los Peralejos", "Los Prados", "Los Restauradores",
        "Los Ríos", "Mata Hambre", "Mirador Norte", "Mirador Sur", "Naco", "Piantini",
        "Renacimiento", "San Carlos", "San Gerónimo", "Villa Consuelo", "Villa Francisca",
        "Villa Juana", "Zona Colonial"
    ],
    "Santo Domingo Este": [
        "Alma Rosa I", "Alma Rosa II", "Autopista San Isidro", "Brisa Oriental", "Cancino",
        "Corales del Sur", "El Almirante", "El Pensador", "El Rosal", "El Tamarindo",
        "Ensanche Ozama", "Hainamosa", "Hamarap", "Invivienda", "Italia", "La Isabelita",
        "Los Frailes", "Los Mameyes", "Los Mina", "Los Tres Ojos", "Los Trinitarios",
        "Lucerna", "Mendoza", "Prado Oriental", "San Isidro", "Savica", "Tropical del Este",
        "Urbanización Real", "Villa Duarte", "Villa Faro"
    ],
    "Santo Domingo Oeste": [
        "Alameda", "Barrio Duarte", "Bayona", "Bienvenido", "Buenos Aires de Herrera",
        "Caballona", "Ciudad Agraria", "El Abanico", "El Café", "El Libertador", "El Pedregal",
        "Engombe", "Enriquillo", "Hato Nuevo", "Herrera", "Iván Klang", "Juan Guzmán",
        "La Venta", "Las Caobas", "Las Caobitas", "Las Palmas", "Los Peralejos (Oeste)",
        "Manoguayabo", "Palavé", "Pueblo Chico", "Residencial Don Gregorio",
        "Residencial Olimpo", "San Miguel", "Urbanización Miosotis", "Villa Aura"
    ],
    "Santo Domingo Norte": [
        "Buena Vista I", "Buena Vista II", "Cachiman", "Carlos Álvarez", "Ciudad Modelo",
        "Colinas del Arroyo", "El Edén", "El Higüero", "El Torito", "Hacienda Estrella",
        "Haras Nacionales", "La Nueva Barquita", "La Victoria", "Los Casitas", "Los Guaricanos",
        "Majagual", "Marañón", "Mirador del Norte", "Paraíso del Norte", "Ponce", "Punta",
        "Residencial Máximo Gómez", "Residencial Roalva", "Sabana Perdida", "San Felipe",
        "Santa Cruz", "Sierra Prieta", "Sol de Luz", "Urbanización Lotes y Servicios", "Villa Mella"
    ],
    "Otros Municipios / Provincias": [] // For newly created sectors
};

function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function findMunicipalityBySector(sectorName) {
    if (!sectorName) return { municipality: null, sector: null };

    let normTarget = normalizeText(sectorName);

    for (const [municipality, sectors] of Object.entries(SECTORS)) {
        for (const s of sectors) {
            if (normalizeText(s) === normTarget) {
                return { municipality, sector: s };
            }
        }
    }

    // If not found, add to "Otros Municipios / Provincias" dynamically
    let formattedNewSector = sectorName.trim();
    if (formattedNewSector) {
        if (!SECTORS["Otros Municipios / Provincias"].includes(formattedNewSector)) {
            SECTORS["Otros Municipios / Provincias"].push(formattedNewSector);
        }
        return { municipality: "Otros Municipios / Provincias", sector: formattedNewSector };
    }

    return { municipality: null, sector: null };
}

function calculateAge(dobString) {
    if (!dobString) return null;
    const parts = dobString.split('/');
    if (parts.length === 3) {
        const bd = new Date(parts[2], parts[1] - 1, parts[0]);
        if (isNaN(bd.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - bd.getFullYear();
        const m = today.getMonth() - bd.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) {
            age--;
        }
        return age;
    }
    return null;
}

async function runImport() {
    const fileContent = fs.readFileSync('members.csv', 'utf-8');
    const records = parse(fileContent, {
        columns: false,
        skip_empty_lines: true,
        from_line: 2 // skip header
    });

    const rowsToInsert = [];

    console.log(`Processing ${records.length} records from CSV...`);

    for (const row of records) {
        // Handle indexing safely
        const email = row[1] || row[29] || null;
        const fullName = row[2] || "Sin Nombre";
        const dob = row[3] || null;
        const sectorRaw = row[4] || row[18] || "";
        const phone = row[5] || null;
        const civilStatus = row[6] || null;
        const spouseName = row[7] || null;
        const hasChildren = row[8]?.toLowerCase().includes("sí") ? 1 : 0;
        const childrenCountStr = row[9];
        const professions = row[11] || null;
        const hobbies = row[12] || null;
        const alliesStatus = row[13]?.toLowerCase().includes("sí") ? 'SI' : 'NO';
        const previousChurch = row[14]?.toLowerCase().includes("sí") ? 1 : 0;
        const isBaptized = row[16]?.toLowerCase().includes("sí") ? 1 : 0;
        const address = row[23] || null;
        const emergencyPhone = row[24] || null;
        const bloodType = row[25] || null;
        const allergies = row[28] || null;

        const age = calculateAge(dob);
        const { municipality, sector } = findMunicipalityBySector(sectorRaw);

        // Map to DB Schema
        const dbRow = {
            full_name: fullName,
            email: email,
            phone: phone,
            address: address,
            municipality: municipality,
            sector: sector,
            age: age,
            status: 'MIEMBRO_ACTIVO',
            visit_count: 0,
            profession: professions,
            civil_status: civilStatus,
            spouse_name: spouseName,
            has_children: !!hasChildren,
            children_count: childrenCountStr ? parseInt(childrenCountStr, 10) : null,
            allies_course_status: alliesStatus,
            previous_church_member: !!previousChurch,
            is_baptized: !!isBaptized,
            hobbies: hobbies,
            blood_type: bloodType,
            medication_allergies: allergies,
            emergency_contact_phone: emergencyPhone
        };

        rowsToInsert.push(dbRow);
    }

    console.log(`Inserting ${rowsToInsert.length} mapped records into Supabase...`);

    // Insert in chunks of 50 to avoid payload limits
    const chunkSize = 50;
    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        const chunk = rowsToInsert.slice(i, i + chunkSize);
        const { data, error } = await supabase.from('people').insert(chunk);
        if (error) {
            console.error("Error inserting chunk " + (i / chunkSize + 1) + ":", error);
        } else {
            console.log("Inserted chunk " + (i / chunkSize + 1) + " successfully.");
        }
    }

    console.log("Import completed!");

    // Generate the newly updated sectors.ts content so we can update the active source
    const sectorsFileContent = 'export const SECTORS: Record<string, string[]> = ' + JSON.stringify(SECTORS, null, 4) + ';';
    fs.writeFileSync('src/data/sectors.ts', sectorsFileContent, 'utf-8');
    console.log("Updated src/data/sectors.ts with newly found sectors.");
}

runImport().catch(console.error);
