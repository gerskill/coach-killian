/* Coach Killian – suivi nutrition & entraînement (vanilla JS, données en localStorage) */
'use strict';

/* ---------- Données par défaut ---------- */
const STORE_KEY = 'coachKillian.v1';
const DEFAULT_GOALS = { kcal: 3150, p: 145, g: 440, l: 85 };

// valeurs par portion ; kcal ≈ 4P + 4G + 9L
const DEFAULT_PRESETS = [
  { id: 'riz-poulet-curry', e: '🍛', name: 'Riz poulet curry', kcal: 790, p: 40, g: 117, l: 18, cat: 'plat' },
  { id: 'pates-thon-tomate', e: '🍝', name: 'Pâtes thon tomate', kcal: 750, p: 43, g: 109, l: 16, cat: 'plat' },
  { id: 'couscous-poulet', e: '🥘', name: 'Couscous poulet légumes', kcal: 780, p: 42, g: 115, l: 17, cat: 'plat' },
  { id: 'chili', e: '🌶️', name: 'Chili steak haché lentilles riz', kcal: 800, p: 45, g: 110, l: 20, cat: 'plat' },
  { id: 'poulet-pates-legumes', e: '🍝', name: 'Poulet pâtes légumes', kcal: 780, p: 42, g: 112, l: 18, cat: 'plat' },
  { id: 'hachis', e: '🥔', name: 'Hachis parmentier', kcal: 760, p: 40, g: 92, l: 26, cat: 'plat' },
  { id: 'curry-coco', e: '🥥', name: 'Curry poulet patate douce lait de coco', kcal: 790, p: 40, g: 94, l: 28, cat: 'plat' },
  { id: 'poulet-riz-legumes', e: '🍚', name: 'Poulet riz légumes', kcal: 760, p: 43, g: 115, l: 14, cat: 'plat' },
  { id: 'shaker', e: '🥤', name: 'Shaker maison', kcal: 600, p: 30, g: 64, l: 25, cat: 'shaker',
    desc: '30 cl lait, 1 banane, 30 g beurre de cacahuète, 150 g fromage blanc, 1 c.s. miel' },
  { id: 'crepes', e: '🥞', name: 'Crêpes protéinées (recette entière)', kcal: 660, p: 40, g: 82, l: 19, cat: 'petit-dej',
    desc: '2 œufs, 200 g fromage blanc, 80 g farine, 150 ml lait, miel. ½ = 8-9 petites crêpes' },
  { id: 'omelette', e: '🍳', name: 'Petit-déj omelette', kcal: 690, p: 24, g: 110, l: 17, cat: 'petit-dej',
    desc: '2 œufs, 100 g pain complet, miel, banane, jus d\u2019orange' },
  { id: 'on-banane-pb', e: '🍌', name: 'Overnight banane beurre de cacahuète', kcal: 600, p: 30, g: 80, l: 18, cat: 'petit-dej' },
  { id: 'on-chocolat', e: '🍫', name: 'Overnight chocolat', kcal: 550, p: 30, g: 80, l: 12, cat: 'petit-dej' },
  { id: 'on-fruits-rouges', e: '🫐', name: 'Overnight fruits rouges', kcal: 500, p: 28, g: 68, l: 13, cat: 'petit-dej' },
  { id: 'wraps-poulet', e: '🌯', name: 'Wraps poulet', kcal: 780, p: 45, g: 100, l: 22, cat: 'plat',
    desc: '2 grandes tortillas, 110 g poulet, crème fraîche, 20 g emmental, crudités + 1 pomme' },
  { id: 'tortilla-espagnole', e: '🥚', name: 'Tortilla espagnole', kcal: 780, p: 37, g: 86, l: 32, cat: 'plat',
    desc: '3 œufs, 350 g pommes de terre, oignon, 20 g emmental, 1 tranche de pain' }
];
// repas rapides ajoutés après la v1 : injectés une seule fois dans les données existantes
const PRESETS_REV = 2;
const PRESETS_ADDED = { 2: ['wraps-poulet', 'tortilla-espagnole'] };


// aliments de base, pour 100 g (valeurs moyennes type table CIQUAL)
const BASE_FOODS = [
  ['Riz blanc cru', 357, 7, 78, 0.6], ['Riz blanc cuit', 130, 2.7, 28, 0.3],
  ['Pâtes crues', 357, 12.5, 72, 1.5], ['Pâtes cuites', 150, 5, 30, 0.9],
  ['Semoule crue', 360, 12, 73, 1.5], ['Flocons d\u2019avoine', 370, 13.5, 58, 7],
  ['Blanc de poulet cru', 110, 23, 0, 2], ['Blanc de poulet cuit', 150, 31, 0, 3],
  ['Steak haché 5 % cru', 125, 21, 0, 5], ['Steak haché 15 % cru', 215, 18, 0, 15],
  ['Thon au naturel (égoutté)', 115, 26, 0, 1], ['Œuf entier (≈ 55 g sans coquille)', 140, 12.5, 0.7, 10],
  ['Lait demi-écrémé', 46, 3.3, 4.8, 1.6], ['Fromage blanc 3 %', 75, 7.5, 4, 3],
  ['Fromage blanc 0 %', 46, 7.5, 4, 0.2], ['Yaourt grec (10 %)', 125, 5, 4, 10],
  ['Skyr nature', 60, 10, 4, 0.2], ['Emmental râpé', 380, 28, 0, 30],
  ['Banane', 90, 1.1, 20, 0.3], ['Pomme', 54, 0.3, 12, 0.2], ['Fruits rouges surgelés', 45, 1, 8, 0.3],
  ['Jus d\u2019orange', 45, 0.7, 10, 0.2], ['Pain complet', 245, 9, 41, 3.3], ['Pain blanc (baguette)', 270, 9, 55, 1.2],
  ['Farine de blé T55', 345, 10, 72, 1.2], ['Beurre de cacahuète', 600, 25, 13, 50], ['Miel', 310, 0.4, 80, 0],
  ['Huile d\u2019olive', 900, 0, 0, 100], ['Beurre', 740, 0.7, 0.6, 82], ['Lentilles cuites', 116, 9, 17, 0.4],
  ['Pois chiches cuits', 140, 8, 20, 2.5], ['Pomme de terre cuite', 80, 2, 17, 0.1], ['Patate douce cuite', 86, 1.6, 20, 0.1],
  ['Lait de coco', 180, 1.6, 3, 18], ['Sauce tomate', 40, 1.5, 6, 1], ['Brocoli cuit', 35, 2.8, 4, 0.4],
  ['Haricots verts cuits', 30, 2, 4, 0.2], ['Amandes', 600, 21, 9, 52], ['Cacao non sucré', 360, 20, 13, 20],
  ['Graines de chia', 490, 17, 8, 31], ['Saumon cru', 200, 20, 0, 13], ['Jambon blanc', 115, 20, 1, 3.5]
].map(([name, kcal, p, g, l]) => ({ name, kcal, p, g, l }));

const WORKOUTS = {
  A: [
    { name: 'Développé couché haltères', sets: 4, target: '6-10' },
    { name: 'Rowing barre buste penché', sets: 4, target: '6-10' },
    { name: 'Squat bulgare', sets: 3, target: '8-10 / jambe' },
    { name: 'Développé militaire barre', sets: 3, target: '6-10' },
    { name: 'Curl haltères', sets: 3, target: '8-12' }
  ],
  B: [
    { name: 'Soulevé de terre', sets: 4, target: '5-8' },
    { name: 'Dips buste penché', sets: 4, target: '6-10' },
    { name: 'Tractions prise large', sets: 4, target: 'max' },
    { name: 'Hip thrust barre', sets: 3, target: '8-12' },
    { name: 'Barre au front', sets: 3, target: '8-12' }
  ]
};

/* ---------- Recettes ----------
 * Quantités pour 1 portion (poids cru), reprises du plan alimentaire / batch cooking.
 * ing : [quantité, unité, nom (singulier|pluriel), note]  · unités : g, cl, ml, pc (pièce), cs, cc ; si quantité null, l'unité est le texte affiché (« au goût »)
 * Les macros affichées viennent du repas rapide de même id (S.presets) pour rester cohérentes. */
