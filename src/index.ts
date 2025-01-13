// noinspection JSNonASCIINames

import { Mwn } from 'mwn';

interface ApiTableData {
  'Numéro': string;
  'Nom de la [[Carte Pokémon|carte]]': string;
  '[[Rareté]]': string;
  Type: string;
  '[[Fichier:Logo Booster Puissance Génétique Pikachu JCCP.png|Booster Pikachu|x25px]]': '✓' | '✗';
  '[[Fichier:Logo Booster Puissance Génétique Dracaufeu JCCP.png|Booster Dracaufeu|x25px]]': '✓' | '✗';
  '[[Fichier:Logo Booster Puissance Génétique Mewtwo JCCP.png|Booster Mewtwo|x25px]]': '✓' | '✗';
}

interface PokemonCard {
  number: string; // e.g., "001"
  name: string; // e.g., "Bulbizarre"
  rarity: string; // e.g., "Common"
  type: string; // e.g., "Plante"
  pack: string; // e.g., "Mewtwo"
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function mapToPokemonCard(data: ApiTableData): PokemonCard {
  const rarityMap: { [key: string]: string } = {
    "1 losange": "Common",
    // Add more mappings as needed
  };
  const packAvailability: { [key: string]: boolean } = {
    "Pikachu": data["[[Fichier:Logo Booster Puissance Génétique Pikachu JCCP.png|Booster Pikachu|x25px]]"] === '✓',
    "Dracaufeu": data["[[Fichier:Logo Booster Puissance Génétique Dracaufeu JCCP.png|Booster Dracaufeu|x25px]]"] === '✓',
    "Mewtwo": data["[[Fichier:Logo Booster Puissance Génétique Mewtwo JCCP.png|Booster Mewtwo|x25px]]"] === '✓',
  };

  // Determine which packs are available
  const availablePacks = Object.keys(packAvailability).filter((packName) => packAvailability[packName]);

  return {
    number: data["Numéro"].split('<')[0]!.trim(),
    name: data["Nom de la [[Carte Pokémon|carte]]"].replace(/\[\[(.+?) \(.+/, '$1').trim(),
    rarity: rarityMap[data["[[Rareté]]"].replace(/.+?\|(.+?)/, '$1').trim()] ?? "Unknown",
    type: capitalize(data["Type"].replace(/{{Type\|(.+?)\|.+/, '$1').replace(/\[\[.+?\|(.+)]]/, '$1').trim()),
    pack: availablePacks.length > 1 ? 'Any' : availablePacks[0] ?? 'None',
  };
}

function parseTable(content: string): PokemonCard[] {
  content = content.replace('== Liste des cartes ==\n\n', '').replace('! colspan="3" | [[Booster (JCC)|Booster]] d\'obtention\n|-\n', '');
  const table = bot.Wikitext.parseTable(content) as unknown as ApiTableData[];
  return table.map(mapToPokemonCard)
}

const bot = new Mwn({
  apiUrl: 'https://www.pokepedia.fr/api.php',
  userAgent: 'tcgp-helper/1.0 mwn/2.0.4',
});

await bot.getSiteInfo();

const page = new bot.Page('Puissance_Génétique');
const text = new bot.Wikitext(await page.text());
const section = text.parseSections().find(s => s.header === 'Liste des cartes');
if (!section) throw new Error('Section "Liste des cartes" non trouvée');
const table = parseTable(section.content);
console.log(table);

//{
//     "Numéro": "100<small>/226</small>",
//     "Nom de la [[Carte Pokémon|carte]]": "[[Électrode (Puissance Génétique 100)|Électrode]]",
//     "[[Rareté]]": "{{Rareté JCC|2 losanges}}",
//     Type: "{{Type|électrique|jcc}}",
//     "[[Fichier:Logo Booster Puissance Génétique Pikachu JCCP.png|Booster Pikachu|x25px]]": "✓",
//     "[[Fichier:Logo Booster Puissance Génétique Dracaufeu JCCP.png|Booster Dracaufeu|x25px]]": "✗",
//     "[[Fichier:Logo Booster Puissance Génétique Mewtwo JCCP.png|Booster Mewtwo|x25px]]": "✗",
//},
