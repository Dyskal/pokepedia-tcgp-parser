/* eslint-disable no-await-in-loop, import/no-extraneous-dependencies */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import type { Pokemon } from '@/stores/usePokemonStore';

// Créer un dossier pour stocker les images
const dir = './utils/data/images';
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

// Fonction pour télécharger une image
async function downloadImage(url: string, filename: string) {
  const response = await (await fetch(url)).arrayBuffer();
  writeFileSync(filename, Buffer.from(response));
  console.log(`Téléchargé: ${filename}`);
}

// Fonction pour formater l'ID avec des zéros
async function scrapeImages() {
  for (let idCarte = 1; idCarte <= 24; idCarte += 1) {
    const formattedId = String(idCarte).padStart(3, '0');

    // const url = `https://www.pokepedia.fr/Fichier:Carte_Puissance_Génétique_${formattedId}.png`;
    const url = `https://www.pokepedia.fr/Fichier:Carte_Promo-A_${formattedId}.png`;

    try {
      const response = await (await fetch(url)).text();
      const $ = load(response);
      const title = $('#firstHeading').text();
      const imgTag = $(`img[alt="${title}"]`);

      if (imgTag.length > 0) {
        let imgUrl = imgTag.attr('src');
        if (imgUrl) {
          if (imgUrl.startsWith('/')) {
            imgUrl = `https://www.pokepedia.fr${imgUrl}`;
          }
          const filename = join(dir, `pa-${formattedId}.png`);
          await downloadImage(imgUrl, filename);
        }
      } else {
        console.log(`Aucune image trouvée pour l'ID ${formattedId}.`);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de la page pour l'ID ${formattedId}: ${error?.toString()}`);
    }
  }
}

// Fonction pour récupérer les noms français des Pokémon
async function fetchFrenchNames() {
  const url = 'https://www.pokepedia.fr/Puissance_Génétique';
  const response = await (await fetch(url)).text();
  const $ = load(response);

  const frenchNames: Record<string, string> = {};

  // Sélecteur pour récupérer les noms français
  const nameElements = $('#mw-content-text > div.mw-parser-output > table.tableaustandard.sortable.centre.entetefixe > tbody > tr > td:nth-child(2)');

  nameElements.each((index: number, element: unknown) => {
    let result = $(element).find('a').text();

    // Vérifier si un <span> existe
    if ($(element).find('span').length > 0) {
      result += ' ex';
    }

    frenchNames[`a1-${String(index + 1).padStart(3, '0')}`] = result;
  });

  return frenchNames;
}

// Fonction pour remplacer les noms dans le JSON
async function replaceNamesInJson() {
  const frenchNames = await fetchFrenchNames();

  const v1 = await (await fetch('https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/refs/heads/main/v1.json')).json() as Pokemon[];

  v1.forEach((pokemon) => {
    if (frenchNames[pokemon.id]) {
      pokemon.name = frenchNames[pokemon.id]!; // Remplacer le nom anglais par le nom français
    }
  });

  writeFileSync('./data/v2.json', JSON.stringify(v1, null, 2));
}

// Lancer le remplacement
await replaceNamesInJson();

// Lancer le scraping
await scrapeImages();