const RECIPES = [
  { id: 'riz-poulet-curry', cat: 'plat', time: '30 min', ing: [
      [120, 'g', 'Blanc de poulet'], [130, 'g', 'Riz (cru)'], [200, 'g', 'Légumes', 'surgelés OK : poêlée, haricots verts, brocolis'],
      [5, 'cl', 'Lait de coco'], [5, 'g', 'Huile', '1 c. à c. par portion'], [1 / 3, 'pc', 'Oignon|Oignons'], [null, 'au goût', 'Curry', '≈ 1 c. à s. pour 3-4 portions']],
    steps: ['Cuis le riz 12 min dans un grand volume d\u2019eau salée, égoutte et étale-le pour qu\u2019il refroidisse vite.',
      'Fais dorer l\u2019oignon émincé et le poulet en dés dans l\u2019huile, 6-8 min.',
      'Ajoute le curry, les légumes et le lait de coco, puis laisse mijoter 10 min à couvert.',
      'Répartis le riz et le curry dans les boîtes.'],
    keep: '3-4 jours au frigo. Le curry se congèle très bien (2 mois). Refroidis le riz vite et réchauffe-le bien chaud partout.' },
  { id: 'pates-thon-tomate', cat: 'plat', time: '15 min', ing: [
      [140, 'g', 'Pâtes (crues)'], [1, 'pc', 'Boîte de thon au naturel|Boîtes de thon au naturel', '≈ 90 g égoutté par boîte'],
      [150, 'g', 'Sauce tomate'], [10, 'g', 'Huile d\u2019olive', '1 c. à s. par portion'], [null, 'au goût', 'Ail, herbes de Provence']],
    steps: ['Cuis les pâtes 1 min de moins qu\u2019indiqué, égoutte et ajoute un filet d\u2019huile pour qu\u2019elles ne collent pas.',
      'Chauffe la sauce tomate avec le reste de l\u2019huile, l\u2019ail et les herbes.',
      'Hors du feu, ajoute le thon égoutté et mélange avec les pâtes.'],
    keep: '3-4 jours au frigo. Ajoute 1 c. à s. d\u2019eau avant de réchauffer au micro-ondes pour que les pâtes ne sèchent pas.' },
  { id: 'couscous-poulet', cat: 'plat', time: '35 min', name: 'Couscous poulet légumes sauce tomate', ing: [
      [100, 'g', 'Blanc de poulet'], [130, 'g', 'Semoule (crue)'], [250, 'g', 'Légumes couscous', 'courgette, carotte, oignon (surgelés OK)'],
      [100, 'g', 'Sauce tomate'], [10, 'g', 'Huile', '1 c. à s. par portion'], [null, 'au goût', 'Ras el hanout + bouillon de volaille', '1 c. à s. + ½ cube pour 3-4 portions']],
    steps: ['Fais dorer le poulet en dés dans l\u2019huile (garde 1 c. à c. pour la semoule).',
      'Ajoute les légumes, la sauce tomate, le ras el hanout, le bouillon et un peu d\u2019eau (≈ 5 cl par portion). Laisse mijoter 20 min.',
      'Semoule : verse le même volume d\u2019eau bouillante salée avec 1 c. à c. d\u2019huile, couvre 5 min puis égrène à la fourchette.',
      'Mets en boîtes : la semoule d\u2019un côté, la viande et les légumes de l\u2019autre.'],
    keep: '3-4 jours au frigo, la sauce se congèle très bien. Réchauffe la semoule 1 min avec 1 c. à s. d\u2019eau, puis verse la sauce chaude dessus.' },
  { id: 'chili', cat: 'plat', time: '40 min', ing: [
      [100, 'g', 'Steak haché 5 %'], [60, 'g', 'Lentilles vertes sèches', '= 150 g cuites par portion'], [100, 'g', 'Riz (cru)'],
      [100, 'g', 'Sauce tomate'], [1 / 3, 'pc', 'Oignon|Oignons'], [10, 'g', 'Huile', '1 c. à s. par portion'], [null, 'au goût', 'Cumin + paprika', '1 c. à c. de chaque pour 3 portions']],
    steps: ['Rince les lentilles et cuis-les 20-25 min dans 3 fois leur volume d\u2019eau froide, sans sel (sale à la fin). Égoutte.',
      'En même temps, cuis le riz 12 min, égoutte et étale-le pour qu\u2019il refroidisse vite.',
      'Fais revenir l\u2019oignon dans l\u2019huile, ajoute le steak haché en l\u2019émiettant, puis le cumin et le paprika.',
      'Ajoute la sauce tomate et les lentilles, laisse mijoter 10 min, puis mets en boîtes avec le riz.'],
    keep: '3-4 jours au frigo, se congèle très bien, et c\u2019est encore meilleur le lendemain. Steak haché surgelé : décongèle-le au frigo la veille.' },
  { id: 'poulet-pates-legumes', cat: 'plat', time: '25 min', ing: [
      [110, 'g', 'Blanc de poulet'], [135, 'g', 'Pâtes (crues)'], [200, 'g', 'Légumes', 'poêlée, courgettes, brocolis'],
      [10, 'g', 'Huile', '1 c. à s. par portion'], [null, 'au goût', 'Ail, paprika ou herbes', 'change chaque semaine']],
    steps: ['Cuis les pâtes al dente et égoutte-les.',
      'Fais dorer le poulet en dés dans l\u2019huile avec l\u2019ail et les épices.',
      'Ajoute les légumes et fais cuire 8-10 min, puis mélange avec les pâtes.'],
    keep: '3-4 jours au frigo. Ajoute 1 c. à s. d\u2019eau avant de réchauffer.' },
  { id: 'hachis', cat: 'plat', time: '50 min', ing: [
      [120, 'g', 'Steak haché 5 %'], [500, 'g', 'Pommes de terre'], [8, 'cl', 'Lait demi-écrémé', 'pour la purée'],
      [10, 'g', 'Beurre'], [20, 'g', 'Emmental râpé'], [1 / 3, 'pc', 'Oignon|Oignons'], [null, 'au goût', 'Sel, poivre, muscade']],
    steps: ['Épluche les pommes de terre, coupe-les en morceaux et mets-les dans l\u2019eau froide salée : 20-25 min après l\u2019ébullition.',
      'Fais revenir l\u2019oignon, ajoute le steak haché en l\u2019émiettant, sale et poivre.',
      'Écrase les pommes de terre avec le lait chaud et le beurre (une pincée de muscade si tu aimes).',
      'Dans des boîtes qui passent au micro-ondes : la viande au fond, la purée dessus, puis l\u2019emmental.',
      'Si tu veux, fais gratiner 10 min au four à 200 °C.'],
    keep: '3-4 jours au frigo, se congèle parfaitement en portions (2 mois). Réchauffe 3-4 min au micro-ondes, couvercle entrouvert, jusqu\u2019à ce que ce soit bien chaud au centre.' },
  { id: 'curry-coco', cat: 'plat', time: '40 min', ing: [
      [120, 'g', 'Blanc de poulet'], [150, 'g', 'Patate douce', 'en dés de 1 cm'], [100, 'g', 'Riz (cru)'], [5, 'cl', 'Lait de coco'],
      [100, 'g', 'Légumes', 'poivrons, haricots verts…'], [5, 'g', 'Huile', '1 c. à c. par portion'], [1 / 3, 'pc', 'Oignon|Oignons'], [null, 'au goût', 'Curry']],
    steps: ['Cuis le riz 12 min, égoutte et étale-le pour qu\u2019il refroidisse vite.',
      'Fais revenir l\u2019oignon et le poulet en dés dans l\u2019huile, puis ajoute le curry.',
      'Ajoute la patate douce en petits dés, le lait de coco et un peu d\u2019eau (≈ 3 cl par portion). Laisse mijoter 20 min à couvert.',
      'Quand la patate douce est fondante, écrase-la un peu à la fourchette pour épaissir la sauce : on ne sent plus sa texture.',
      'Ajoute les légumes 5 min avant la fin, puis mets en boîtes avec le riz.'],
    keep: '3-4 jours au frigo, le curry se congèle très bien. Si tu congèles, garde le riz à part, il se réchauffe mieux.' },
  { id: 'poulet-riz-legumes', cat: 'plat', time: '25 min', ing: [
      [120, 'g', 'Blanc de poulet'], [130, 'g', 'Riz (cru)'], [200, 'g', 'Légumes', 'poêlée, brocolis'],
      [10, 'g', 'Huile', '1 c. à s. par portion'], [null, 'au goût', 'Paprika, herbes ou sauce soja']],
    steps: ['Cuis le riz 12 min, égoutte et étale-le pour qu\u2019il refroidisse vite.',
      'Fais dorer le poulet en lanières dans l\u2019huile avec les épices.',
      'Ajoute les légumes et fais sauter 8 min, puis mets en boîtes avec le riz.'],
    keep: '3-4 jours au frigo. Le riz doit être bien chaud partout au réchauffage.' },
  { id: 'wraps-poulet', cat: 'plat', time: '15 min', ing: [
      [2, 'pc', 'Grande tortilla de blé|Grandes tortillas de blé'], [110, 'g', 'Blanc de poulet'], [1, 'cs', 'Crème fraîche'],
      [20, 'g', 'Emmental râpé'], [null, 'une poignée', 'Crudités', 'salade, tomate, carotte râpée'], [1, 'pc', 'Pomme|Pommes', 'en dessert'], [null, 'au goût', 'Paprika, sel, poivre']],
    steps: ['Coupe le poulet en lanières et fais-le cuire 6-8 min dans une poêle antiadhésive avec le paprika, le sel et le poivre.',
      'Chauffe les tortillas 20 s par face à la poêle (ou 15 s au micro-ondes).',
      'Étale la crème fraîche, ajoute le poulet, l\u2019emmental et les crudités.',
      'Replie les bords et roule bien serré. La pomme en dessert.'],
    keep: 'À monter le jour même (10 min). Tu peux cuire le poulet à l\u2019avance (3 jours au frigo) et assembler au moment de manger pour que la tortilla ne ramollisse pas.' },
  { id: 'tortilla-espagnole', cat: 'plat', time: '30 min', name: 'Tortilla espagnole (omelette pommes de terre)', ing: [
      [3, 'pc', 'Œuf|Œufs'], [350, 'g', 'Pommes de terre'], [1 / 2, 'pc', 'Oignon|Oignons'], [10, 'g', 'Huile d\u2019olive', '1 c. à s. par portion'],
      [20, 'g', 'Emmental râpé'], [1, 'pc', 'Tranche de pain|Tranches de pain'], [null, 'au goût', 'Sel, poivre']],
    steps: ['Épluche les pommes de terre et coupe-les en fines tranches (3 mm).',
      'Fais-les cuire avec l\u2019oignon émincé dans l\u2019huile, à feu moyen et à couvert, 15 min jusqu\u2019à ce qu\u2019elles soient tendres.',
      'Bats les œufs avec le sel, le poivre et l\u2019emmental, puis ajoute les pommes de terre.',
      'Reverse dans la poêle, 5 min à feu doux et à couvert. Retourne avec une assiette et cuis encore 3-4 min : elle doit être bien prise au centre.',
      'Sers avec la tranche de pain.'],
    keep: '2-3 jours au frigo. Se mange froide ou tiède, pratique à emporter.' },
  { id: 'shaker', cat: 'shaker', time: '2 min', ing: [
      [30, 'cl', 'Lait demi-écrémé'], [1, 'pc', 'Banane|Bananes'], [30, 'g', 'Beurre de cacahuète'], [150, 'g', 'Fromage blanc 3 %'], [1, 'cs', 'Miel']],
    steps: ['Mets tout dans le mixeur.', 'Mixe 30 secondes et bois tout de suite.'],
    keep: 'À boire de préférence tout de suite, ou 24 h maximum au frigo dans une bouteille fermée (secoue avant).',
    note: 'Si tu prends de la créatine, ajoute tes 3-5 g dans un des shakers de la journée.' },
  { id: 'crepes', cat: 'petit-dej', time: '25 min', name: 'Crêpes protéinées', unit: 'recette entière (6 crêpes ou 15-18 petites)', ing: [
      [2, 'pc', 'Œuf|Œufs'], [200, 'g', 'Fromage blanc 3 %'], [80, 'g', 'Farine'], [150, 'ml', 'Lait'], [1, 'cc', 'Miel'], [null, '1 pincée', 'Sel']],
    steps: ['Mixe tous les ingrédients jusqu\u2019à obtenir une pâte lisse.', 'Laisse reposer 10 min.',
      'Fais chauffer une poêle légèrement huilée, verse une petite louche de pâte et cuis environ 1 min par face.'],
    keep: '3 jours au frigo, filmées ou en boîte. Réchauffe 20 s au micro-ondes.',
    note: 'Machine crêpe party : 15-18 petites crêpes avec la même pâte. 1 c. à s. de pâte par emplacement, environ 1 min par face (quand des bulles apparaissent). Huile la plaque avant la 1re fournée, et ajoute 2-3 c. à s. de lait si la pâte s\u2019étale mal. Mange la moitié au petit-déj et l\u2019autre moitié en collation, ou garde-la pour le lendemain. Avec beurre de cacahuète + banane dessus : ≈ +300 kcal.' },
  { id: 'omelette', cat: 'petit-dej', time: '10 min', ing: [
      [2, 'pc', 'Œuf|Œufs', 'en omelette, ou à la coque'], [5, 'g', 'Beurre'], [100, 'g', 'Pain complet', '≈ 3 tranches par portion'],
      [15, 'g', 'Miel'], [1, 'pc', 'Banane|Bananes'], [25, 'cl', 'Jus d\u2019orange']],
    steps: ['Bats les œufs avec une pincée de sel.',
      'Fais fondre le beurre dans une poêle à feu moyen, verse les œufs et cuis 2-3 min en ramenant les bords vers le centre, jusqu\u2019à ce que l\u2019omelette soit prise.',
      'Toaste le pain et tartine-le de miel. Avec la banane et le verre de jus d\u2019orange.'],
    keep: 'À préparer minute. Le pain complet se congèle en tranches et passe directement au grille-pain.' },
  { id: 'on-banane-pb', cat: 'petit-dej', time: '5 min + 1 nuit', unit: 'bocal', ing: [
      [60, 'g', 'Flocons d\u2019avoine fins', 'ou mixés en poudre pour ne plus sentir la texture'], [200, 'ml', 'Lait'], [150, 'g', 'Yaourt grec'],
      [1, 'pc', 'Banane écrasée|Bananes écrasées'], [1, 'cs', 'Beurre de cacahuète'], [1, 'cc', 'Miel']],
    steps: ['Écrase la banane au fond d\u2019un bocal.', 'Ajoute tous les autres ingrédients et mélange bien.',
      'Ferme et laisse au frigo toute la nuit (6 h minimum).', 'Le matin, mélange et ajoute un peu de lait si c\u2019est trop épais.'],
    keep: '2 jours maximum au frigo, bocal fermé.', oats: true },
  { id: 'on-chocolat', cat: 'petit-dej', time: '5 min + 1 nuit', unit: 'bocal', ing: [
      [60, 'g', 'Flocons d\u2019avoine fins', 'ou mixés en poudre'], [200, 'ml', 'Lait'], [150, 'g', 'Fromage blanc'],
      [1, 'cs', 'Cacao non sucré'], [1, 'cs', 'Miel'], [1 / 2, 'pc', 'Banane|Bananes']],
    steps: ['Mélange le lait, le cacao et le miel dans un bocal jusqu\u2019à ce qu\u2019il n\u2019y ait plus de grumeaux.',
      'Ajoute les flocons, le fromage blanc et la banane en rondelles, puis mélange.',
      'Ferme et laisse au frigo toute la nuit (6 h minimum).'],
    keep: '2 jours maximum au frigo, bocal fermé.', oats: true },
  { id: 'on-fruits-rouges', cat: 'petit-dej', time: '5 min + 1 nuit', unit: 'bocal', ing: [
      [60, 'g', 'Flocons d\u2019avoine fins', 'ou mixés en poudre'], [200, 'ml', 'Lait'], [150, 'g', 'Yaourt grec'],
      [100, 'g', 'Fruits rouges surgelés'], [1, 'cs', 'Graines de chia'], [1, 'cc', 'Miel']],
    steps: ['Mélange les flocons, le lait, le yaourt grec, les graines de chia et le miel dans un bocal.',
      'Ajoute les fruits rouges encore surgelés par-dessus : ils décongèlent pendant la nuit.',
      'Ferme et laisse au frigo toute la nuit (6 h minimum), puis mélange le matin.'],
    keep: '2 jours maximum au frigo, bocal fermé.', oats: true }
];
const RECIPE_CATS = { plat: 'Plats', 'petit-dej': 'Petit-déj', shaker: 'Shakers' };
const RECIPE_PORTIONS = [1, 3, 4, 7];
const SANS_AVOINE = 'Version sans avoine : remplace les 60 g de flocons par 2 tranches de pain complet émiettées ou 60 g de semoule fine. Ça fait un pudding de nuit avec la même texture.';
const recipeById = id => RECIPES.find(r => r.id === id);

