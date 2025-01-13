import { Mwn } from 'mwn';

const bot = new Mwn({
  apiUrl: 'https://www.pokepedia.fr/api.php',
  userAgent: 'tcgp-helper/1.0 mwn/2.0.4',
});

await bot.getSiteInfo();

const page = new bot.Page('Puissance_Génétique');
const text = new bot.Wikitext(await page.text());
const section = text.parseSections().find(s => s.header === 'Liste des cartes');
if (!section) throw new Error('Section "Liste des cartes" non trouvée');
section.content = section.content.replace('== Liste des cartes ==\n\n', '').replace('! colspan="3" | [[Booster (JCC)|Booster]] d\'obtention\n|-\n', '');
const table = bot.Wikitext.parseTable(section.content) as unknown as ApiTableData[];
console.log(table[0]);

interface ApiTableData {
  'Numéro': string;
  'Nom de la [[Carte Pokémon|carte]]': string;
  '[[Rareté]]': string;
  Type: string;
  '[[Fichier:Logo Booster Puissance Génétique Pikachu JCCP.png|Booster Pikachu|x25px]]': '✓' | '✗';
  '[[Fichier:Logo Booster Puissance Génétique Dracaufeu JCCP.png|Booster Dracaufeu|x25px]]': '✓' | '✗';
  '[[Fichier:Logo Booster Puissance Génétique Mewtwo JCCP.png|Booster Mewtwo|x25px]]': '✓' | '✗';
}

//  {
//     "Numéro": "100<small>/226</small>",
//     "Nom de la [[Carte Pokémon|carte]]": "[[Électrode (Puissance Génétique 100)|Électrode]]",
//     "[[Rareté]]": "{{Rareté JCC|2 losanges}}",
//     Type: "{{Type|électrique|jcc}}",
//     "[[Fichier:Logo Booster Puissance Génétique Pikachu JCCP.png|Booster Pikachu|x25px]]": "✓",
//     "[[Fichier:Logo Booster Puissance Génétique Dracaufeu JCCP.png|Booster Dracaufeu|x25px]]": "✗",
//     "[[Fichier:Logo Booster Puissance Génétique Mewtwo JCCP.png|Booster Mewtwo|x25px]]": "✗",
//   },

// const cards = new bot.Category('Carte_du_JCCP');
// const pages = await cards.pages();
// console.log(pages);