/* ---------- État & stockage ---------- */
function freshState() {
  return {
    version: 1,
    presetsRev: PRESETS_REV,
    goals: { ...DEFAULT_GOALS },
    profile: { startW: 64, goalW: 75 },
    presets: DEFAULT_PRESETS.map(p => ({ ...p })),
    log: {},          // { 'AAAA-MM-JJ': [entrée] }
    workouts: [],     // [{ id, date, type, ex:[{name, sets:[{w,r}]}] }]
    weights: [],      // [{ date, kg }]
    draft: null
  };
}
let S = load();
let curDate = todayKey();
let portion = 1;

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return freshState();
    return migrate(JSON.parse(raw));
  } catch (e) { console.warn('load', e); return freshState(); }
}
function migrate(d) {
  const st = Object.assign(freshState(), d);
  const rev = +d.presetsRev || 1;
  for (let v = rev + 1; v <= PRESETS_REV; v++) {
    for (const id of PRESETS_ADDED[v] || []) {
      if (!st.presets.some(p => p.id === id)) st.presets.push({ ...DEFAULT_PRESETS.find(p => p.id === id) });
    }
  }
  st.presetsRev = PRESETS_REV;
  return st;
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('Stockage plein : exporte puis supprime d\u2019anciennes photos'); }
}

/* ---------- Utilitaires ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const r0 = n => Math.round(n || 0);
const r1 = n => Math.round((n || 0) * 10) / 10;
const fmt = n => r0(n).toLocaleString('fr-FR');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function keyOf(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function todayKey() { return keyOf(new Date()); }
function parseKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(k, n) { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
function dateLabel(k) {
  const t = todayKey();
  if (k === t) return 'Aujourd\u2019hui';
  if (k === addDays(t, -1)) return 'Hier';
  if (k === addDays(t, 1)) return 'Demain';
  return parseKey(k).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}
const dayShort = k => parseKey(k).toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2);
function kcalOf(p, g, l) { return 4 * p + 4 * g + 9 * l; }
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2200);
}

/* ---------- Journal alimentaire ---------- */
function entries(k = curDate) { return S.log[k] || []; }
function totals(k = curDate) {
  return entries(k).reduce((a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, g: a.g + e.g, l: a.l + e.l }), { kcal: 0, p: 0, g: 0, l: 0 });
}
function addEntry(item, qtyLabel, photo) {
  const e = { id: uid(), t: Date.now(), name: item.name, kcal: r0(item.kcal), p: r1(item.p), g: r1(item.g), l: r1(item.l), qty: qtyLabel || '' };
  if (photo) e.photo = photo;
  (S.log[curDate] ||= []).push(e);
  save(); renderToday();
  toast(`✓ ${item.name} ajouté (${fmt(e.kcal)} kcal)`);
  return e;
}
function delEntry(id) {
  S.log[curDate] = entries().filter(e => e.id !== id);
  if (!S.log[curDate].length) delete S.log[curDate];
  save(); renderToday();
}
function scaled(item, m) { return { name: item.name, kcal: item.kcal * m, p: item.p * m, g: item.g * m, l: item.l * m }; }
const portionLabel = m => (m === 1 ? '1 portion' : m === 0.5 ? '½ portion' : `${String(m).replace('.', ',')} portions`);

/* ---------- Rendu : Aujourd'hui ---------- */
function renderToday() {
  $('#dateLabel').textContent = dateLabel(curDate);
  const t = totals(), G = S.goals;
  const C = 2 * Math.PI * 52, ratio = G.kcal ? t.kcal / G.kcal : 0;
  const ring = $('#kcalRing');
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C * (1 - Math.min(ratio, 1));
  ring.classList.toggle('over', ratio > 1.05);
  $('#kcalVal').textContent = fmt(t.kcal);
  $('#kcalGoal').textContent = `/ ${fmt(G.kcal)} kcal`;
  const left = G.kcal - t.kcal;
  $('#kcalLeft').textContent = left >= 0 ? `reste ${fmt(left)}` : `+${fmt(-left)} au-dessus`;
  for (const k of ['p', 'g', 'l']) {
    const bar = $(`.bar[data-k=${k}]`);
    bar.querySelector('.fill').style.width = Math.min(100, (G[k] ? t[k] / G[k] : 0) * 100) + '%';
    bar.querySelector('.bar-num').textContent = `${r0(t[k])} / ${r0(G[k])} g`;
  }
  const list = $('#entries');
  const es = entries();
  list.innerHTML = es.length ? es.map(e => `
    <li data-id="${e.id}">
      ${e.photo ? `<img class="thumb" src="${e.photo}" alt="" data-photo="${e.id}">` : ''}
      <div class="e-main"><div class="e-name">${esc(e.name)}</div>
        <div class="e-sub">${new Date(e.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}${e.qty ? ' · ' + esc(e.qty) : ''} · P ${r0(e.p)} · G ${r0(e.g)} · L ${r0(e.l)}</div></div>
      <div class="e-kcal">${fmt(e.kcal)}</div>
      <button class="del" data-del="${e.id}" aria-label="Supprimer">✕</button>
    </li>`).join('') : '<li class="empty">Rien pour l\u2019instant. Ajoute ton premier repas !</li>';
  renderWeekChart('#weekChart', curDate);
  $('#addFor').textContent = `Ajout pour : ${dateLabel(curDate).toLowerCase()} (${parseKey(curDate).toLocaleDateString('fr-FR')})`;
}

function weekData(endKey) {
  const out = [];
  for (let i = 6; i >= 0; i--) { const k = addDays(endKey, -i); out.push({ k, ...totals(k) }); }
  return out;
}
function renderWeekChart(sel, endKey) {
  const data = weekData(endKey), G = S.goals;
  const W = 320, H = 150, top = 18, bottom = 22, ch = H - top - bottom;
  const maxR = Math.max(1.2, ...data.map(d => Math.max(d.kcal / G.kcal, d.p / G.p)));
  const y = r => top + ch - (r / maxR) * ch;
  const slot = W / 7, bw = slot * 0.3;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="kcal et protéines sur 7 jours">`;
  s += `<line x1="0" x2="${W}" y1="${y(1)}" y2="${y(1)}" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 4"/>`;
  s += `<text x="2" y="${y(1) - 3}" text-anchor="start">objectif</text>`;
  data.forEach((d, i) => {
    const x = i * slot + slot / 2;
    const rk = d.kcal / G.kcal, rp = d.p / G.p;
    s += `<rect x="${x - bw - 1}" y="${y(rk)}" width="${bw}" height="${Math.max(0, top + ch - y(rk))}" rx="3" fill="var(--kcal)"/>`;
    s += `<rect x="${x + 1}" y="${y(rp)}" width="${bw}" height="${Math.max(0, top + ch - y(rp))}" rx="3" fill="var(--p)"/>`;
    if (d.kcal) s += `<text x="${x}" y="${Math.min(y(rk), y(rp)) - 4}" text-anchor="middle">${(d.kcal / 1000).toFixed(1)}k</text>`;
    s += `<text x="${x}" y="${H - 6}" text-anchor="middle" font-weight="${d.k === endKey ? 700 : 400}">${dayShort(d.k)}</text>`;
  });
  $(sel).innerHTML = s + '</svg>';
}

/* ---------- Rendu : Recettes ---------- */
let recipeCat = 'all';
function recipeMacros(r) {
  const p = S.presets.find(x => x.id === r.id) || DEFAULT_PRESETS.find(x => x.id === r.id);
  return p ? { e: p.e, name: r.name || p.name, kcal: p.kcal, p: p.p, g: p.g, l: p.l } : { e: '🍽️', name: r.name || r.id, kcal: 0, p: 0, g: 0, l: 0 };
}
const nb = n => String(n).replace('.', ',');
function fmtCount(q) {
  const i = Math.floor(q + 1e-6), f = q - i;
  const fr = [[0, ''], [1 / 3, '⅓'], [1 / 2, '½'], [2 / 3, '⅔'], [1, '']].reduce((a, b) => (Math.abs(b[0] - f) < Math.abs(a[0] - f) ? b : a));
  const whole = fr[0] === 1 ? i + 1 : i;
  if (Math.abs(fr[0] - f) > 0.09) return '≈ ' + nb(Math.round(q * 10) / 10);
  return whole && fr[1] ? `${whole} ${fr[1]}` : fr[1] || String(whole);
}
function fmtQty(q, u, m) {
  if (q == null) return '';
  const v = q * m;
  if (u === 'g') return v >= 1000 ? `${nb(Math.round(v / 10) / 100)} kg` : `${r0(v)} g`;
  if (u === 'cl') return v >= 100 ? `${nb(Math.round(v) / 100)} L` : `${nb(r1(v))} cl`;
  if (u === 'ml') return v >= 1000 ? `${nb(Math.round(v / 10) / 100)} L` : `${r0(v)} ml`;
  if (u === 'cs') return `${fmtCount(v)} c. à s.`;
  if (u === 'cc') return `${fmtCount(v)} c. à c.`;
  return fmtCount(v);
}
function ingName(name, q, u, m) {
  const [one, many] = name.split('|');
  return u === 'pc' && many && q * m > 1.01 ? many : one;
}
function renderRecipes() {
  const q = norm($('#recipeFilter').value.trim());
  $$('#recipeCats .chip').forEach(c => c.classList.toggle('active', c.dataset.rc === recipeCat));
  const list = RECIPES.filter(r => (recipeCat === 'all' || r.cat === recipeCat) &&
    (!q || norm(recipeMacros(r).name + ' ' + r.ing.map(i => i[2]).join(' ')).includes(q)));
  $('#recipeList').innerHTML = list.length ? list.map(r => {
    const m = recipeMacros(r);
    return `<li data-recipe="${r.id}"><span class="r-emoji">${esc(m.e || '🍽️')}</span>
      <div class="e-main"><div class="e-name">${esc(m.name)}</div>
      <div class="e-sub">${esc(RECIPE_CATS[r.cat])} · ⏱ ${esc(r.time)} · ${r0(m.p)} g prot.</div></div>
      <div class="e-kcal">${fmt(m.kcal)} kcal</div></li>`;
  }).join('') : '<li class="empty">Aucune recette trouvée.</li>';
}
function openRecipe(id, mult = 1) {
  const r = recipeById(id); if (!r) return;
  const m = recipeMacros(r), unit = r.unit || 'portion';
  const unitN = n => (n > 1 ? (unit === 'bocal' ? 'bocaux' : unit === 'portion' ? 'portions' : 'fois la recette') : unit === 'portion' || unit === 'bocal' ? unit : 'recette');
  const isToday = curDate === todayKey();
  openSheet(`
    <h3>${esc(m.e || '')} ${esc(m.name)}</h3>
    <p class="hint">⏱ ${esc(r.time)} · valeurs pour 1 ${esc(unit)}</p>
    <div class="macro-line"><span class="pill"><b>${fmt(m.kcal)}</b> kcal</span><span class="pill">P ${r0(m.p)} g</span><span class="pill">G ${r0(m.g)} g</span><span class="pill">L ${r0(m.l)} g</span></div>
    <div class="chips" id="rPortions"><span class="chips-label">${unit === 'bocal' ? 'Bocaux' : unit === 'portion' ? 'Portions' : 'Recettes'}</span>
      ${RECIPE_PORTIONS.map(n => `<button class="chip ${n === mult ? 'active' : ''}" data-rp="${n}">${n}</button>`).join('')}</div>
    ${r.cat === 'plat' ? '<p class="hint r-tip">Batch cooking : 3 = session du dimanche, 4 = mercredi soir, 7 = toute la semaine.</p>' : ''}
    <h4>Ingrédients <small class="muted">· ${mult} ${esc(unitN(mult))}${mult > 1 ? ` · ${fmt(m.kcal * mult)} kcal au total` : ''}</small></h4>
    <ul class="ing">${r.ing.map(([q, u, name, note]) => `<li><span class="q">${esc(q == null ? u : fmtQty(q, u, mult))}</span>
      <span class="n">${esc(ingName(name, q, u, mult))}${note ? `<small>${esc(note)}</small>` : ''}</span></li>`).join('')}</ul>
    <h4>Étapes</h4>
    <ol class="steps">${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    ${r.note ? `<p class="r-note">💡 ${esc(r.note)}</p>` : ''}
    ${r.oats ? `<p class="r-note">🔄 ${esc(SANS_AVOINE)}</p>` : ''}
    <p class="r-keep">🧊 <b>Conservation :</b> ${esc(r.keep)}</p>
    <button class="btn block" id="rAdd">＋ Ajouter ${isToday ? 'à aujourd\u2019hui' : 'au ' + esc(parseKey(curDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))} (1 ${esc(unit === 'portion' || unit === 'bocal' ? unit : 'recette')})</button>
    <button class="btn ghost block r-close" data-close>Fermer</button>`);
  $('#rPortions').onclick = e => { const b = e.target.closest('[data-rp]'); if (b) { const top = $('.sheet').scrollTop; openRecipe(id, +b.dataset.rp); $('.sheet').scrollTop = top; } };
  $('#rAdd').onclick = () => { addEntry({ name: m.name, kcal: m.kcal, p: m.p, g: m.g, l: m.l }, '1 ' + (unit === 'portion' || unit === 'bocal' ? unit : 'recette')); closeSheet(); };
}

/* ---------- Rendu : Ajouter ---------- */
function renderPresets() {
  $('#presets').innerHTML = S.presets.map(p => {
    const m = portion;
    return `<button class="preset" data-preset="${p.id}" title="${esc(p.desc || '')}">
      <span class="cat">${esc(p.e || '🍽️')}</span>
      <b>${esc(p.name)}</b>
      <span>${fmt(p.kcal * m)} kcal · ${r0(p.p * m)} g prot.</span>
      ${recipeById(p.id) ? `<span class="rlink" data-recipe="${p.id}" role="button" aria-label="Voir la recette">📖</span>` : ''}</button>`;
  }).join('');
  $('#presetAdmin').innerHTML = S.presets.map(p => `
    <li><div class="e-main"><div class="e-name">${esc(p.e || '')} ${esc(p.name)}</div>
      <div class="e-sub">${fmt(p.kcal)} kcal · P ${r0(p.p)} · G ${r0(p.g)} · L ${r0(p.l)}</div></div>
      <button class="btn small ghost" data-edit="${p.id}">Modifier</button></li>`).join('');
}

function renderBase() {
  const q = norm($('#baseFilter').value);
  const list = BASE_FOODS.filter(f => !q || norm(f.name).includes(q));
  $('#baseList').innerHTML = list.map(f => `
    <li data-base="${esc(f.name)}"><div class="e-main"><div class="e-name">${esc(f.name)}</div>
      <div class="e-sub">P ${f.p} · G ${f.g} · L ${f.l}</div></div><div class="e-kcal">${f.kcal} kcal</div></li>`).join('');
}
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* Fiche « quantité en grammes » (aliment pour 100 g) */
function openGramsSheet(food, source) {
  const def = food.serving || 100;
  openSheet(`
    <h3>${esc(food.name)}</h3>
    <p class="hint">${esc(source || '')} · pour 100 g : ${r0(food.kcal)} kcal · P ${r1(food.p)} · G ${r1(food.g)} · L ${r1(food.l)}</p>
    <label>Quantité (g)<input type="number" id="gramsInput" inputmode="decimal" value="${def}" min="1"></label>
    <div class="chips" id="gramChips">${[30, 50, 100, 150, 200, 250].map(g => `<button class="chip" data-g="${g}">${g} g</button>`).join('')}</div>
    <div class="macro-line" id="gramsCalc"></div>
    <button class="btn block" id="gramsAdd">Ajouter au journal</button>`);
  const input = $('#gramsInput');
  const calc = () => {
    const m = (parseFloat(input.value) || 0) / 100;
    $('#gramsCalc').innerHTML = `<span class="pill"><b>${fmt(food.kcal * m)}</b> kcal</span><span class="pill">P ${r1(food.p * m)} g</span><span class="pill">G ${r1(food.g * m)} g</span><span class="pill">L ${r1(food.l * m)} g</span>`;
  };
  input.addEventListener('input', calc); calc();
  $('#gramChips').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) { input.value = b.dataset.g; calc(); } });
  $('#gramsAdd').onclick = () => {
    const g = parseFloat(input.value) || 0;
    if (g <= 0) return toast('Entre une quantité');
    addEntry(scaled(food, g / 100), `${r0(g)} g`); closeSheet();
  };
}

/* ---------- Open Food Facts ---------- */
const OFF = 'https://world.openfoodfacts.org';
function offName(p) {
  const n = (p.product_name || '').trim(), b = (p.brands || '').split(',')[0].trim();
  if (!n) return b || `Produit ${p.code}`;
  return b && !norm(n).includes(norm(b)) ? `${n} – ${b}` : n;
}
function offToFood(p) {
  const n = p.nutriments || {};
  let kcal = n['energy-kcal_100g'];
  if (kcal == null && n.energy_100g != null) kcal = n.energy_100g / 4.184;
  const food = {
    name: offName(p),
    kcal: +kcal || 0, p: +n.proteins_100g || 0, g: +n.carbohydrates_100g || 0, l: +n.fat_100g || 0, code: p.code
  };
  if (!food.kcal && (food.p || food.g || food.l)) food.kcal = kcalOf(food.p, food.g, food.l);
  const sq = parseFloat(p.serving_quantity); if (sq > 0 && sq < 1000) food.serving = sq;
  return food;
}
async function searchOFF(q) {
  const url = `${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,nutriments,code,serving_quantity`;
  // search.pl renvoie parfois un 503 (serveur chargé, sans en-tête CORS) : on réessaie 3 fois
  let data, err;
  for (let i = 0; i < 3 && !data; i++) {
    if (i) await new Promise(r => setTimeout(r, 900 * i));
    try { const res = await fetch(url); if (!res.ok) throw new Error('HTTP ' + res.status); data = await res.json(); }
    catch (e) { err = e; }
  }
  if (!data) throw err;
  return (data.products || []).filter(p => p.product_name && p.nutriments).map(offToFood).filter(f => f.kcal > 0);
}
async function productOFF(code) {
  const res = await fetch(`${OFF}/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,code,serving_quantity`);
  if (!res.ok && res.status !== 404) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return offToFood({ ...data.product, code: data.product.code || code });
}
let lastResults = [];
async function doSearch(q) {
  q = q.trim(); if (!q) return;
  const st = $('#searchStatus'); st.textContent = 'Recherche…'; $('#results').innerHTML = '';
  if (!navigator.onLine) { st.textContent = 'Hors ligne : utilise les aliments de base ci-dessous.'; return; }
  try {
    lastResults = await searchOFF(q);
    st.textContent = lastResults.length ? `${lastResults.length} résultat(s) · Open Food Facts · valeurs pour 100 g` : 'Aucun résultat. Essaie un autre mot.';
    $('#results').innerHTML = lastResults.map((f, i) => `
      <li data-res="${i}"><div class="e-main"><div class="e-name">${esc(f.name)}</div>
        <div class="e-sub">P ${r1(f.p)} · G ${r1(f.g)} · L ${r1(f.l)}</div></div><div class="e-kcal">${r0(f.kcal)} kcal</div></li>`).join('');
  } catch (e) { st.textContent = 'Recherche impossible (réseau ou Open Food Facts indisponible).'; }
}
async function lookupBarcode(code) {
  code = String(code).replace(/\D/g, '');
  if (code.length < 6) return toast('Code-barres invalide');
  const st = $('#searchStatus'); st.textContent = `Recherche du code ${code}…`;
  try {
    const f = await productOFF(code);
    if (!f) { st.textContent = `Produit ${code} introuvable dans Open Food Facts.`; return; }
    st.textContent = '';
    openGramsSheet(f, `Code ${code}`);
  } catch (e) { st.textContent = 'Recherche impossible (réseau ?).'; }
}

/* ---------- Scanner code-barres ---------- */
let scanStream = null, scanTimer = null;
async function startScan() {
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
    toast('Scan non pris en charge par ce navigateur : tape le code à la main');
    $('#barcodeInput').focus(); return;
  }
  let detector;
  try { detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }); }
  catch { detector = new BarcodeDetector(); }
  openSheet(`<h3>Scanner un code-barres</h3><p class="hint">Vise le code-barres du produit.</p>
    <video id="scanVideo" playsinline muted autoplay></video>
    <button class="btn ghost block" style="margin-top:10px" data-close>Annuler</button>`, stopScan);
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    const v = $('#scanVideo'); v.srcObject = scanStream; await v.play();
    scanTimer = setInterval(async () => {
      try {
        const codes = await detector.detect(v);
        if (codes.length) { const c = codes[0].rawValue; closeSheet(); lookupBarcode(c); }
      } catch { /* image pas prête */ }
    }, 300);
  } catch (e) { closeSheet(); toast('Caméra refusée ou indisponible'); }
}
function stopScan() {
  clearInterval(scanTimer); scanTimer = null;
  if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
}

/* ---------- Photo ---------- */
/**
 * Point d'entrée pour l'analyse IA de la photo (à brancher plus tard).
 * Reçoit une image (dataURL JPEG) et doit renvoyer une promesse de :
 *   { name: string, kcal: number, p: number, g: number, l: number, items?: [{name, grams}] }
 * ou null si l'analyse n'est pas disponible.
 * Ex. futur : appel à une API de vision avec la clé stockée dans S.settings.visionKey.
 */
async function analyzePhoto(dataUrl) { // eslint-disable-line no-unused-vars
  return null; // analyse automatique bientôt
}
function resizeImage(file, max = 360, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}
async function onPhoto(file) {
  if (!file) return;
  let thumb;
  try { thumb = await resizeImage(file); } catch { return toast('Image illisible'); }
  openSheet(`
    <h3>Photo du repas</h3>
    <img class="photo-preview" src="${thumb}" alt="">
    <p class="hint"><span class="badge">Analyse automatique bientôt</span> En attendant, choisis un repas rapide ou entre les macros.</p>
    <label>Repas rapide<select id="phPreset"><option value="">— aucun —</option>${S.presets.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
    <div class="grid2" style="margin-top:10px">
      <label class="span2">Nom<input id="phName" placeholder="ex. Assiette du midi"></label>
      <label>Kcal<input type="number" id="phK" inputmode="numeric"></label>
      <label>Protéines (g)<input type="number" id="phP" inputmode="decimal"></label>
      <label>Glucides (g)<input type="number" id="phG" inputmode="decimal"></label>
      <label>Lipides (g)<input type="number" id="phL" inputmode="decimal"></label>
    </div>
    <button class="btn block" id="phSave">Ajouter au journal</button>`);
  const ai = await analyzePhoto(thumb);
  if (ai) fillPhoto(ai);
  $('#phPreset').onchange = e => { const p = S.presets.find(x => x.id === e.target.value); if (p) fillPhoto(scaled(p, portion)); };
  $('#phSave').onclick = () => {
    const p = +$('#phP').value || 0, g = +$('#phG').value || 0, l = +$('#phL').value || 0;
    const kcal = +$('#phK').value || kcalOf(p, g, l);
    addEntry({ name: $('#phName').value.trim() || 'Repas (photo)', kcal, p, g, l }, '📷', thumb);
    closeSheet();
  };
}
function fillPhoto(x) { $('#phName').value = x.name; $('#phK').value = r0(x.kcal); $('#phP').value = r1(x.p); $('#phG').value = r1(x.g); $('#phL').value = r1(x.l); }

/* ---------- Saisie manuelle & repas perso ---------- */
function openManual() {
  openSheet(`<h3>Saisie manuelle</h3>
    <div class="grid2">
      <label class="span2">Nom<input id="mName" placeholder="ex. Sandwich"></label>
      <label>Kcal (auto si vide)<input type="number" id="mK" inputmode="numeric"></label>
      <label>Protéines (g)<input type="number" id="mP" inputmode="decimal"></label>
      <label>Glucides (g)<input type="number" id="mG" inputmode="decimal"></label>
      <label>Lipides (g)<input type="number" id="mL" inputmode="decimal"></label>
    </div><button class="btn block" id="mSave">Ajouter</button>`);
  $('#mSave').onclick = () => {
    const p = +$('#mP').value || 0, g = +$('#mG').value || 0, l = +$('#mL').value || 0;
    const kcal = +$('#mK').value || kcalOf(p, g, l);
    if (!kcal) return toast('Entre au moins les kcal ou les macros');
    addEntry({ name: $('#mName').value.trim() || 'Saisie manuelle', kcal, p, g, l }); closeSheet();
  };
}
function openPresetEditor(id) {
  const p = S.presets.find(x => x.id === id) || { e: '🍽️', name: '', kcal: '', p: '', g: '', l: '', desc: '' };
  openSheet(`<h3>${id ? 'Modifier le repas' : 'Nouveau repas rapide'}</h3>
    <div class="grid2">
      <label>Emoji<input id="pE" value="${esc(p.e || '')}" maxlength="4"></label>
      <label>Kcal (auto si vide)<input type="number" id="pK" value="${p.kcal}" inputmode="numeric"></label>
      <label class="span2">Nom<input id="pN" value="${esc(p.name)}"></label>
      <label>Protéines (g)<input type="number" id="pP" value="${p.p}" inputmode="decimal"></label>
      <label>Glucides (g)<input type="number" id="pG" value="${p.g}" inputmode="decimal"></label>
      <label>Lipides (g)<input type="number" id="pL" value="${p.l}" inputmode="decimal"></label>
      <label class="span2">Détail (optionnel)<input id="pD" value="${esc(p.desc || '')}"></label>
    </div>
    <button class="btn block" id="pSave">Enregistrer</button>
    ${id ? '<button class="btn danger block" id="pDel">Supprimer ce repas</button>' : ''}`);
  $('#pSave').onclick = () => {
    const name = $('#pN').value.trim(); if (!name) return toast('Donne un nom');
    const pp = +$('#pP').value || 0, g = +$('#pG').value || 0, l = +$('#pL').value || 0;
    const np = { id: id || 'u-' + uid(), e: $('#pE').value.trim(), name, p: pp, g, l, kcal: +$('#pK').value || r0(kcalOf(pp, g, l)), desc: $('#pD').value.trim() };
    if (id) Object.assign(S.presets.find(x => x.id === id), np); else S.presets.push(np);
    save(); renderPresets(); closeSheet(); toast('Repas enregistré');
  };
  if (id) $('#pDel').onclick = () => {
    if (!confirm('Supprimer ce repas rapide ?')) return;
    S.presets = S.presets.filter(x => x.id !== id); save(); renderPresets(); closeSheet();
  };
}

/* ---------- Entraînement ---------- */
function lastWorkout() { return S.workouts.slice().sort((a, b) => (a.date + a.t).localeCompare(b.date + b.t)).pop(); }
function suggestedType() { const w = lastWorkout(); return w ? (w.type === 'A' ? 'B' : 'A') : 'A'; }
function newDraft(type) {
  return { type, ex: WORKOUTS[type].map(e => ({ name: e.name, sets: Array.from({ length: e.sets }, () => ({ w: '', r: '', ok: false })) })) };
}
function lastPerf(name) {
  const ws = S.workouts.slice().sort((a, b) => (b.date + b.t).localeCompare(a.date + a.t));
  for (const w of ws) {
    const ex = w.ex.find(e => e.name === name);
    if (ex && ex.sets.some(s => s.r)) return { date: w.date, sets: ex.sets.filter(s => s.r) };
  }
  return null;
}
const setTxt = s => (s.w ? `${String(s.w).replace('.', ',')} kg×${s.r}` : `${s.r} reps`);
function renderTrain() {
  if (!S.draft) { S.draft = newDraft(suggestedType()); save(); }
  const d = S.draft, def = WORKOUTS[d.type], sug = suggestedType(), lw = lastWorkout();
  $('#sessionTitle').textContent = `Full body ${d.type}`;
  $$('#sessionSeg button').forEach(b => b.classList.toggle('active', b.dataset.s === d.type));
  $('#sessionHint').textContent = lw
    ? `Dernière séance : ${lw.type} (${dateLabel(lw.date).toLowerCase()}). Séance conseillée : ${sug}.`
    : 'Première séance : on commence par la A. Ensuite tu alternes A / B, un jour sur deux.';
  $('#sessionExercises').innerHTML = d.ex.map((ex, i) => {
    const meta = def[i] || { target: '' }, lp = lastPerf(ex.name);
    return `<div class="ex" data-ex="${i}">
      <div class="ex-head"><span class="ex-name">${esc(ex.name)}</span><span class="ex-target">${ex.sets.length}×${esc(meta.target)}</span></div>
      <div class="ex-last">${lp ? `Dernière fois (${dateLabel(lp.date).toLowerCase()}) : ${lp.sets.map(setTxt).join(' · ')}` : 'Pas encore de perf enregistrée'}</div>
      ${ex.sets.map((s, j) => {
        const ph = lp && lp.sets[j] ? lp.sets[j] : null;
        return `<div class="set" data-set="${j}"><span class="n">S${j + 1}</span>
          <input type="number" inputmode="decimal" step="0.5" data-f="w" value="${s.w}" placeholder="${ph && ph.w ? ph.w : (/^(Dips|Tractions)/.test(ex.name) ? '+kg' : 'kg')}" aria-label="Charge série ${j + 1}">
          <span class="x">×</span>
          <input type="number" inputmode="numeric" data-f="r" value="${s.r}" placeholder="${ph ? ph.r : 'reps'}" aria-label="Répétitions série ${j + 1}">
          <button class="ok ${s.ok ? 'on' : ''}" data-ok aria-label="Série faite">✓</button></div>`;
      }).join('')}</div>`;
  }).join('');
  const hist = S.workouts.slice().sort((a, b) => (b.date + b.t).localeCompare(a.date + a.t)).slice(0, 20);
  $('#sessionHistory').innerHTML = hist.length ? hist.map(w => {
    const vol = w.ex.reduce((a, e) => a + e.sets.reduce((b, s) => b + (+s.w || 0) * (+s.r || 0), 0), 0);
    const nSets = w.ex.reduce((a, e) => a + e.sets.filter(s => s.r).length, 0);
    return `<li><div class="e-main"><div class="e-name">Full body ${w.type}</div>
      <div class="e-sub">${parseKey(w.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} · ${nSets} séries · ${fmt(vol)} kg soulevés</div></div>
      <button class="del" data-delw="${w.id}" aria-label="Supprimer">✕</button></li>`;
  }).join('') : '<li class="empty">Aucune séance enregistrée.</li>';
}
function finishSession() {
  const d = S.draft;
  const ex = d.ex.map(e => ({ name: e.name, sets: e.sets.filter(s => s.r !== '' && s.r != null).map(s => ({ w: s.w === '' ? '' : +s.w, r: +s.r })) }));
  if (!ex.some(e => e.sets.length) && !confirm('Aucune série remplie. Marquer quand même la séance comme faite ?')) return;
  S.workouts.push({ id: uid(), date: curDate, t: new Date().toTimeString().slice(0, 8), type: d.type, ex });
  S.draft = newDraft(d.type === 'A' ? 'B' : 'A');
  save(); renderTrain(); toast(`💪 Séance ${d.type} enregistrée ! Prochaine : ${S.draft.type}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Progrès : poids ---------- */
function renderProgress() {
  const ws = S.weights.slice().sort((a, b) => a.date.localeCompare(b.date));
  const { startW, goalW } = S.profile;
  const cur = ws.length ? ws[ws.length - 1].kg : startW;
  const gained = r1(cur - startW);
  $('#weightSummary').textContent = `${String(cur).replace('.', ',')} kg · ${gained >= 0 ? '+' : ''}${String(gained).replace('.', ',')} kg · objectif ${goalW} kg`;
  const pts = [{ date: null, kg: startW, start: true }, ...ws];
  const W = 320, H = 170, L = 30, R = 10, T = 14, B = 22;
  const vals = pts.map(p => p.kg).concat([startW, goalW]);
  const lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
  const x = i => L + (pts.length === 1 ? (W - L - R) / 2 : (i / (pts.length - 1)) * (W - L - R));
  const y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de poids">`;
  for (const v of [lo, Math.round((lo + hi) / 2), hi]) s += `<text x="${L - 4}" y="${y(v) + 3}" text-anchor="end">${v}</text><line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" stroke-opacity=".08"/>`;
  s += `<line x1="${L}" x2="${W - R}" y1="${y(goalW)}" y2="${y(goalW)}" stroke="var(--accent2)" stroke-dasharray="5 4"/><text x="${W - R}" y="${y(goalW) - 4}" text-anchor="end" style="fill:var(--accent2)">objectif ${goalW} kg</text>`;
  s += `<polyline fill="none" stroke="var(--kcal)" stroke-width="2.5" stroke-linejoin="round" points="${pts.map((p, i) => `${x(i)},${y(p.kg)}`).join(' ')}"/>`;
  pts.forEach((p, i) => { s += `<circle cx="${x(i)}" cy="${y(p.kg)}" r="4" fill="${p.start ? 'var(--muted)' : 'var(--kcal)'}"/>`; });
  s += `<text x="${x(0)}" y="${H - 6}" text-anchor="start">départ</text>`;
  if (ws.length) s += `<text x="${x(pts.length - 1)}" y="${H - 6}" text-anchor="end">${parseKey(ws[ws.length - 1].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</text>`;
  $('#weightChart').innerHTML = s + '</svg>';
  $('#weightList').innerHTML = ws.slice().reverse().map(w => `<li><div class="e-main"><div class="e-name">${String(w.kg).replace('.', ',')} kg</div>
    <div class="e-sub">${parseKey(w.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
    <button class="del" data-delkg="${w.date}" aria-label="Supprimer">✕</button></li>`).join('');
  if (!$('#weightDate').value) $('#weightDate').value = todayKey();
  renderWeekChart('#weekChart2', todayKey());
  const wd = weekData(todayKey()).filter(d => d.kcal > 0);
  const avg = k => (wd.length ? wd.reduce((a, d) => a + d[k], 0) / wd.length : 0);
  $('#weekStats').innerHTML = `<div class="stat"><b>${fmt(avg('kcal'))}</b><span>kcal / jour (moy.)</span></div>
    <div class="stat"><b>${r0(avg('p'))} g</b><span>protéines / jour (moy.)</span></div>
    <div class="stat"><b>${wd.length}/7</b><span>jours remplis</span></div>
    <div class="stat"><b>${S.workouts.filter(w => w.date >= addDays(todayKey(), -6)).length}</b><span>séances (7 j)</span></div>`;
}

/* ---------- Réglages ---------- */
function renderSettings() {
  const f = $('#goalsForm');
  for (const k of ['kcal', 'p', 'g', 'l']) f.elements[k].value = S.goals[k];
  f.elements.startW.value = S.profile.startW; f.elements.goalW.value = S.profile.goalW;
  renderPresets();
}
function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `coach-killian-sauvegarde-${todayKey()}.json`; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast('Sauvegarde exportée');
}
function importData(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!d || typeof d !== 'object' || !d.log || !d.goals) throw new Error('format');
      if (!confirm('Remplacer toutes les données actuelles par cette sauvegarde ?')) return;
      S = migrate(d); save(); renderAll(); toast('Sauvegarde importée');
    } catch { toast('Fichier invalide'); }
  };
  rd.readAsText(file);
}

/* ---------- Fiche (bottom sheet) ---------- */
let sheetOnClose = null;
function openSheet(html, onClose) {
  $('#sheetBody').innerHTML = html; $('#sheetBackdrop').hidden = false; sheetOnClose = onClose || null;
}
function closeSheet() {
  $('#sheetBackdrop').hidden = true; $('#sheetBody').innerHTML = '';
  if (sheetOnClose) { const f = sheetOnClose; sheetOnClose = null; f(); }
}

/* ---------- Navigation ---------- */
function show(view) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  $('#datenav').style.visibility = (view === 'today' || view === 'add' || view === 'train' || view === 'recipes') ? 'visible' : 'hidden';
  if (view === 'train') renderTrain();
  if (view === 'progress') renderProgress();
  if (view === 'settings') renderSettings();
  if (view === 'add') renderPresets();
  if (view === 'recipes') renderRecipes();
  window.scrollTo(0, 0);
  history.replaceState(null, '', '#' + view);
}
function renderAll() { renderToday(); renderPresets(); renderBase(); renderRecipes(); renderTrain(); renderProgress(); renderSettings(); }

/* ---------- Événements ---------- */
function bind() {
  $$('.tab').forEach(t => t.onclick = () => show(t.dataset.view));
  document.addEventListener('click', e => {
    const go = e.target.closest('[data-goto]'); if (go) show(go.dataset.goto);
    if (e.target.closest('[data-close]')) closeSheet();
  });
  const shift = n => { curDate = addDays(curDate, n); renderToday(); if ($('#view-train').classList.contains('active')) renderTrain(); };
  $('#prevDay').onclick = () => shift(-1);
  $('#nextDay').onclick = () => shift(1);
  $('#dateLabel').onclick = () => { curDate = todayKey(); renderToday(); };

  $('#entries').addEventListener('click', e => {
    const d = e.target.closest('[data-del]');
    if (d) { const en = entries().find(x => x.id === d.dataset.del); if (en && confirm(`Supprimer « ${en.name} » ?`)) delEntry(en.id); return; }
    const ph = e.target.closest('[data-photo]');
    if (ph) { const en = entries().find(x => x.id === ph.dataset.photo); openSheet(`<h3>${esc(en.name)}</h3><img class="photo-preview" src="${en.photo}" alt=""><button class="btn ghost block" data-close>Fermer</button>`); }
  });

  $('#portionChips').addEventListener('click', e => {
    const c = e.target.closest('[data-m]'); if (!c) return;
    portion = +c.dataset.m; $$('#portionChips .chip').forEach(x => x.classList.toggle('active', x === c)); renderPresets();
  });
  $('#presets').addEventListener('click', e => {
    const rl = e.target.closest('[data-recipe]'); if (rl) { e.stopPropagation(); openRecipe(rl.dataset.recipe); return; }
    const b = e.target.closest('[data-preset]'); if (!b) return;
    const p = S.presets.find(x => x.id === b.dataset.preset);
    addEntry(scaled(p, portion), portionLabel(portion));
  });
  // appui long sur un repas rapide = ouvrir sa recette
  let lpTimer = null, lpFired = false;
  $('#presets').addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-preset]'); lpFired = false; if (!b || !recipeById(b.dataset.preset)) return;
    lpTimer = setTimeout(() => { lpFired = true; openRecipe(b.dataset.preset); }, 550);
  });
  ['pointerup', 'pointerleave', 'pointercancel', 'pointermove'].forEach(t => $('#presets').addEventListener(t, e => {
    if (t === 'pointermove' && Math.abs(e.movementX) + Math.abs(e.movementY) < 4) return;
    clearTimeout(lpTimer);
  }));
  $('#presets').addEventListener('click', e => { if (lpFired) { e.stopImmediatePropagation(); lpFired = false; } }, true);
  $('#presets').addEventListener('contextmenu', e => { if (e.target.closest('[data-preset]')) e.preventDefault(); });
  $('#recipeFilter').addEventListener('input', renderRecipes);
  $('#recipeCats').addEventListener('click', e => { const c = e.target.closest('[data-rc]'); if (c) { recipeCat = c.dataset.rc; renderRecipes(); } });
  $('#recipeList').addEventListener('click', e => { const li = e.target.closest('[data-recipe]'); if (li) openRecipe(li.dataset.recipe); });
  $('#newPresetBtn').onclick = () => openPresetEditor(null);
  $('#newPresetBtn2').onclick = () => openPresetEditor(null);
  $('#presetAdmin').addEventListener('click', e => { const b = e.target.closest('[data-edit]'); if (b) openPresetEditor(b.dataset.edit); });
  $('#restorePresets').onclick = () => {
    if (!confirm(`Remettre les ${DEFAULT_PRESETS.length} repas par défaut (tes repas perso sont gardés) ?`)) return;
    const custom = S.presets.filter(p => p.id.startsWith('u-'));
    S.presets = DEFAULT_PRESETS.map(p => ({ ...p })).concat(custom); save(); renderPresets(); toast('Repas restaurés');
  };

  $('#searchForm').onsubmit = e => { e.preventDefault(); $('#searchInput').blur(); doSearch($('#searchInput').value); };
  $('#results').addEventListener('click', e => { const li = e.target.closest('[data-res]'); if (li) openGramsSheet(lastResults[+li.dataset.res], 'Open Food Facts'); });
  $('#barcodeForm').onsubmit = e => { e.preventDefault(); lookupBarcode($('#barcodeInput').value); };
  $('#scanBtn').onclick = startScan;
  $('#baseFilter').addEventListener('input', renderBase);
  $('#baseList').addEventListener('click', e => { const li = e.target.closest('[data-base]'); if (li) openGramsSheet(BASE_FOODS.find(f => f.name === li.dataset.base), 'Aliment de base'); });
  $('#manualBtn').onclick = openManual;
  $('#photoInput').onchange = e => { onPhoto(e.target.files[0]); e.target.value = ''; };

  $('#sessionSeg').addEventListener('click', e => {
    const b = e.target.closest('[data-s]'); if (!b || b.dataset.s === S.draft.type) return;
    const filled = S.draft.ex.some(x => x.sets.some(s => s.r !== '' || s.w !== ''));
    if (filled && !confirm('Changer de séance efface ce que tu as saisi. Continuer ?')) return;
    S.draft = newDraft(b.dataset.s); save(); renderTrain();
  });
  $('#sessionExercises').addEventListener('input', e => {
    const inp = e.target.closest('input[data-f]'); if (!inp) return;
    const i = +inp.closest('[data-ex]').dataset.ex, j = +inp.closest('[data-set]').dataset.set;
    S.draft.ex[i].sets[j][inp.dataset.f] = inp.value; save();
  });
  $('#sessionExercises').addEventListener('click', e => {
    const ok = e.target.closest('[data-ok]'); if (!ok) return;
    const i = +ok.closest('[data-ex]').dataset.ex, j = +ok.closest('[data-set]').dataset.set;
    const s = S.draft.ex[i].sets[j];
    // un tap sur ✓ reprend la perf précédente si les champs sont vides
    const row = ok.closest('.set'), wI = row.querySelector('[data-f=w]'), rI = row.querySelector('[data-f=r]');
    if (!s.ok && s.r === '' && rI.placeholder && rI.placeholder !== 'reps') { s.r = rI.placeholder; rI.value = s.r; if (s.w === '' && !/kg/.test(wI.placeholder)) { s.w = wI.placeholder; wI.value = s.w; } }
    s.ok = !s.ok; ok.classList.toggle('on', s.ok); save();
  });
  $('#finishSession').onclick = finishSession;
  $('#sessionHistory').addEventListener('click', e => {
    const b = e.target.closest('[data-delw]'); if (!b || !confirm('Supprimer cette séance ?')) return;
    S.workouts = S.workouts.filter(w => w.id !== b.dataset.delw); save(); renderTrain();
  });

  $('#weightForm').onsubmit = e => {
    e.preventDefault();
    const kg = parseFloat(String($('#weightInput').value).replace(',', '.')), date = $('#weightDate').value || todayKey();
    if (!(kg > 30 && kg < 250)) return toast('Poids invalide');
    S.weights = S.weights.filter(w => w.date !== date).concat({ date, kg: r1(kg) });
    save(); $('#weightInput').value = ''; renderProgress(); toast('Poids enregistré');
  };
  $('#weightList').addEventListener('click', e => {
    const b = e.target.closest('[data-delkg]'); if (!b) return;
    S.weights = S.weights.filter(w => w.date !== b.dataset.delkg); save(); renderProgress();
  });

  $('#goalsForm').onsubmit = e => {
    e.preventDefault(); const f = e.target.elements;
    for (const k of ['kcal', 'p', 'g', 'l']) S.goals[k] = Math.max(0, +f[k].value || DEFAULT_GOALS[k]);
    S.profile.startW = +f.startW.value || 64; S.profile.goalW = +f.goalW.value || 75;
    save(); renderToday(); toast('Objectifs enregistrés');
  };
  $('#exportBtn').onclick = exportData;
  $('#importInput').onchange = e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; };
  $('#resetBtn').onclick = () => {
    if (!confirm('Effacer TOUTES les données (repas, séances, poids) ? Pense à exporter avant.')) return;
    localStorage.removeItem(STORE_KEY); S = freshState(); save(); renderAll(); show('today'); toast('Données effacées');
  };

  $('#sheetBackdrop').addEventListener('click', e => { if (e.target.id === 'sheetBackdrop') closeSheet(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#sheetBackdrop').hidden) closeSheet(); });
}

/* ---------- Démarrage ---------- */
bind();
renderAll();
{ const h = (location.hash || '').slice(1); show(['today', 'add', 'recipes', 'train', 'progress', 'settings'].includes(h) ? h : 'today'); }
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW', e)));
}
window.CoachKillian = { analyzePhoto, get state() { return S; } }; // pour le débogage / branchement futur
