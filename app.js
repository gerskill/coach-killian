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
const RECIPE_CATS = { plat: 'Plats', 'petit-dej': 'Petit-déj', shaker: 'Shakers', mine: 'Mes recettes' };
const RECIPE_PORTIONS = [1, 3, 4, 7];
const SANS_AVOINE = 'Version sans avoine : remplace les 60 g de flocons par 2 tranches de pain complet émiettées ou 60 g de semoule fine. Ça fait un pudding de nuit avec la même texture.';
const recipeById = id => RECIPES.find(r => r.id === id) || (S.myRecipes || []).find(r => r.id === id);
const allRecipes = () => RECIPES.concat(S.myRecipes || []);

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
    draft: null,
    ai: {},           // { model, usage:{month, n, usd} } – la clé API est stockée à part
    myRecipes: []     // recettes enregistrées depuis le Frigo
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
  if (r.mine) return { e: r.e, name: r.name, kcal: r.kcal, p: r.p, g: r.g, l: r.l };
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
  const list = allRecipes().filter(r => (recipeCat === 'all' || r.cat === recipeCat) &&
    (!q || norm(recipeMacros(r).name + ' ' + r.ing.map(i => i[2]).join(' ')).includes(q)));
  $('#recipeList').innerHTML = list.length ? list.map(r => {
    const m = recipeMacros(r);
    return `<li data-recipe="${r.id}"><span class="r-emoji">${esc(m.e || '🍽️')}</span>
      <div class="e-main"><div class="e-name">${esc(m.name)}</div>
      <div class="e-sub">${r.mine ? '🧊 Frigo · ' + esc((MEAL_TYPES[r.type] || MEAL_TYPES.repas).label) : esc(RECIPE_CATS[r.cat])} · ⏱ ${esc(r.time)} · ${r0(m.p)} g prot.</div></div>
      <div class="e-kcal">${fmt(m.kcal)} kcal</div></li>`;
  }).join('') : `<li class="empty">${recipeCat === 'mine' ? 'Pas encore de recette perso : utilise 🧊 Frigo puis « Enregistrer dans mes recettes ».' : 'Aucune recette trouvée.'}</li>`;
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
    ${r.keep ? `<p class="r-keep">🧊 <b>Conservation :</b> ${esc(r.keep)}</p>` : ''}
    ${r.mine ? `<p class="hint">🧊 Créée avec le Frigo le ${esc(parseKey(r.created || todayKey()).toLocaleDateString('fr-FR'))}.</p>` : ''}
    <button class="btn block" id="rAdd">＋ Ajouter ${isToday ? 'à aujourd\u2019hui' : 'au ' + esc(parseKey(curDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))} (1 ${esc(unit === 'portion' || unit === 'bocal' ? unit : 'recette')})</button>
    <button class="btn ghost block mt8" id="rShop">🛒 Ajouter les ingrédients à la liste (${mult} ${esc(unitN(mult))})</button>
    ${r.mine ? '<button class="btn ghost block mt8 danger-text" id="rDelMine">🗑 Supprimer de mes recettes</button>' : ''}
    <button class="btn ghost block r-close" data-close>Fermer</button>`);
  if (r.mine) $('#rDelMine').onclick = () => {
    if (!confirm(`Supprimer « ${r.name} » de tes recettes ?`)) return;
    S.myRecipes = S.myRecipes.filter(x => x.id !== r.id); save(); closeSheet(); renderRecipes(); toast('Recette supprimée');
  };
  $('#rPortions').onclick = e => { const b = e.target.closest('[data-rp]'); if (b) { const top = $('.sheet').scrollTop; openRecipe(id, +b.dataset.rp); $('.sheet').scrollTop = top; } };
  $('#rShop').onclick = () => {
    const n = addRecipeToShop(r, mult), b = $('#rShop');
    b.textContent = `✓ ${n} ingrédients ajoutés à la liste`; b.disabled = true;
    toast(`🛒 ${n} ingrédients ajoutés à ta liste de courses`);
  };
  $('#rAdd').onclick = () => { addEntry({ name: m.name, kcal: m.kcal, p: m.p, g: m.g, l: m.l }, '1 ' + (unit === 'portion' || unit === 'bocal' ? unit : 'recette')); closeSheet(); };
}

/* ---------- Liste de courses ---------- */
// stockée à part (clé séparée) pour ne pas toucher aux données existantes ; incluse dans l'export JSON
const SHOP_KEY = 'coachKillian.courses';
const SHOP_CATS = [
  { id: 'viande', e: '🥩', name: 'Viandes & poissons' },
  { id: 'feculents', e: '🍚', name: 'Féculents' },
  { id: 'legumes', e: '🥦', name: 'Légumes' },
  { id: 'laitiers', e: '🥛', name: 'Produits laitiers & œufs' },
  { id: 'fruits', e: '🍎', name: 'Fruits' },
  { id: 'epicerie', e: '🫙', name: 'Épicerie' },
  { id: 'epices', e: '🧂', name: 'Épices' },
  { id: 'complement', e: '💊', name: 'Complément' },
  { id: 'autre', e: '🛒', name: 'Autre' }
];
// [clé, nom, catégorie, reconnaissance (texte sans accents), unité de comptage singulier|pluriel]
const SHOP_DEFAULTS = [
  ['poulet', 'Filets de poulet', 'viande', /poulet/],
  ['steak', 'Steak haché 5 %', 'viande', /steak|viande hachee|boeuf hache/],
  ['thon', 'Thon au naturel (boîtes)', 'viande', /thon/, 'boîte|boîtes'],
  ['riz', 'Riz', 'feculents', /\briz\b/],
  ['pates', 'Pâtes', 'feculents', /^pates?\b|spaghetti|penne|coquillette/],
  ['semoule', 'Semoule de couscous', 'feculents', /semoule/],
  ['lentilles', 'Lentilles vertes', 'feculents', /lentille/],
  ['pdt', 'Pommes de terre', 'feculents', /pommes? de terre/],
  ['patate', 'Patate douce', 'feculents', /patates? douces?/],
  ['pain', 'Pain complet', 'feculents', /\bpain\b/, 'tranche|tranches'],
  ['farine', 'Farine', 'feculents', /farine/],
  ['tortillas', 'Tortillas (wraps)', 'feculents', /tortilla|wrap/, 'tortilla|tortillas'],
  ['legsurg', 'Légumes surgelés (poêlée, brocolis, haricots verts)', 'legumes', /^legumes|poelee|brocoli|haricots? verts?/],
  ['courgettes', 'Courgettes', 'legumes', /courgette/],
  ['carottes', 'Carottes', 'legumes', /carotte/],
  ['poivrons', 'Poivrons', 'legumes', /poivron/],
  ['oignons', 'Oignons', 'legumes', /oignon/],
  ['ail', 'Ail', 'legumes', /^ail\b/],
  ['oeufs', 'Œufs', 'laitiers', /\boeufs?\b/],
  ['lait', 'Lait demi-écrémé', 'laitiers', /^lait\b(?! de coco)/],
  ['fblanc', 'Fromage blanc', 'laitiers', /fromage blanc/],
  ['ygrec', 'Yaourt grec', 'laitiers', /yaourt grec|yogourt grec/],
  ['beurre', 'Beurre', 'laitiers', /^beurre\b(?! de cacahuete)/],
  ['frape', 'Fromage râpé', 'laitiers', /emmental|fromage rape|gruyere/],
  ['bananes', 'Bananes', 'fruits', /banane/],
  ['pommes', 'Pommes', 'fruits', /^pommes?\b(?! de terre)/],
  ['frouges', 'Fruits rouges surgelés', 'fruits', /fruits rouges/],
  ['jus', 'Jus d’orange', 'fruits', /jus d.?orange/],
  ['stomate', 'Sauce tomate', 'epicerie', /sauce tomate|coulis|tomates? concassee|passata/],
  ['coco', 'Lait de coco', 'epicerie', /lait de coco/],
  ['pb', 'Beurre de cacahuète', 'epicerie', /beurre de cacahuete/],
  ['miel', 'Miel', 'epicerie', /\bmiel\b/],
  ['huile', 'Huile d’olive', 'epicerie', /^huile/],
  ['cacao', 'Cacao non sucré', 'epicerie', /cacao/],
  ['chia', 'Graines de chia', 'epicerie', /chia/],
  ['flocons', 'Flocons d’avoine fins', 'epicerie', /flocons|avoine/],
  ['curry', 'Curry', 'epices', /^curry\b/],
  ['raz', 'Ras el hanout', 'epices', /ras el hanout/],
  ['cumin', 'Cumin', 'epices', /cumin/],
  ['paprika', 'Paprika', 'epices', /paprika/],
  ['piment', 'Piment / chili', 'epices', /piment|^chili\b/],
  ['sel', 'Sel', 'epices', /^sel\b/],
  ['poivre', 'Poivre', 'epices', /^poivre\b/],
  ['herbes', 'Herbes de Provence', 'epices', /herbes/],
  ['creatine', 'Créatine monohydrate', 'complement', /creatine/]
].map(([k, name, cat, re, cnt]) => ({ k, name, cat, re, cnt }));
// catégorie devinée pour un article perso (« skyr » → produits laitiers…)
const SHOP_GUESS = [
  ['viande', /jambon|dinde|saumon|poisson|cabillaud|sardine|maquereau|crevette|boeuf|porc|viande|merguez|saucisse|lardon/],
  ['laitiers', /creme|fromage|yaourt|skyr|mozza|parmesan|comte|feta|ricotta|kefir|oeuf|lait\b/],
  ['legumes', /salade|tomate|crudite|epinard|champignon|poireau|concombre|aubergine|chou|petits? pois|mais|avocat|echalote/],
  ['fruits', /fruit|orange|citron|kiwi|fraise|framboise|myrtille|raisin|poire|mangue|ananas|clementine|compote|datte/],
  ['feculents', /pain|biscotte|quinoa|boulgour|nouille|gnocchi|haricots? rouges|pois chiches|cereale|muesli|granola/],
  ['epices', /epice|muscade|cannelle|thym|laurier|basilic|persil|gingembre|curcuma|origan|moutarde/],
  ['epicerie', /sauce|bouillon|soja|vinaigre|ketchup|mayo|confiture|sucre|chocolat|amande|noix|cacahuete|noisette|conserve|sirop|cafe|the\b|whey/],
  ['complement', /creatine|vitamine|omega|magnesium|complement/]
];
const shopNorm = s => norm(String(s || '')).replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/[’'`]/g, ' ').replace(/\s+/g, ' ').trim();
const shopDefOf = name => { const n = shopNorm(name); return SHOP_DEFAULTS.find(d => d.re.test(n)); };
function shopGuessCat(name) {
  const d = shopDefOf(name); if (d) return d.cat;
  const n = shopNorm(name), g = SHOP_GUESS.find(([, re]) => re.test(n));
  return g ? g[0] : 'autre';
}
function shopFresh() {
  return { version: 1, cats: SHOP_CATS.map(c => ({ ...c })),
    items: SHOP_DEFAULTS.map(d => ({ id: 'd-' + d.k, k: d.k, name: d.name, cat: d.cat, qty: '', done: false })) };
}
function shopSanitize(d) {
  if (!d || !Array.isArray(d.items)) return null;
  const cats = (Array.isArray(d.cats) ? d.cats : []).filter(c => c && c.id && c.name).map(c => ({ id: String(c.id), e: String(c.e || '🏷️'), name: String(c.name) }));
  for (const c of SHOP_CATS) if (!cats.some(x => x.id === c.id)) cats.splice(c.id === 'autre' ? cats.length : SHOP_CATS.indexOf(c), 0, { ...c });
  const items = d.items.filter(i => i && i.name).map(i => ({ id: String(i.id || uid()), k: i.k || undefined, name: String(i.name),
    cat: cats.some(c => c.id === i.cat) ? i.cat : 'autre', qty: String(i.qty || ''), done: !!i.done }));
  return { version: 1, cats, items };
}
function shopLoad() {
  try { const raw = localStorage.getItem(SHOP_KEY); return (raw && shopSanitize(JSON.parse(raw))) || shopFresh(); }
  catch (e) { console.warn('courses', e); return shopFresh(); }
}
let C = shopLoad();
function shopSave() {
  // une catégorie perso vide disparaît d'elle-même
  C.cats = C.cats.filter(c => !c.id.startsWith('c-') || C.items.some(i => i.cat === c.id));
  try { localStorage.setItem(SHOP_KEY, JSON.stringify(C)); } catch { toast('Stockage plein'); }
}
const shopLeft = () => C.items.filter(i => !i.done).length;

/* quantités : « 840 g » + « 360 g » = « 1,2 kg » ; formats différents → « 300 g + 1 tranche » */
function cntLabel(lbl, n) { if (!lbl) return ''; const [one, many] = lbl.split('|'); return n > 1 ? (many || one) : one; }
function qtyText(a) {
  if (a.dim === 'g') return a.v >= 1000 ? `${nb(Math.round(a.v / 10) / 100)} kg` : `${r0(a.v)} g`;
  if (a.dim === 'ml') return a.v >= 1000 ? `${nb(Math.round(a.v / 10) / 100)} L` : `${nb(r1(a.v / 10))} cl`;
  const n = Math.round(a.v * 10) / 10; return `${nb(n)}${a.lbl ? ' ' + cntLabel(a.lbl, n) : ''}`;
}
function parseQtyText(s) {
  const t = shopNorm(s).replace(/^≈\s*/, '');
  let m = t.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|l|cl|ml)$/);
  if (m) { const v = parseFloat(m[1].replace(',', '.')), u = m[2]; return u === 'kg' ? { dim: 'g', v: v * 1000 } : u === 'g' ? { dim: 'g', v } : { dim: 'ml', v: v * (u === 'l' ? 1000 : u === 'cl' ? 10 : 1) }; }
  m = t.match(/^(\d+(?:[.,]\d+)?)(?:\s+(.+))?$/);
  if (m) return { dim: 'n', v: parseFloat(m[1].replace(',', '.')), word: (m[2] || '').replace(/s$/, '') };
  return null;
}
function mergeQty(old, add) {
  if (!add) return old || '';
  if (!old || !old.trim()) return qtyText(add);
  const p = parseQtyText(old);
  if (p && p.dim === add.dim) {
    if (p.dim !== 'n') return qtyText({ dim: p.dim, v: p.v + add.v });
    const aw = shopNorm(cntLabel(add.lbl || '', 1));
    if (p.word === aw || (!p.word && !aw)) return qtyText({ ...add, v: p.v + add.v });
  }
  return `${old} + ${qtyText(add)}`;
}
function ingAmount([q, u], m, def) {
  if (q == null) return null;
  const v = q * m;
  if (u === 'g') return { dim: 'g', v };
  if (u === 'cs') return { dim: 'g', v: v * 15 };
  if (u === 'cc') return { dim: 'g', v: v * 5 };
  if (u === 'cl') return { dim: 'ml', v: v * 10 };
  if (u === 'ml') return { dim: 'ml', v };
  if (u === 'pc') return { dim: 'n', v: Math.ceil(v - 1e-6), lbl: def?.cnt || '' };
  return null;
}
function shopUpsert(name, catHint, amount) {
  const def = shopDefOf(name), n = shopNorm(name);
  let it = def ? C.items.find(i => i.k === def.k) : null;
  it ||= C.items.find(i => shopNorm(i.name) === n);
  if (!it) {
    it = def ? { id: 'd-' + def.k + '-' + uid(), k: def.k, name: def.name, cat: def.cat, qty: '', done: false }
      : { id: uid(), name: name.charAt(0).toUpperCase() + name.slice(1), cat: catHint || shopGuessCat(name), qty: '', done: false };
    if (!C.cats.some(c => c.id === it.cat)) it.cat = 'autre';
    C.items.push(it);
  }
  // déjà dans le caddie lors d'une course précédente → on repart de zéro pour cette quantité
  if (it.done) { it.done = false; it.qty = ''; }
  if (amount) it.qty = mergeQty(it.qty, amount);
  return it;
}
function addRecipeToShop(r, mult) {
  const touched = new Set();
  for (const ing of r.ing) {
    const [q, u, rawName] = ing, base = rawName.split('|')[0];
    if (q == null) {
      // « Sel, poivre, muscade » → un article par épice
      for (const part of base.split(/,|\+|\bou\b|\bet\b/).map(s => s.trim()).filter(Boolean)) {
        const it = shopUpsert(part, shopDefOf(part) ? null : (SHOP_GUESS.find(([c, re]) => c === 'epicerie' && re.test(shopNorm(part))) ? 'epicerie' : shopGuessCat(part) === 'autre' ? 'epices' : null), null);
        touched.add(it.id);
      }
      continue;
    }
    const def = shopDefOf(base);
    touched.add(shopUpsert(base, null, ingAmount(ing, mult, def)).id);
  }
  shopSave(); renderShop();
  return touched.size;
}

let recipeMode = 'recipes';
function setRecipeMode(mode) {
  recipeMode = ['courses', 'frigo'].includes(mode) ? mode : 'recipes';
  $$('#recipeSeg button').forEach(b => b.classList.toggle('active', b.dataset.rm === recipeMode));
  $('#recipesPane').hidden = recipeMode !== 'recipes';
  $('#coursesPane').hidden = recipeMode !== 'courses';
  $('#frigoPane').hidden = recipeMode !== 'frigo';
  if ($('#view-recipes').classList.contains('active')) {
    $('#datenav').style.visibility = recipeMode === 'courses' ? 'hidden' : 'visible';
    history.replaceState(null, '', '#' + (recipeMode === 'recipes' ? 'recipes' : recipeMode));
  }
  if (recipeMode === 'courses') renderShop(); else if (recipeMode === 'frigo') renderFrigo(); else renderRecipes();
}
function catOptions(sel) {
  return C.cats.map(c => `<option value="${esc(c.id)}"${c.id === sel ? ' selected' : ''}>${esc(c.e)} ${esc(c.name)}</option>`).join('') +
    '<option value="__new">＋ Nouvelle catégorie…</option>';
}
function resolveCat(val, newName) {
  if (val !== '__new') return C.cats.some(c => c.id === val) ? val : 'autre';
  const name = String(newName || '').trim(); if (!name) return null;
  const ex = C.cats.find(c => shopNorm(c.name) === shopNorm(name)); if (ex) return ex.id;
  const cat = { id: 'c-' + uid(), e: '🏷️', name: name.charAt(0).toUpperCase() + name.slice(1) };
  C.cats.splice(C.cats.findIndex(c => c.id === 'autre'), 0, cat);
  return cat.id;
}
function renderShopBadge() {
  const n = shopLeft(), b = $('#shopBadge');
  b.textContent = C.items.length && !n ? '✓' : n; b.classList.toggle('done', !!C.items.length && !n);
}
let shopCatTouched = false;
function renderShop() {
  renderShopBadge();
  const n = shopLeft(), done = C.items.length - n;
  $('#shopSummary').textContent = C.items.length ? `${n} à acheter · ${done} dans le caddie` : 'liste vide';
  const sel = $('#shopAddCat'), cur = sel.value;
  sel.innerHTML = catOptions(cur && cur !== '__new' && C.cats.some(c => c.id === cur) ? cur : (cur === '__new' ? '' : 'autre'));
  if (cur === '__new') sel.value = '__new';
  $('#shopAddNewCat').hidden = sel.value !== '__new';
  $('#shopClear').disabled = !done; $('#shopUncheck').disabled = !done;
  const html = C.cats.map(c => {
    const its = C.items.filter(i => i.cat === c.id); if (!its.length) return '';
    const ord = its.filter(i => !i.done).concat(its.filter(i => i.done));
    const left = its.filter(i => !i.done).length;
    return `<div class="card shop-cat" data-cat="${esc(c.id)}"><div class="card-head"><h2>${esc(c.e)} ${esc(c.name)}</h2>
      <span class="shop-count${left ? '' : ' ok'}">${left ? `${left} / ${its.length}` : '✓ tout pris'}</span></div>
      <ul class="shop">${ord.map(i => `<li class="${i.done ? 'done' : ''}" data-item="${esc(i.id)}">
        <button class="shop-check" data-toggle="${esc(i.id)}" role="checkbox" aria-checked="${i.done}" aria-label="${esc(i.name)}"><span class="box">${i.done ? '✓' : ''}</span>
        <span class="shop-txt"><span class="shop-name">${esc(i.name)}</span>${i.qty ? `<span class="shop-qty">${esc(i.qty)}</span>` : ''}</span></button>
        <button class="shop-edit" data-shopedit="${esc(i.id)}" aria-label="Modifier ${esc(i.name)}">✎</button></li>`).join('')}</ul></div>`;
  }).join('');
  $('#shopList').innerHTML = html || '<div class="card"><p class="hint center" style="margin:0">Ta liste est vide. Ajoute un article ou restaure la liste par défaut.</p></div>';
}
function openShopEditor(id) {
  const it = C.items.find(i => i.id === id); if (!it) return;
  openSheet(`<h3>Modifier l’article</h3>
    <form id="shEdit" autocomplete="off">
      <label>Article<input id="shName" value="${esc(it.name)}" required></label>
      <label class="mt12">Quantité (optionnel)<input id="shQty" value="${esc(it.qty)}" placeholder="ex. 7 boîtes, 1,4 kg, 2 L"></label>
      <label class="mt12">Catégorie<select id="shCat">${catOptions(it.cat)}</select></label>
      <input id="shNewCat" class="mt8" placeholder="Nom de la nouvelle catégorie" hidden>
      <button class="btn block mt12" type="submit">Enregistrer</button>
    </form>
    <div class="row mt8"><button class="btn ghost grow danger-text" id="shDel">🗑 Supprimer</button><button class="btn ghost grow" data-close>Annuler</button></div>`);
  $('#shCat').onchange = () => { $('#shNewCat').hidden = $('#shCat').value !== '__new'; if (!$('#shNewCat').hidden) $('#shNewCat').focus(); };
  $('#shEdit').onsubmit = e => {
    e.preventDefault();
    const name = $('#shName').value.trim(); if (!name) return toast('Donne un nom à l’article');
    const cat = resolveCat($('#shCat').value, $('#shNewCat').value); if (!cat) return toast('Donne un nom à la nouvelle catégorie');
    if (shopNorm(name) !== shopNorm(it.name)) { const d = shopDefOf(name); it.k = d && !C.items.some(x => x !== it && x.k === d.k) ? d.k : undefined; }
    Object.assign(it, { name, qty: $('#shQty').value.trim(), cat });
    shopSave(); closeSheet(); renderShop(); toast('Article modifié');
  };
  $('#shDel').onclick = () => {
    if (!confirm(`Supprimer « ${it.name} » de la liste ?`)) return;
    C.items = C.items.filter(i => i !== it); shopSave(); closeSheet(); renderShop(); toast('Article supprimé');
  };
}
function bindShop() {
  $('#recipeSeg').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { setRecipeMode(b.dataset.rm); window.scrollTo(0, 0); } });
  $('#shopList').addEventListener('click', e => {
    const ed = e.target.closest('[data-shopedit]'); if (ed) return openShopEditor(ed.dataset.shopedit);
    const t = e.target.closest('[data-toggle]'); if (!t) return;
    const it = C.items.find(i => i.id === t.dataset.toggle); if (!it) return;
    it.done = !it.done; shopSave(); renderShop();
  });
  $('#shopAddName').addEventListener('input', () => {
    if (shopCatTouched) return;
    const v = $('#shopAddName').value.trim(); if (!v) return;
    const g = shopGuessCat(v); if (C.cats.some(c => c.id === g)) $('#shopAddCat').value = g;
  });
  $('#shopAddCat').onchange = () => {
    shopCatTouched = true; $('#shopAddNewCat').hidden = $('#shopAddCat').value !== '__new';
    if (!$('#shopAddNewCat').hidden) $('#shopAddNewCat').focus();
  };
  $('#shopAddForm').onsubmit = e => {
    e.preventDefault();
    const name = $('#shopAddName').value.trim(); if (!name) return toast('Écris le nom de l’article');
    const cat = resolveCat($('#shopAddCat').value, $('#shopAddNewCat').value); if (!cat) return toast('Donne un nom à la nouvelle catégorie');
    const qty = $('#shopAddQty').value.trim();
    const ex = C.items.find(i => shopNorm(i.name) === shopNorm(name));
    if (ex) {
      ex.done = false; if (qty) ex.qty = ex.qty ? `${ex.qty} + ${qty}` : qty;
      toast(`« ${ex.name} » était déjà dans la liste`);
    } else {
      C.items.push({ id: uid(), name: name.charAt(0).toUpperCase() + name.slice(1), cat, qty, done: false });
      toast(`✓ ${name} ajouté à la liste`);
    }
    $('#shopAddName').value = ''; $('#shopAddQty').value = ''; $('#shopAddNewCat').value = ''; shopCatTouched = false;
    $('#shopAddCat').value = 'autre'; $('#shopAddNewCat').hidden = true;
    shopSave(); renderShop();
  };
  $('#shopUncheck').onclick = () => {
    if (!confirm('Nouvelle course : décocher tous les articles ?')) return;
    C.items.forEach(i => (i.done = false)); shopSave(); renderShop(); toast('Tout est décoché');
  };
  $('#shopClear').onclick = () => {
    const n = C.items.filter(i => i.done).length; if (!n) return;
    if (!confirm(`Supprimer de la liste les ${n} article${n > 1 ? 's' : ''} coché${n > 1 ? 's' : ''} ?`)) return;
    C.items = C.items.filter(i => !i.done); shopSave(); renderShop(); toast('Articles cochés supprimés');
  };
  $('#shopRestore').onclick = () => {
    if (!confirm('Restaurer la liste par défaut ? Tes articles perso, tes catégories et les quantités seront effacés.')) return;
    C = shopFresh(); shopSave(); renderShop(); toast('Liste par défaut restaurée');
  };
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

/* ---------- Dictée du code-barres (Web Speech API) ----------
 * iPhone : webkitSpeechRecognition marche dans Safari (Siri/Dictée activés) mais Apple ne l'active PAS
 * dans les web apps ajoutées à l'écran d'accueil (WebKit bug 225298) → on bascule alors sur le 🎤 du clavier iOS. */
const FR_UNITS = { zero: 0, 'zéro': 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9 };
const FR_TEENS = { dix: 10, onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16 };
const FR_TENS = { vingt: 20, vingts: 20, trente: 30, quarante: 40, cinquante: 50, soixante: 60 };
/* « trois zéro dix-sept soixante-deux » → "3017 62" sans espace → "301762" */
function parseSpokenDigits(text) {
  // on garde l'info « collé par un tiret » : « quatre-vingt-deux » = 82 mais « quatre vingt-deux » = 4 puis 22
  const toks = [], hy = [];
  String(text || '').toLowerCase().replace(/[’']/g, ' ').replace(/[‐–—_]/g, '-').replace(/[^\p{L}\d\s-]+/gu, ' ')
    .split(/\s+/).filter(Boolean).forEach(w => w.split('-').filter(Boolean).forEach((p, k) => { toks.push(p); hy.push(k > 0); }));
  let out = '', i = 0;
  const unitAt = k => (toks[k] in FR_UNITS ? FR_UNITS[toks[k]] : null);
  const teenAt = k => { // 10..19 : dix, onze..seize, dix-sept/huit/neuf ; renvoie [valeur, nb de mots]
    if (toks[k] in FR_TEENS && toks[k] !== 'dix') return [FR_TEENS[toks[k]], 1];
    if (toks[k] === 'dix') { const u = unitAt(k + 1); return u >= 7 ? [10 + u, 2] : [10, 1]; }
    return null;
  };
  while (i < toks.length) {
    const t = toks[i];
    if (/^\d+$/.test(t)) { out += t; i++; continue; }
    const d = t.replace(/\D/g, ''); // « 3e », « n°3 »…
    if (d && /\d/.test(t) && !/[a-zé]{3,}/.test(t)) { out += d; i++; continue; }
    let base = null, n = 0;
    if (t === 'quatre' && (toks[i + 1] === 'vingt' || toks[i + 1] === 'vingts') && (hy[i + 1] || !hy[i + 2] || i + 2 >= toks.length)) { base = 80; n = 2; }
    else if (t in FR_TENS) { base = FR_TENS[t]; n = 1; }
    if (base != null) {
      let j = i + n, v = base;
      if (toks[j] === 'et' && (toks[j + 1] === 'un' || toks[j + 1] === 'une' || toks[j + 1] === 'onze')) { v += toks[j + 1] === 'onze' ? 11 : 1; j += 2; }
      else if ((base === 60 || base === 80) && teenAt(j)) { const [tv, tn] = teenAt(j); v += tv; j += tn; }
      else if (unitAt(j) > 0) { v += unitAt(j); j++; }
      out += String(v); i = j; continue;
    }
    const te = teenAt(i); if (te) { out += String(te[0]); i += te[1]; continue; }
    const u = unitAt(i); if (u != null) { out += String(u); i++; continue; }
    i++; // « et », « euh », mots inconnus : ignorés
  }
  return out;
}
function eanValid(code) {
  if (!/^(\d{8}|\d{12}|\d{13})$/.test(code)) return false;
  const d = code.split('').map(Number), check = d.pop();
  const sum = d.reverse().reduce((a, x, k) => a + x * (k % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}
const getSR = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;
const isIOSStandalone = () => navigator.standalone === true;
const speechAvailable = () => !!getSR() && !isIOSStandalone();
const KB_MIC_HINT = 'Astuce iPhone : touche le champ puis le 🎤 du clavier pour dicter les chiffres.';
let dict = null; // dictée en cours { rec, input, status, btn, timer }
function stopDictation(silent) {
  if (!dict) return;
  const d = dict; dict = null; clearTimeout(d.timer);
  try { d.rec.onresult = d.rec.onerror = d.rec.onend = d.rec.onstart = d.rec.onaudiostart = null; d.rec.abort(); } catch { }
  d.btn.classList.remove('listening'); d.btn.setAttribute('aria-pressed', 'false'); d.btn.textContent = '🎤';
  if (!silent && d.status.dataset.state === 'listening') setVoiceStatus(d.status, '', '');
}
function setVoiceStatus(el, state, html) { el.dataset.state = state; el.innerHTML = html; el.hidden = !html; }
function micFallback(input, status, why) {
  setVoiceStatus(status, 'info', `${why ? esc(why) + '<br>' : ''}${KB_MIC_HINT}`);
  input.setAttribute('inputmode', 'numeric'); input.focus();
}
/* btn 🎤 → écoute ; remplit input en direct ; onCode(code) quand un EAN valide est reconnu */
function startDictation(input, status, btn, onCode) {
  if (dict && dict.btn === btn) return stopDictation();
  stopDictation(true);
  const SR = getSR();
  if (!SR) return micFallback(input, status, 'La dictée n\u2019est pas disponible dans ce navigateur.');
  if (isIOSStandalone()) return micFallback(input, status, 'Dans l\u2019appli de l\u2019écran d\u2019accueil, iOS bloque la dictée web (elle marche dans Safari).');
  let rec;
  try { rec = new SR(); } catch { return micFallback(input, status, 'La dictée n\u2019a pas pu démarrer.'); }
  rec.lang = 'fr-FR'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
  const cur = input.value.replace(/\D/g, '');
  const base = cur && cur.length < 13 && !eanValid(cur) ? cur : ''; // on complète un code commencé
  let started = false, done = false, finalTxt = '';
  dict = { rec, input, status, btn, timer: null };
  btn.classList.add('listening'); btn.setAttribute('aria-pressed', 'true'); btn.textContent = '■';
  setVoiceStatus(status, 'listening', `<span class="rec-dot"></span> J\u2019écoute… dis les chiffres du code${base ? ` (suite de ${base})` : ''}`);
  const finish = code => {
    done = true; stopDictation(true);
    if (eanValid(code)) { setVoiceStatus(status, 'ok', `✓ Code ${code} reconnu`); onCode(code); }
    else if (code.length) setVoiceStatus(status, 'warn', `${code.length} chiffre${code.length > 1 ? 's' : ''} : ${code.length > 13 || [8, 12, 13].includes(code.length) ? 'code invalide (clé de contrôle)' : 'code incomplet'}. Corrige-le, ou touche 🎤 pour dicter la suite.`);
    else setVoiceStatus(status, 'warn', 'Je n\u2019ai pas reconnu de chiffres. Réessaie en parlant près du micro.');
  };
  const fill = (txt, final) => {
    const code = (base + parseSpokenDigits(txt)).slice(0, 14);
    input.value = code;
    if (!final) { setVoiceStatus(status, 'listening', `<span class="rec-dot"></span> « ${esc(txt.trim())} »`); if (code.length === 13 && eanValid(code)) finish(code); }
    return code;
  };
  rec.onstart = rec.onaudiostart = () => { started = true; };
  rec.onresult = e => {
    started = true;
    let interim = ''; finalTxt = '';
    for (let k = 0; k < e.results.length; k++) { const r = e.results[k]; if (r.isFinal) finalTxt += r[0].transcript + ' '; else interim += r[0].transcript + ' '; }
    if (done) return;
    const all = finalTxt + interim;
    const code = fill(all, !interim.trim());
    if (!done && !interim.trim() && finalTxt.trim()) finish(code);
  };
  rec.onerror = e => {
    if (done) return; done = true; stopDictation(true);
    const err = e.error || '';
    if (err === 'not-allowed' || err === 'service-not-allowed') micFallback(input, status, isIOSStandalone() || err === 'service-not-allowed'
      ? 'La dictée est refusée ici (micro ou Siri/Dictée désactivés).' : 'Micro refusé. Autorise le micro pour ce site (iPhone : Réglages › Safari › Micro).');
    else if (err === 'no-speech') setVoiceStatus(status, 'warn', 'Je n\u2019ai rien entendu. Touche 🎤 et dis les chiffres.');
    else if (err === 'network') setVoiceStatus(status, 'warn', 'La dictée a besoin d\u2019internet. Tape le code ou réessaie.');
    else if (err === 'aborted') setVoiceStatus(status, '', '');
    else micFallback(input, status, 'Erreur de dictée (' + err + ').');
  };
  rec.onend = () => { if (done || !dict || dict.rec !== rec) return; finish(input.value.replace(/\D/g, '')); };
  // sur un iPhone où l'API existe mais ne démarre jamais (web app écran d'accueil…), on ne reste pas bloqué
  dict.timer = setTimeout(() => { if (!started && dict && dict.rec === rec) { done = true; stopDictation(true); micFallback(input, status, 'La dictée ne répond pas ici.'); } }, 4000);
  try { rec.start(); }
  catch (e) { done = true; stopDictation(true); micFallback(input, status, 'La dictée n\u2019a pas pu démarrer.'); }
}
function micHint(status) { if (!speechAvailable()) setVoiceStatus(status, 'info', KB_MIC_HINT); }

/* ---------- Scanner code-barres ----------
 * Android/Chrome : BarcodeDetector natif. iPhone/Safari (et Firefox) : polyfill barcode-detector (MIT)
 * + zxing-wasm, servis depuis vendor/ (aucun CDN) et mis en cache par le service worker → marche hors ligne. */
const BD_JS = 'vendor/barcode-detector/barcode-detector.ponyfill.js';
const BD_WASM = 'vendor/barcode-detector/zxing_reader.wasm';
const SCAN_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
let bdPromise = null;
function loadBarcodePolyfill() {
  if (bdPromise) return bdPromise;
  bdPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = BD_JS; s.async = true;
    s.onload = async () => {
      try {
        const api = window.BarcodeDetectionAPI;
        if (!api || !api.BarcodeDetector) throw new Error('polyfill absent');
        const wasmUrl = new URL(BD_WASM, document.baseURI).href;
        // charge le .wasm local tout de suite (pas de CDN), pour que le 1er scan soit rapide
        await api.prepareZXingModule({ overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) }, fireImmediately: true });
        resolve(api.BarcodeDetector);
      } catch (e) { bdPromise = null; reject(e); }
    };
    s.onerror = () => { bdPromise = null; s.remove(); reject(new Error('chargement du lecteur impossible')); };
    document.head.appendChild(s);
  });
  return bdPromise;
}
async function getBarcodeDetector() {
  if ('BarcodeDetector' in window) {
    try {
      const f = await window.BarcodeDetector.getSupportedFormats();
      if (f.includes('ean_13')) return { det: new window.BarcodeDetector({ formats: SCAN_FORMATS.filter(x => f.includes(x)) }), native: true };
    } catch { /* natif inutilisable → polyfill */ }
  }
  const Cls = await loadBarcodePolyfill();
  return { det: new Cls({ formats: SCAN_FORMATS }), native: false };
}
let scanStream = null, scanTimer = null, scanActive = false;
async function startScan() {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast('Caméra indisponible ici : tape le code à la main');
    $('#barcodeInput').focus(); return;
  }
  scanActive = true;
  openSheet(`<h3>Scanner un code-barres</h3><p class="hint" id="scanStatus">Ouverture de la caméra…</p>
    <div class="scan-box"><video id="scanVideo" playsinline webkit-playsinline muted autoplay></video><div class="scan-frame"></div></div>
    <form class="row mt8" id="scanManual"><input type="text" inputmode="numeric" pattern="[0-9]*" id="scanManualInput" placeholder="ou tape / dicte le code" autocomplete="off"><button class="mic-btn" type="button" id="scanMic" aria-label="Dicter le code-barres" aria-pressed="false">🎤</button><button class="btn ghost" type="submit">OK</button></form>
    <p class="voice-status" id="scanVoiceStatus" role="status" aria-live="polite" hidden></p>
    <button class="btn ghost block" data-close>Annuler</button>`, stopScan);
  $('#scanManual').onsubmit = e => { e.preventDefault(); const c = $('#scanManualInput').value; closeSheet(); lookupBarcode(c); };
  $('#scanMic').onclick = () => startDictation($('#scanManualInput'), $('#scanVoiceStatus'), $('#scanMic'), code => { closeSheet(); lookupBarcode(code); });
  micHint($('#scanVoiceStatus'));
  const detP = getBarcodeDetector();
  detP.catch(() => {});
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (!scanActive) { stopScan(); return; }
    const v = $('#scanVideo'); v.setAttribute('playsinline', ''); v.muted = true; v.srcObject = scanStream; await v.play();
  } catch (e) { closeSheet(); toast('Caméra refusée ou indisponible : tape le code à la main'); $('#barcodeInput').focus(); return; }
  let det;
  try { $('#scanStatus').textContent = 'Préparation du lecteur…'; ({ det } = await getBarcodeDetector()); }
  catch (e) { if (scanActive) $('#scanStatus').textContent = 'Lecteur indisponible : tape le code ci-dessous.'; return; }
  if (!scanActive) return;
  $('#scanStatus').textContent = 'Vise le code-barres, bien à plat et éclairé.';
  const v = $('#scanVideo'), cv = document.createElement('canvas'), ctx = cv.getContext('2d', { willReadFrequently: true });
  const tick = async () => {
    if (!scanActive) return;
    try {
      if (v.readyState >= 2 && v.videoWidth) {
        const sc = Math.min(1, 960 / v.videoWidth);
        cv.width = Math.round(v.videoWidth * sc); cv.height = Math.round(v.videoHeight * sc);
        ctx.drawImage(v, 0, 0, cv.width, cv.height);
        const codes = await det.detect(cv);
        const hit = codes.find(c => /^\d{8,14}$/.test(c.rawValue));
        if (hit && scanActive) { if (navigator.vibrate) navigator.vibrate(60); closeSheet(); lookupBarcode(hit.rawValue); return; }
      }
    } catch { /* image pas prête */ }
    scanTimer = setTimeout(tick, 200);
  };
  tick();
}
function stopScan() {
  scanActive = false; stopDictation(true);
  clearTimeout(scanTimer); scanTimer = null;
  if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
}

/* ---------- Photo + analyse IA (Claude) ---------- */
/* La clé API n'est JAMAIS dans le code : Killian la colle dans Réglages, elle reste dans
 * le localStorage de son téléphone (clé séparée, hors sauvegarde exportée) et n'est envoyée
 * qu'à api.anthropic.com. */
const AI_KEY_STORE = 'coachKillian.anthropicKey';
const AI_ENDPOINT = 'https://api.anthropic.com/v1/messages';
// modèles Claude actuels (docs.claude.com, oct. 2026) ; prix $/million de tokens [entrée, sortie]
const AI_MODELS = [
  { id: 'claude-haiku-5-5', label: 'Haiku 5.5 · rapide, économique', price: [0.10, 0.50], cost: 'Moins de 0,1 centime par photo' },
  { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5 · plus précis', price: [2, 10], cost: 'Environ 1 centime par photo' }
];
const AI_DEFAULT_MODEL = AI_MODELS[0].id;
const aiModel = () => AI_MODELS.find(m => m.id === S.ai?.model) || AI_MODELS[0];
function getApiKey() { try { return localStorage.getItem(AI_KEY_STORE) || ''; } catch { return ''; } }
function setApiKey(k) { if (k) localStorage.setItem(AI_KEY_STORE, k); else localStorage.removeItem(AI_KEY_STORE); }
const maskKey = k => (k ? `${k.slice(0, 7)}••••••••${k.slice(-4)}` : '');
const monthKey = () => todayKey().slice(0, 7);
function aiUsage() {
  S.ai ||= { model: AI_DEFAULT_MODEL };
  if (!S.ai.usage || S.ai.usage.month !== monthKey()) S.ai.usage = { month: monthKey(), n: 0, usd: 0 };
  return S.ai.usage;
}
function countAnalysis(usage, model) {
  const u = aiUsage(); u.n++;
  if (usage) {
    const m = AI_MODELS.find(x => x.id === model) || aiModel();
    const inTok = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
    u.usd = Math.round((u.usd + (inTok * m.price[0] + (usage.output_tokens || 0) * m.price[1]) / 1e6) * 1e5) / 1e5;
  }
  save();
}

class AIError extends Error {
  constructor(kind, msg, retry) { super(msg); this.kind = kind; this.retry = !!retry; }
}

function aiPrompt(precision) {
  const plats = S.presets.map(p => `- ${p.name} : ${r0(p.kcal)} kcal, P ${r0(p.p)} g, G ${r0(p.g)} g, L ${r0(p.l)} g par portion${p.desc ? ` (${p.desc})` : ''}`).join('\n');
  return `Tu es un nutritionniste français. Analyse la photo de ce repas.
1. Identifie chaque aliment visible dans l'assiette, le bol, le verre ou la boîte.
2. Estime le poids en grammes de chaque aliment TEL QU'IL EST DANS L'ASSIETTE (riz, pâtes, semoule, légumes = poids CUIT ; viande = poids cuit ; boissons en ml ≈ g).
3. Calcule pour chaque aliment kcal, protéines, glucides et lipides (g), avec des valeurs type table CIQUAL. Compte l'huile ou la matière grasse de cuisson probable (environ 5 à 10 g par plat poêlé ou en sauce).

Repères de portions françaises : assiette plate ≈ 26 cm de diamètre ; portion de riz ou de pâtes cuits ≈ 200 à 300 g ; blanc de poulet ≈ 120 à 150 g ; steak haché ≈ 100 à 125 g ; tranche de pain ≈ 30 à 40 g ; œuf ≈ 55 g sans coquille ; c. à soupe d'huile ≈ 10 g ; boîte de batch cooking ≈ 450 à 550 g.

Voici les plats habituels de l'utilisateur (il fait du batch cooking, ses boîtes ressemblent souvent à ça). Si le repas correspond à l'un d'eux, utilise son nom dans "plat" et inspire-toi de ses valeurs, ajustées à la quantité visible :
${plats}
${precision ? `\nPrécision donnée par l'utilisateur (prioritaire sur ton estimation visuelle) : « ${precision} »\n` : ''}
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour ni bloc de code, au format exact :
{"plat":"nom court du repas","aliments":[{"nom":"","grammes":0,"kcal":0,"proteines":0,"glucides":0,"lipides":0}],"total":{"grammes":0,"kcal":0,"proteines":0,"glucides":0,"lipides":0},"confiance":"faible|moyenne|haute","remarque":""}
Les nombres sont des nombres JSON (pas de texte, pas d'unité). "remarque" : une phrase courte en français (ce qui est incertain, ou un conseil pour mieux estimer). Si la photo ne montre pas de nourriture, renvoie "aliments": [] et explique-le dans "remarque".`;
}

function buildAIRequest(b64, precision, model, withEffort = true) {
  const body = {
    model: model || aiModel().id,
    max_tokens: 3000,
    messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
      { type: 'text', text: aiPrompt(precision) }
    ] }]
  };
  if (withEffort) body.output_config = { effort: 'low' }; // moins de réflexion = moins cher et plus rapide
  return body;
}
async function callClaude(body, key) {
  if (navigator.onLine === false) throw new AIError('offline', 'Pas de connexion internet. L\u2019analyse a besoin du réseau : réessaie quand tu as du réseau, ou enregistre la photo sans analyse.', true);
  let res;
  try {
    res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(body)
    });
  } catch (e) {
    throw new AIError('offline', 'Impossible de joindre Claude (réseau coupé ou instable). Vérifie ta connexion puis réessaie.', true);
  }
  let data = null;
  try { data = await res.json(); } catch { /* corps vide */ }
  if (res.ok) return data;
  const type = data?.error?.type || '', msg = String(data?.error?.message || '');
  if (/credit balance|billing|crédit/i.test(msg)) throw new AIError('credit', 'Ton crédit Anthropic est épuisé. Ajoute des crédits sur console.anthropic.com (Settings → Billing), puis réessaie.');
  if (res.status === 401 || type === 'authentication_error') throw new AIError('auth', 'Clé API invalide ou supprimée. Vérifie-la (ou crée-en une nouvelle sur console.anthropic.com) et colle-la dans Réglages.');
  if (res.status === 403 || type === 'permission_error') throw new AIError('auth', 'Cette clé n\u2019a pas le droit d\u2019utiliser ce modèle. Vérifie ta clé ou choisis l\u2019autre modèle dans Réglages.');
  if (res.status === 429 || type === 'rate_limit_error') throw new AIError('busy', 'Trop de demandes d\u2019un coup. Attends une minute puis réessaie.', true);
  if (res.status === 529 || res.status === 503 || type === 'overloaded_error') throw new AIError('busy', 'Claude est surchargé en ce moment. Réessaie dans quelques instants.', true);
  if (res.status === 404 || type === 'not_found_error') throw new AIError('model', `Modèle introuvable (${body.model}). Choisis l\u2019autre modèle dans Réglages.`);
  if (res.status === 413) throw new AIError('size', 'Photo trop lourde. Réessaie avec une autre photo.');
  if (res.status >= 500) throw new AIError('busy', 'Erreur temporaire chez Anthropic. Réessaie dans quelques instants.', true);
  const err = new AIError('request', `Requête refusée (${res.status}) : ${msg || type || 'erreur inconnue'}`);
  err.status = res.status; err.apiMsg = msg;
  throw err;
}

/* Extrait le JSON d'une réponse texte (tolère ```json, texte autour, virgules finales) */
function extractJSON(text) {
  let t = String(text || '').replace(/```(?:json)?/gi, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) throw new AIError('parse', 'Claude n\u2019a pas renvoyé de résultat lisible. Réessaie (ou ajoute une précision).', true);
  t = t.slice(a, b + 1);
  try { return JSON.parse(t); } catch { /* on tente une réparation */ }
  try { return JSON.parse(t.replace(/,\s*([}\]])/g, '$1').replace(/[“”]/g, '"')); }
  catch { throw new AIError('parse', 'Réponse de Claude mal formée. Réessaie.', true); }
}
const num = v => { const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : 0; };
function normalizeAI(j) {
  const items = (Array.isArray(j?.aliments) ? j.aliments : []).map(a => {
    const it = { nom: String(a.nom || a.name || 'Aliment').slice(0, 60), grammes: r0(num(a.grammes ?? a.g ?? a.poids)),
      kcal: num(a.kcal ?? a.calories), p: num(a.proteines ?? a['protéines']), g: num(a.glucides), l: num(a.lipides) };
    if (!it.kcal) it.kcal = kcalOf(it.p, it.g, it.l);
    return it;
  }).filter(it => it.grammes || it.kcal);
  const conf = String(j?.confiance || '').toLowerCase();
  return { plat: String(j?.plat || '').slice(0, 60), items, confiance: ['faible', 'moyenne', 'haute'].includes(conf) ? conf : 'moyenne', remarque: String(j?.remarque || '').slice(0, 300) };
}

/**
 * Analyse une photo de repas avec Claude.
 * dataUrl : image JPEG (data URL) ; renvoie { plat, items:[{nom, grammes, kcal, p, g, l}], confiance, remarque }
 * ou null si aucune clé n'est enregistrée. Lève une AIError en cas de problème.
 */
async function analyzePhoto(dataUrl, precision = '') {
  const key = getApiKey();
  if (!key) return null;
  const b64 = String(dataUrl).split(',')[1] || '';
  const model = aiModel().id;
  let data;
  try { data = await callClaude(buildAIRequest(b64, precision, model, true), key); }
  catch (e) {
    // si l'API refuse le réglage d'effort, on relance une fois sans
    if (e.kind === 'request' && e.status === 400 && /effort|output_config/i.test(e.apiMsg || '')) data = await callClaude(buildAIRequest(b64, precision, model, false), key);
    else if (e.kind === 'busy' && /surchargé/.test(e.message)) { await new Promise(r => setTimeout(r, 1500)); data = await callClaude(buildAIRequest(b64, precision, model, true), key); }
    else throw e;
  }
  countAnalysis(data?.usage, model);
  const text = (data?.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
  if (!text && data?.stop_reason === 'refusal') throw new AIError('parse', 'Claude a refusé d\u2019analyser cette image.');
  return normalizeAI(extractJSON(text));
}

async function testApiKey(key) {
  const data = await callClaude({ model: aiModel().id, max_tokens: 16, messages: [{ role: 'user', content: 'Réponds juste OK.' }] }, key);
  return !!data;
}

/* Redimensionne/compresse côté téléphone */
function resizeImage(file, max = 360, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = e => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

async function onPhoto(file) {
  if (!file) return;
  let thumb, big;
  try { thumb = await resizeImage(file); } catch { return toast('Image illisible'); }
  const precision = ($('#photoPrecision')?.value || '').trim();
  if (!getApiKey()) return openPhotoJournal(thumb, true);
  try { big = await resizeImage(file, 1024, 0.8); } catch { big = thumb; }
  runAnalysis({ thumb, big, precision });
}

let aiRun = 0;
async function runAnalysis(ctx) {
  const run = ++aiRun;
  openSheet(`
    <h3>Analyse de ton repas…</h3>
    <img class="photo-preview" src="${ctx.thumb}" alt="">
    <div class="ai-loading"><span class="spinner" aria-hidden="true"></span><span>Claude regarde ton assiette (5 à 15 s)</span></div>
    ${ctx.precision ? `<p class="hint">Précision : « ${esc(ctx.precision)} »</p>` : ''}
    <button class="btn ghost block" id="aiCancel">Annuler</button>`, () => { if (aiRun === run) aiRun++; });
  $('#aiCancel').onclick = () => { aiRun++; closeSheet(); };
  try {
    const res = await analyzePhoto(ctx.big, ctx.precision);
    if (run !== aiRun) return; // annulé entre-temps
    if (!res) return openPhotoJournal(ctx.thumb, true);
    openAIResult(ctx, res);
  } catch (e) {
    if (run !== aiRun) return;
    console.warn('analyse', e);
    openAIError(ctx, e instanceof AIError ? e : new AIError('other', 'Erreur inattendue : ' + (e.message || e), true));
  }
}

function openAIError(ctx, e) {
  const toSettings = e.kind === 'auth' || e.kind === 'model' || e.kind === 'nokey';
  const toConsole = e.kind === 'credit' || e.kind === 'auth';
  openSheet(`
    <h3>Analyse impossible</h3>
    <img class="photo-preview small" src="${ctx.thumb}" alt="">
    <div class="ai-error" role="alert">${esc(e.message)}</div>
    ${toConsole ? '<p class="hint"><a href="https://console.anthropic.com/" target="_blank" rel="noopener">Ouvrir console.anthropic.com ↗</a></p>' : ''}
    ${e.retry ? '<button class="btn block" id="aiRetry">↻ Réessayer</button>' : ''}
    ${toSettings ? '<button class="btn ghost block mt8" id="aiGoSettings">⚙ Ouvrir Réglages → Analyse photo</button>' : ''}
    <button class="btn ghost block mt8" id="aiManual">Enregistrer sans analyse</button>
    <button class="btn ghost block mt8" data-close>Annuler</button>`);
  if (e.retry) $('#aiRetry').onclick = () => runAnalysis(ctx);
  if (toSettings) $('#aiGoSettings').onclick = () => { closeSheet(); goAISettings(); };
  $('#aiManual').onclick = () => openPhotoJournal(ctx.thumb, false);
}
function goAISettings() { show('settings'); setTimeout(() => $('#aiCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }

/* Écran de résultat : liste modifiable */
function openAIResult(ctx, res) {
  // chaque ligne garde ses valeurs « par gramme » pour recalculer quand on change le poids
  const rows = res.items.map(it => ({ nom: it.nom, grammes: it.grammes || 100, per: perGram(it, it.grammes || 100) }));
  const confLbl = { faible: 'Confiance faible', moyenne: 'Confiance moyenne', haute: 'Confiance haute' }[res.confiance];
  const dayLbl = curDate === todayKey() ? 'Ajouter à aujourd\u2019hui' : `Ajouter (${dateLabel(curDate).toLowerCase()})`;
  openSheet(`
    <h3>Résultat de l'analyse</h3>
    <div class="ai-head"><img class="thumb big" src="${ctx.thumb}" alt="">
      <div><span class="conf conf-${res.confiance}">${confLbl}</span>
      ${res.remarque ? `<p class="hint ai-rem">${esc(res.remarque)}</p>` : ''}</div></div>
    <label>Nom du repas<input id="aiName" value="${esc(res.plat || (res.items[0] ? res.items.map(i => i.nom).slice(0, 3).join(', ') : 'Repas (photo)'))}"></label>
    <h4>Aliments détectés <small class="muted">(modifie les grammes)</small></h4>
    <ul class="ai-items" id="aiItems"></ul>
    <button class="btn ghost block small" id="aiAddRow">+ Ajouter un aliment</button>
    <datalist id="baseFoodsDL">${BASE_FOODS.map(f => `<option value="${esc(f.name)}">`).join('')}</datalist>
    <div class="ai-total" id="aiTotal"></div>
    <details class="ai-redo"><summary>Pas juste ? Ajoute une précision et relance</summary>
      <input id="aiPrecision" placeholder="ex. il y a 150 g de riz" value="${esc(ctx.precision || '')}">
      <button class="btn ghost block small mt8" id="aiRedo">↻ Relancer l'analyse</button></details>
    <button class="btn block" id="aiSave">${dayLbl}</button>
    <button class="btn ghost block mt8" id="aiCancelRes">Annuler</button>`);
  const list = $('#aiItems');
  const render = () => {
    list.innerHTML = rows.length ? rows.map((r, i) => {
      const m = macrosOf(r);
      return `<li data-i="${i}">
        <div class="ai-row1"><input class="ai-nom" data-f="nom" value="${esc(r.nom)}" list="baseFoodsDL" aria-label="Aliment">
          <label class="ai-g"><input type="number" data-f="grammes" inputmode="decimal" min="0" value="${r0(r.grammes)}" aria-label="Grammes"><span>g</span></label>
          <button class="del" data-rm="${i}" aria-label="Supprimer la ligne">✕</button></div>
        <div class="ai-row2">
          <label>kcal<input type="number" data-f="kcal" inputmode="numeric" value="${r0(m.kcal)}"></label>
          <label>P<input type="number" data-f="p" inputmode="decimal" value="${r1(m.p)}"></label>
          <label>G<input type="number" data-f="g" inputmode="decimal" value="${r1(m.g)}"></label>
          <label>L<input type="number" data-f="l" inputmode="decimal" value="${r1(m.l)}"></label></div></li>`;
    }).join('') : '<li class="empty">Aucun aliment. Ajoute-en un.</li>';
    renderTotal();
  };
  const renderTotal = () => {
    const t = sumRows(rows);
    $('#aiTotal').innerHTML = `<b>Total</b><span class="pill"><b>${fmt(t.kcal)}</b> kcal</span><span class="pill">P ${r0(t.p)} g</span><span class="pill">G ${r0(t.g)} g</span><span class="pill">L ${r0(t.l)} g</span>`;
  };
  const syncRow = li => { // met à jour les champs macros d'une ligne sans reconstruire la liste (garde le focus)
    const r = rows[+li.dataset.i], m = macrosOf(r);
    li.querySelector('[data-f=kcal]').value = r0(m.kcal); li.querySelector('[data-f=p]').value = r1(m.p);
    li.querySelector('[data-f=g]').value = r1(m.g); li.querySelector('[data-f=l]').value = r1(m.l);
  };
  list.addEventListener('input', e => {
    const inp = e.target.closest('[data-f]'), li = e.target.closest('li[data-i]'); if (!inp || !li) return;
    const r = rows[+li.dataset.i], f = inp.dataset.f, v = parseFloat(String(inp.value).replace(',', '.')) || 0;
    if (f === 'nom') r.nom = inp.value;
    else if (f === 'grammes') { r.grammes = v; syncRow(li); }
    else { // modification directe d'une macro : on recalcule la valeur par gramme
      const g = r.grammes || 100; if (!r.grammes) { r.grammes = 100; li.querySelector('[data-f=grammes]').value = 100; }
      r.per[f] = v / g;
      if (f !== 'kcal') { r.per.kcal = kcalOf(r.per.p, r.per.g, r.per.l); li.querySelector('[data-f=kcal]').value = r0(r.per.kcal * r.grammes); }
    }
    renderTotal();
  });
  list.addEventListener('change', e => { // nom choisi dans les aliments de base → remplit les macros si la ligne est vide
    const inp = e.target.closest('[data-f=nom]'), li = e.target.closest('li[data-i]'); if (!inp || !li) return;
    const r = rows[+li.dataset.i], bf = BASE_FOODS.find(f => f.name === inp.value);
    if (bf && !macrosOf(r).kcal) { r.per = perGram(bf, 100); syncRow(li); renderTotal(); }
  });
  list.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { rows.splice(+b.dataset.rm, 1); render(); } });
  $('#aiAddRow').onclick = () => { rows.push({ nom: '', grammes: 100, per: { kcal: 0, p: 0, g: 0, l: 0 } }); render(); list.querySelector('li:last-child .ai-nom')?.focus(); };
  $('#aiRedo').onclick = () => { ctx.precision = $('#aiPrecision').value.trim(); runAnalysis(ctx); };
  $('#aiCancelRes').onclick = closeSheet;
  $('#aiSave').onclick = () => {
    const kept = rows.filter(r => macrosOf(r).kcal > 0 || r.grammes > 0);
    if (!kept.length) return toast('Ajoute au moins un aliment');
    const t = sumRows(kept);
    const items = kept.map(r => { const m = macrosOf(r); return { nom: r.nom.trim() || 'Aliment', grammes: r0(r.grammes), kcal: r0(m.kcal), p: r1(m.p), g: r1(m.g), l: r1(m.l) }; });
    const en = addEntry({ name: $('#aiName').value.trim() || 'Repas (photo)', ...t }, `📷 IA · ${r0(kept.reduce((a, r) => a + (+r.grammes || 0), 0))} g`, ctx.thumb);
    en.items = items; en.ai = { model: aiModel().id, confiance: res.confiance }; save();
    closeSheet();
  };
  render();
}
function perGram(it, grams) { const g = grams || 100; return { kcal: (it.kcal || 0) / g, p: (it.p || 0) / g, g: (it.g || 0) / g, l: (it.l || 0) / g }; }
function macrosOf(r) { const q = +r.grammes || 0; return { kcal: r.per.kcal * q, p: r.per.p * q, g: r.per.g * q, l: r.per.l * q }; }
function sumRows(rows) { return rows.reduce((a, r) => { const m = macrosOf(r); return { kcal: a.kcal + m.kcal, p: a.p + m.p, g: a.g + m.g, l: a.l + m.l }; }, { kcal: 0, p: 0, g: 0, l: 0 }); }

/* Photo « journal » sans analyse (pas de clé, ou en secours) */
function openPhotoJournal(thumb, noKey) {
  openSheet(`
    <h3>Photo du repas</h3>
    <img class="photo-preview" src="${thumb}" alt="">
    ${noKey ? `<p class="hint">💡 Pour l'analyse automatique des macros, ajoute ta clé Claude dans <a href="#settings" id="phGoAI">Réglages → Analyse photo (IA)</a>. En attendant, choisis un repas rapide ou entre les macros.</p>` : '<p class="hint">Choisis un repas rapide ou entre les macros.</p>'}
    <label>Repas rapide<select id="phPreset"><option value="">— aucun —</option>${S.presets.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
    <div class="grid2" style="margin-top:10px">
      <label class="span2">Nom<input id="phName" placeholder="ex. Assiette du midi"></label>
      <label>Kcal<input type="number" id="phK" inputmode="numeric"></label>
      <label>Protéines (g)<input type="number" id="phP" inputmode="decimal"></label>
      <label>Glucides (g)<input type="number" id="phG" inputmode="decimal"></label>
      <label>Lipides (g)<input type="number" id="phL" inputmode="decimal"></label>
    </div>
    <button class="btn block" id="phSave">Ajouter au journal</button>`);
  if (noKey) $('#phGoAI').onclick = e => { e.preventDefault(); closeSheet(); goAISettings(); };
  $('#phPreset').onchange = e => { const p = S.presets.find(x => x.id === e.target.value); if (p) fillPhoto(scaled(p, portion)); };
  $('#phSave').onclick = () => {
    const p = +$('#phP').value || 0, g = +$('#phG').value || 0, l = +$('#phL').value || 0;
    const kcal = +$('#phK').value || kcalOf(p, g, l);
    addEntry({ name: $('#phName').value.trim() || 'Repas (photo)', kcal, p, g, l }, '📷', thumb);
    closeSheet();
  };
}
function fillPhoto(x) { $('#phName').value = x.name; $('#phK').value = r0(x.kcal); $('#phP').value = r1(x.p); $('#phG').value = r1(x.g); $('#phL').value = r1(x.l); }

/* Détail d'une entrée photo dans le journal */
function openEntryPhoto(en) {
  openSheet(`<h3>${esc(en.name)}</h3><img class="photo-preview" src="${en.photo}" alt="">
    ${en.items?.length ? `<ul class="ing">${en.items.map(i => `<li><span class="q">${r0(i.grammes)} g</span><span class="n">${esc(i.nom)}<small>${fmt(i.kcal)} kcal · P ${r0(i.p)} · G ${r0(i.g)} · L ${r0(i.l)}</small></span></li>`).join('')}</ul>` : ''}
    <div class="macro-line"><span class="pill"><b>${fmt(en.kcal)}</b> kcal</span><span class="pill">P ${r0(en.p)} g</span><span class="pill">G ${r0(en.g)} g</span><span class="pill">L ${r0(en.l)} g</span></div>
    <button class="btn ghost block" data-close>Fermer</button>`);
}

/* Réglages : carte « Analyse photo (IA) » */
function renderAISettings() {
  const k = getApiKey(), u = aiUsage();
  $('#aiKeyStatus').innerHTML = k ? `✓ Clé enregistrée : <code>${esc(maskKey(k))}</code>` : 'Aucune clé enregistrée : les photos sont gardées sans analyse.';
  $('#aiKeyStatus').className = 'ai-status ' + (k ? 'ok' : '');
  $('#aiKeyInput').placeholder = k ? 'Nouvelle clé (remplace)' : 'sk-ant-…';
  $('#aiTestKey').disabled = !k; $('#aiDelKey').disabled = !k;
  $('#photoNoKey').hidden = !!k;
  $('#aiModel').innerHTML = AI_MODELS.map(m => `<option value="${m.id}" ${m.id === aiModel().id ? 'selected' : ''}>${esc(m.label)}</option>`).join('');
  $('#aiCost').textContent = `${aiModel().cost} (tarif Anthropic : ${String(aiModel().price[0]).replace('.', ',')} $ / ${String(aiModel().price[1]).replace('.', ',')} $ par million de tokens en entrée / sortie).`;
  const mois = parseKey(u.month + '-01').toLocaleDateString('fr-FR', { month: 'long' });
  $('#aiCount').innerHTML = `<b>${u.n}</b> analyse${u.n > 1 ? 's' : ''} en ${mois}${u.usd ? ` · ≈ ${u.usd < 0.01 ? '< 0,01' : u.usd.toFixed(2).replace('.', ',')} $` : ''}`;
}
function bindAISettings() {
  $('#aiKeyToggle').onclick = () => {
    const i = $('#aiKeyInput'), showIt = i.type === 'password';
    i.type = showIt ? 'text' : 'password'; $('#aiKeyToggle').textContent = showIt ? '🙈' : '👁';
    $('#aiKeyToggle').setAttribute('aria-label', showIt ? 'Masquer la clé' : 'Afficher la clé');
  };
  $('#aiKeyForm').onsubmit = e => {
    e.preventDefault();
    const v = $('#aiKeyInput').value.replace(/\s+/g, '');
    if (!v) return toast('Colle ta clé d\u2019abord');
    if (!v.startsWith('sk-ant-') && !confirm('Cette clé ne commence pas par « sk-ant- ». L\u2019enregistrer quand même ?')) return;
    setApiKey(v); $('#aiKeyInput').value = ''; $('#aiKeyInput').type = 'password'; $('#aiKeyToggle').textContent = '👁';
    renderAISettings(); toast('Clé enregistrée sur ce téléphone');
  };
  $('#aiTestKey').onclick = async () => {
    const k = getApiKey(); if (!k) return;
    const b = $('#aiTestKey'); b.disabled = true; b.textContent = 'Test…';
    $('#aiTestResult').hidden = true;
    try { await testApiKey(k); toast('✓ Clé valide, l\u2019analyse est prête'); $('#aiKeyStatus').innerHTML += ' · <b>testée ✓</b>'; }
    catch (e) { alertBox(e.message || String(e)); }
    finally { b.disabled = false; b.textContent = 'Tester la clé'; }
  };
  $('#aiDelKey').onclick = () => {
    if (!confirm('Supprimer la clé Claude de ce téléphone ?')) return;
    setApiKey(''); renderAISettings(); toast('Clé supprimée');
  };
  $('#aiModel').onchange = e => { (S.ai ||= {}).model = e.target.value; save(); renderAISettings(); };
}
function alertBox(msg) { const el = $('#aiTestResult'); el.textContent = msg; el.hidden = false; setTimeout(() => (el.hidden = true), 12000); }

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

/* ---------- 🧊 Frigo → recettes (Claude) ----------
 * Étape 1 : photos (1 à 3) + « j'ai aussi » → liste d'ingrédients modifiable.
 * Étape 2 : 2-3 recettes prise de masse avec UNIQUEMENT ces ingrédients + les basiques.
 * Même clé, même modèle, même appel (callClaude), même parsing (extractJSON) que l'analyse photo. */
const FRIGO_KEY = 'coachKillian.frigo'; // session en cours (sans les photos), hors export
const FRIGO_MAX_PHOTOS = 3;
const MEAL_TYPES = {
  repas: { label: 'Repas', e: '🍽️', prompt: 'repas principal (déjeuner ou dîner)', kcal: [700, 900], p: [35, 40] },
  'petit-dej': { label: 'Petit-déj', e: '🥞', prompt: 'petit-déjeuner', kcal: [550, 750], p: [25, 30] },
  collation: { label: 'Collation / shaker', e: '🥤', prompt: 'collation ou shaker (à boire ou à manger vite entre deux repas)', kcal: [500, 650], p: [25, 30] }
};
const FRIGO_DISLIKES = [
  'jamais de fruits secs, pruneaux, pois chiches, haricots blancs, raviolis en boîte ni flocons d\u2019avoine, SAUF si l\u2019un d\u2019eux figure explicitement dans la liste de ses ingrédients',
  'les œufs uniquement en omelette ou à la coque (jamais durs, au plat ni pochés avec le jaune visible)',
  'la patate douce seulement si elle est cachée dans une sauce ou un curry (mixée ou écrasée), jamais en morceaux visibles'
];
const FRIGO_BASICS = 'sel, poivre, huile (olive ou tournesol), épices courantes (paprika, curry, cumin, herbes de Provence, ail en poudre, piment), eau';
let FR = frigoLoad(), frPhotos = [], frRun = 0;
function frigoLoad() {
  try { const d = JSON.parse(localStorage.getItem(FRIGO_KEY) || 'null'); if (d && typeof d === 'object') return { type: MEAL_TYPES[d.type] ? d.type : 'repas', extra: String(d.extra || ''), ings: Array.isArray(d.ings) ? d.ings : null, remark: String(d.remark || ''), res: d.res || null, saved: d.saved || {} }; } catch { }
  return { type: 'repas', extra: '', ings: null, remark: '', res: null, saved: {} };
}
function frigoSave() { try { localStorage.setItem(FRIGO_KEY, JSON.stringify(FR)); } catch { } }
function remainingToday() {
  const t = totals(curDate), G = S.goals;
  return { kcal: Math.max(0, G.kcal - t.kcal), p: Math.max(0, G.p - t.p), g: Math.max(0, G.g - t.g), l: Math.max(0, G.l - t.l), eaten: t };
}
function frigoDetectPrompt(extra, nPhotos) {
  return `Tu es un assistant de cuisine français. ${nPhotos ? `Les ${nPhotos > 1 ? nPhotos + ' photos montrent' : 'photo montre'} ce que l'utilisateur a chez lui (frigo, placard, produits).` : 'L\u2019utilisateur n\u2019a pas envoyé de photo.'}
1. Liste chaque aliment ou produit alimentaire que tu identifies avec une certitude raisonnable (lis les étiquettes et emballages quand ils sont lisibles).
2. Estime la quantité disponible (ex. « 500 g », « 6 œufs », « 1 L », « 1 boîte de 400 g », « ½ paquet »).
3. Ignore ce qui n'est pas de la nourriture et ne devine pas ce qui est caché. Regroupe les doublons.
${extra ? `L'utilisateur précise qu'il a aussi : « ${extra} ». Ajoute ces éléments à la liste (avec la quantité qu'il donne).\n` : ''}
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour ni bloc de code, au format exact :
{"ingredients":[{"nom":"","quantite":""}],"remarque":""}
"nom" : en français, court (ex. « Blanc de poulet », « Riz basmati », « Yaourt grec »). "remarque" : une phrase courte sur ce qui était difficile à voir, ou "".`;
}
function frigoRecipePrompt(ings, type, rest) {
  const M = MEAL_TYPES[type] || MEAL_TYPES.repas, G = S.goals;
  return `Tu es un coach nutrition français spécialisé en prise de masse. L'utilisateur, Killian, est un ectomorphe de ${S.profile.startW} kg qui vise ${S.profile.goalW} kg (objectif : ${G.kcal} kcal et ${G.p} g de protéines par jour). Il cuisine simplement.

Ingrédients disponibles chez lui (quantités approximatives) :
${ings.map(i => `- ${i.nom}${i.qte ? ' : ' + i.qte : ''}`).join('\n')}

Ingrédients de base toujours disponibles : ${FRIGO_BASICS}.

Type de repas : ${M.prompt}.
Il lui reste pour la journée : ${r0(rest.kcal)} kcal, ${r0(rest.p)} g de protéines, ${r0(rest.g)} g de glucides, ${r0(rest.l)} g de lipides (objectif du jour moins ce qu'il a déjà mangé).

Propose 2 ou 3 recettes différentes, en français :
- avec UNIQUEMENT les ingrédients disponibles ci-dessus et les ingrédients de base, sans dépasser les quantités disponibles ;
- pour 1 portion : environ ${M.kcal[0]} à ${M.kcal[1]} kcal et au moins ${M.p[0]} à ${M.p[1]} g de protéines. Si ce qui lui reste aujourd'hui est nettement plus bas, vise plutôt ce reste, sans descendre sous ${M.p[0]} g de protéines si possible ;
- quantités en grammes CRUS pour 1 portion ; kcal et macros calculés avec des valeurs type table CIQUAL ;
- étapes numérotées courtes et simples, temps total réaliste.

Ses goûts, à respecter strictement :
${FRIGO_DISLIKES.map(d => '- ' + d).join(' ;\n')}.

Si les ingrédients ne permettent pas d'atteindre les protéines visées, dis-le dans "alerte_proteines" et donne dans "ajout_conseille" l'ajout le plus simple à acheter (ex. « 1 boîte de thon », « 200 g de fromage blanc »). "manquants" : pour chaque recette, les articles à acheter qui l'amélioreraient (vide si rien ne manque) ; la recette elle-même n'utilise que ce qui est disponible.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour ni bloc de code, au format exact :
{"recettes":[{"nom":"","emoji":"🍳","temps":"20 min","ingredients":[{"nom":"","grammes":0,"texte":""}],"etapes":[""],"kcal":0,"proteines":0,"glucides":0,"lipides":0,"manquants":[{"nom":"","quantite":""}],"conseil":""}],"alerte_proteines":"","ajout_conseille":""}
Les nombres sont des nombres JSON (pas de texte, pas d'unité). "grammes" = poids pour 1 portion ; mets 0 si ça ne se pèse pas (épices, sel) et indique alors la quantité dans "texte" (ex. « 1 pincée »). "texte" peut aussi préciser (ex. « 3 œufs »). "conseil" : une phrase courte (conservation, variante) ou "".`;
}
/* Appel générique : mêmes en-têtes, même gestion d'erreurs et de relance que l'analyse photo */
async function aiAskJSON(content, maxTokens = 3000) {
  const key = getApiKey();
  if (!key) throw new AIError('nokey', 'Ajoute d\u2019abord ta clé Claude dans Réglages → Analyse photo (IA).');
  const model = aiModel().id;
  const body = effort => { const b = { model, max_tokens: maxTokens, messages: [{ role: 'user', content }] }; if (effort) b.output_config = { effort: 'low' }; return b; };
  let data;
  try { data = await callClaude(body(true), key); }
  catch (e) {
    if (e.kind === 'request' && e.status === 400 && /effort|output_config/i.test(e.apiMsg || '')) data = await callClaude(body(false), key);
    else if (e.kind === 'busy' && /surchargé/.test(e.message)) { await new Promise(r => setTimeout(r, 1500)); data = await callClaude(body(true), key); }
    else throw e;
  }
  countAnalysis(data?.usage, model);
  const text = (data?.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
  if (!text && data?.stop_reason === 'refusal') throw new AIError('parse', 'Claude a refusé de répondre à cette demande.');
  if (data?.stop_reason === 'max_tokens' && !/\}\s*$/.test(text.replace(/```\s*$/, '').trim())) throw new AIError('parse', 'Réponse de Claude coupée (trop longue). Réessaie.', true);
  return extractJSON(text);
}
function normalizeIngredients(j) {
  const seen = new Set();
  const ings = (Array.isArray(j?.ingredients) ? j.ingredients : []).map(i => ({ nom: String(i?.nom || i?.name || '').trim().slice(0, 60), qte: String(i?.quantite ?? i?.qte ?? i?.quantity ?? '').trim().slice(0, 40) }))
    .filter(i => i.nom && !seen.has(shopNorm(i.nom)) && seen.add(shopNorm(i.nom)));
  return { ings, remark: String(j?.remarque || '').slice(0, 300) };
}
function normalizeRecipes(j) {
  const recs = (Array.isArray(j?.recettes) ? j.recettes : []).slice(0, 3).map(r => {
    const x = { nom: String(r?.nom || 'Recette').slice(0, 80), e: String(r?.emoji || '🍽️').slice(0, 4), temps: String(r?.temps || '').slice(0, 20),
      ing: (Array.isArray(r?.ingredients) ? r.ingredients : []).map(i => ({ nom: String(i?.nom || '').slice(0, 60), grammes: r0(num(i?.grammes)), texte: String(i?.texte || '').slice(0, 40) })).filter(i => i.nom),
      etapes: (Array.isArray(r?.etapes) ? r.etapes : []).map(s => String(s).replace(/^\s*\d+[.)]\s*/, '').slice(0, 400)).filter(Boolean),
      kcal: num(r?.kcal), p: num(r?.proteines ?? r?.['protéines']), g: num(r?.glucides), l: num(r?.lipides),
      manquants: (Array.isArray(r?.manquants) ? r.manquants : []).map(m => (typeof m === 'string' ? { nom: m, quantite: '' } : { nom: String(m?.nom || ''), quantite: String(m?.quantite || '') })).filter(m => m.nom.trim()),
      conseil: String(r?.conseil || '').slice(0, 300) };
    if (!x.kcal) x.kcal = kcalOf(x.p, x.g, x.l);
    x.kcal = r0(x.kcal); x.p = r1(x.p); x.g = r1(x.g); x.l = r1(x.l);
    return x;
  }).filter(r => r.ing.length && r.etapes.length);
  if (!recs.length) throw new AIError('parse', 'Claude n\u2019a pas proposé de recette exploitable. Réessaie ou ajoute des ingrédients.', true);
  return { recs, alerte: String(j?.alerte_proteines || '').slice(0, 300), ajout: String(j?.ajout_conseille || '').slice(0, 120) };
}

function renderFrigo() {
  const key = !!getApiKey();
  $('#frNoKey').hidden = key;
  $('#frPhotos').innerHTML = frPhotos.map((p, i) => `<div class="fr-ph"><img src="${p.thumb}" alt="Photo ${i + 1}"><button class="fr-del" data-frdel="${i}" aria-label="Retirer la photo">✕</button></div>`).join('');
  $('#frAddPhoto').textContent = frPhotos.length ? `📷 Ajouter une photo (${frPhotos.length}/${FRIGO_MAX_PHOTOS})` : '📷 Prendre / choisir des photos (1 à 3)';
  $('#frAddPhoto').classList.toggle('disabled', frPhotos.length >= FRIGO_MAX_PHOTOS);
  if ($('#frExtra').value !== FR.extra && document.activeElement !== $('#frExtra')) $('#frExtra').value = FR.extra;
  $$('#frType [data-ft]').forEach(b => b.classList.toggle('active', b.dataset.ft === FR.type));
  $('#frDetect').disabled = !key || (!frPhotos.length && !FR.extra.trim());
  // étape 1
  $('#frIngCard').hidden = !FR.ings;
  if (FR.ings) {
    $('#frIngCount').textContent = `${FR.ings.length} ingrédient${FR.ings.length > 1 ? 's' : ''}`;
    $('#frRemark').textContent = FR.remark; $('#frRemark').hidden = !FR.remark;
    $('#frIngList').innerHTML = FR.ings.length ? FR.ings.map((i, k) => `<li data-fri="${k}">
      <input class="fr-nom" data-f="nom" value="${esc(i.nom)}" aria-label="Ingrédient">
      <input class="fr-qte" data-f="qte" value="${esc(i.qte)}" placeholder="qté" aria-label="Quantité">
      <button class="del" data-frrm="${k}" aria-label="Retirer ${esc(i.nom)}">✕</button></li>`).join('') : '<li class="empty">Aucun ingrédient : ajoutes-en ci-dessous.</li>';
    $('#frRecipes').disabled = !key || !FR.ings.length;
    $('#frRecipes').textContent = `② Proposer des recettes · ${MEAL_TYPES[FR.type].label.toLowerCase()}`;
  }
  renderFrigoResults();
}
function renderFrigoResults() {
  const R = FR.res, box = $('#frResults');
  if (!R) { box.innerHTML = ''; return; }
  const M = MEAL_TYPES[R.type] || MEAL_TYPES.repas, isToday = curDate === todayKey();
  box.innerHTML = `${R.alerte ? `<div class="fr-alert" role="alert">⚠️ ${esc(R.alerte)}${R.ajout ? `<br><b>Le plus simple :</b> ${esc(R.ajout)}` : ''}</div>` : ''}` +
    R.recs.map((r, k) => {
      const lowP = r.p < M.p[0], saved = FR.saved?.[r.nom];
      return `<div class="card fr-rec" data-frrec="${k}">
      <h2>${esc(r.e)} ${esc(r.nom)}</h2>
      <p class="hint" style="margin:0 0 6px">${r.temps ? '⏱ ' + esc(r.temps) + ' · ' : ''}1 portion · ${esc(M.label)}</p>
      <div class="macro-line"><span class="pill"><b>${fmt(r.kcal)}</b> kcal</span><span class="pill">P ${r0(r.p)} g</span><span class="pill">G ${r0(r.g)} g</span><span class="pill">L ${r0(r.l)} g</span></div>
      ${lowP ? `<div class="fr-warn">⚠️ Seulement ${r0(r.p)} g de protéines (objectif ≥ ${M.p[0]} g)${R.ajout ? ` : ajoute ${esc(R.ajout)}.` : '.'}</div>` : ''}
      <h4>Ingrédients</h4>
      <ul class="ing">${r.ing.map(i => `<li><span class="q">${i.grammes ? `${i.grammes} g` : esc(i.texte || 'au goût')}</span><span class="n">${esc(i.nom)}${i.grammes && i.texte ? `<small>${esc(i.texte)}</small>` : ''}</span></li>`).join('')}</ul>
      <h4>Étapes</h4>
      <ol class="steps">${r.etapes.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${r.conseil ? `<p class="r-note">💡 ${esc(r.conseil)}</p>` : ''}
      ${r.manquants.length ? `<p class="r-keep">🛒 <b>Pour l\u2019améliorer :</b> ${r.manquants.map(m => esc(m.nom + (m.quantite ? ` (${m.quantite})` : ''))).join(', ')}</p>
        <button class="btn ghost block" data-frmiss="${k}">🛒 Ajouter les manquants à la liste de courses</button>` : ''}
      <button class="btn block mt8" data-fradd="${k}">＋ Ajouter ${isToday ? 'à aujourd\u2019hui' : 'au ' + esc(parseKey(curDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))}</button>
      <button class="btn ghost block mt8" data-frsave="${k}" ${saved ? 'disabled' : ''}>${saved ? '✓ Enregistrée dans mes recettes' : '💾 Enregistrer dans mes recettes'}</button>
    </div>`;
    }).join('') + `<button class="btn ghost block" id="frAgain">↻ Autres idées</button>`;
}
function frStatus(html) { $('#frStatus').innerHTML = html; }
function frLoading(msg, run) {
  frStatus(`<div class="card"><div class="ai-loading"><span class="spinner" aria-hidden="true"></span><span>${esc(msg)}</span></div>
    <button class="btn ghost block" id="frCancel">Annuler</button></div>`);
  $('#frCancel').onclick = () => { if (frRun === run) frRun++; frStatus(''); setFrBusy(false); };
}
function setFrBusy(b) { ['#frDetect', '#frRecipes'].forEach(s => { const el = $(s); if (el) el.dataset.busy = b ? '1' : ''; }); if (!b) renderFrigo(); else { $('#frDetect').disabled = true; if ($('#frRecipes')) $('#frRecipes').disabled = true; } }
function frError(e, retry) {
  const err = e instanceof AIError ? e : new AIError('other', 'Erreur inattendue : ' + (e?.message || e), true);
  const toSettings = ['auth', 'model', 'nokey'].includes(err.kind), toConsole = ['credit', 'auth'].includes(err.kind);
  frStatus(`<div class="card"><div class="ai-error" role="alert" style="margin-top:0">${esc(err.message)}</div>
    ${toConsole ? '<p class="hint"><a href="https://console.anthropic.com/" target="_blank" rel="noopener">Ouvrir console.anthropic.com ↗</a></p>' : ''}
    ${err.retry ? '<button class="btn block" id="frRetry">↻ Réessayer</button>' : ''}
    ${toSettings ? '<button class="btn ghost block mt8" id="frGoSettings">⚙ Ouvrir Réglages → Analyse photo</button>' : ''}</div>`);
  if (err.retry) $('#frRetry').onclick = retry;
  if (toSettings) $('#frGoSettings').onclick = goAISettings;
}
async function frigoDetect() {
  if (!getApiKey()) return renderFrigo();
  const run = ++frRun; setFrBusy(true);
  frLoading(`Claude regarde ${frPhotos.length > 1 ? 'tes photos' : frPhotos.length ? 'ta photo' : 'ta liste'} (5 à 20 s)…`, run);
  try {
    const content = frPhotos.map(p => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: p.big.split(',')[1] || '' } }));
    content.push({ type: 'text', text: frigoDetectPrompt(FR.extra.trim(), frPhotos.length) });
    const res = normalizeIngredients(await aiAskJSON(content, 2000));
    if (run !== frRun) return;
    FR.ings = res.ings; FR.remark = res.remark || (res.ings.length ? '' : 'Rien de reconnu : ajoute tes ingrédients à la main ou reprends une photo plus nette.');
    FR.res = null; frigoSave(); frStatus(''); setFrBusy(false);
    $('#frIngCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) { if (run !== frRun) return; console.warn('frigo', e); setFrBusy(false); frError(e, frigoDetect); }
}
async function frigoRecipes() {
  frigoReadIngs();
  const ings = (FR.ings || []).filter(i => i.nom.trim());
  if (!ings.length) return toast('Ajoute au moins un ingrédient');
  const run = ++frRun; setFrBusy(true);
  frLoading('Claude prépare 2-3 recettes avec ce que tu as (10 à 30 s)…', run);
  try {
    const type = FR.type, rest = remainingToday();
    const res = normalizeRecipes(await aiAskJSON([{ type: 'text', text: frigoRecipePrompt(ings, type, rest) }], 4000));
    if (run !== frRun) return;
    FR.res = { ...res, type, at: Date.now() }; FR.saved = {}; frigoSave(); frStatus(''); setFrBusy(false);
    $('#frResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) { if (run !== frRun) return; console.warn('frigo', e); setFrBusy(false); frError(e, frigoRecipes); }
}
function frigoReadIngs() {
  if (!FR.ings) return;
  $$('#frIngList li[data-fri]').forEach(li => { const k = +li.dataset.fri; if (FR.ings[k]) { FR.ings[k].nom = li.querySelector('[data-f=nom]').value.trim(); FR.ings[k].qte = li.querySelector('[data-f=qte]').value.trim(); } });
  FR.ings = FR.ings.filter(i => i.nom); frigoSave();
}
async function frigoAddPhotos(files) {
  const list = [...files].slice(0, FRIGO_MAX_PHOTOS - frPhotos.length);
  if (files.length > list.length) toast(`${FRIGO_MAX_PHOTOS} photos maximum`);
  for (const f of list) {
    try { const thumb = await resizeImage(f); let big; try { big = await resizeImage(f, 1024, 0.8); } catch { big = thumb; } frPhotos.push({ thumb, big }); }
    catch { toast('Image illisible'); }
  }
  renderFrigo();
}
function myRecipeFrom(r, type) {
  return { id: 'm-' + uid(), mine: true, cat: 'mine', type, name: r.nom, e: r.e, time: r.temps || '—', kcal: r.kcal, p: r.p, g: r.g, l: r.l,
    ing: r.ing.map(i => (i.grammes ? [i.grammes, 'g', i.nom, i.texte || undefined] : [null, i.texte || 'au goût', i.nom])),
    steps: r.etapes, note: r.conseil || '', missing: r.manquants, created: todayKey() };
}
function bindFrigo() {
  $('#frInput').onchange = e => { if (e.target.files.length) frigoAddPhotos(e.target.files); e.target.value = ''; };
  $('#frAddPhoto').addEventListener('click', e => { if (frPhotos.length >= FRIGO_MAX_PHOTOS) { e.preventDefault(); toast(`${FRIGO_MAX_PHOTOS} photos maximum : retires-en une`); } });
  $('#frPhotos').addEventListener('click', e => { const b = e.target.closest('[data-frdel]'); if (b) { frPhotos.splice(+b.dataset.frdel, 1); renderFrigo(); } });
  $('#frExtra').addEventListener('input', e => { FR.extra = e.target.value; frigoSave(); $('#frDetect').disabled = !getApiKey() || (!frPhotos.length && !FR.extra.trim()); });
  $('#frType').addEventListener('click', e => { const b = e.target.closest('[data-ft]'); if (b) { FR.type = b.dataset.ft; frigoSave(); renderFrigo(); } });
  $('#frGoKey').onclick = goAISettings;
  $('#frDetect').onclick = frigoDetect;
  $('#frRecipes').onclick = frigoRecipes;
  $('#frIngList').addEventListener('change', frigoReadIngs);
  $('#frIngList').addEventListener('click', e => { const b = e.target.closest('[data-frrm]'); if (b) { frigoReadIngs(); FR.ings.splice(+b.dataset.frrm, 1); frigoSave(); renderFrigo(); } });
  $('#frIngAdd').onsubmit = e => {
    e.preventDefault(); frigoReadIngs();
    const nom = $('#frIngName').value.trim(); if (!nom) return;
    (FR.ings ||= []).push({ nom, qte: $('#frIngQty').value.trim() }); $('#frIngName').value = ''; $('#frIngQty').value = '';
    frigoSave(); renderFrigo(); $('#frIngName').focus();
  };
  $('#frReset').onclick = () => { if (!confirm('Tout recommencer (photos, ingrédients et recettes) ?')) return; frRun++; frPhotos = []; FR = { type: FR.type, extra: '', ings: null, remark: '', res: null, saved: {} }; frigoSave(); frStatus(''); renderFrigo(); window.scrollTo(0, 0); };
  $('#frResults').addEventListener('click', e => {
    if (e.target.closest('#frAgain')) return frigoRecipes();
    const R = FR.res; if (!R) return;
    const add = e.target.closest('[data-fradd]'), sv = e.target.closest('[data-frsave]'), ms = e.target.closest('[data-frmiss]');
    if (add) { const r = R.recs[+add.dataset.fradd]; addEntry({ name: r.nom, kcal: r.kcal, p: r.p, g: r.g, l: r.l }, '1 portion · 🧊 Frigo'); }
    if (sv) {
      const r = R.recs[+sv.dataset.frsave];
      (S.myRecipes ||= []).push(myRecipeFrom(r, R.type)); save(); renderRecipes();
      (FR.saved ||= {})[r.nom] = true; frigoSave(); renderFrigoResults(); toast('💾 Enregistrée dans Recettes → Mes recettes');
    }
    if (ms) {
      const r = R.recs[+ms.dataset.frmiss]; let n = 0;
      for (const m of r.manquants) { const it = shopUpsert(m.nom.trim(), null, null); if (m.quantite && !it.qty) it.qty = m.quantite; n++; }
      shopSave(); renderShop(); ms.disabled = true; ms.textContent = `✓ ${n} article${n > 1 ? 's' : ''} ajouté${n > 1 ? 's' : ''} à la liste`;
      toast(`🛒 ${n} article${n > 1 ? 's' : ''} ajouté${n > 1 ? 's' : ''} à ta liste de courses`);
    }
  });
}

/* ---------- Bibliothèque d'exercices ----------
 * Photos (début / fin du mouvement) et muscles : free-exercise-db (yuhonas, Unlicense / domaine public),
 * https://github.com/yuhonas/free-exercise-db – images copiées dans exercises/<id>/0.jpg et 1.jpg.
 * Technique : traduite et résumée en français. */
const MUSCLES_FR = { chest: 'pectoraux', shoulders: 'épaules', triceps: 'triceps', biceps: 'biceps', lats: 'grand dorsal', 'middle back': 'milieu du dos',
  'lower back': 'lombaires', quadriceps: 'quadriceps', hamstrings: 'ischio-jambiers', glutes: 'fessiers', calves: 'mollets', abdominals: 'abdos',
  forearms: 'avant-bras', traps: 'trapèzes' };
const EX_GROUPS = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];
const EXERCISES = [
  { id: 'Dumbbell_Bench_Press', name: 'Développé couché haltères', grp: 'Pectoraux', prim: ['chest'], sec: ['shoulders', 'triceps'],
    tech: ['Allongé sur le banc, pieds bien à plat, haltères posés sur les cuisses puis amenés au-dessus de la poitrine, paumes vers les pieds.',
      'Serre les omoplates et garde un léger creux dans le bas du dos.',
      'Descends lentement les haltères sur les côtés de la poitrine, coudes à environ 45° du corps.',
      'Pousse vers le haut en soufflant jusqu\u2019à tendre les bras, sans cogner les haltères.'] },
  { id: 'Barbell_Bench_Press_-_Medium_Grip', name: 'Développé couché barre', grp: 'Pectoraux', prim: ['chest'], sec: ['shoulders', 'triceps'],
    tech: ['Allongé, yeux sous la barre, mains un peu plus larges que les épaules.', 'Décroche la barre bras tendus, au-dessus de la poitrine, omoplates serrées.',
      'Descends en inspirant jusqu\u2019à toucher le milieu de la poitrine.', 'Pousse en soufflant jusqu\u2019à bras tendus. Avec une charge lourde, fais-toi parer.'] },
  { id: 'Close-Grip_Barbell_Bench_Press', name: 'Développé couché prise serrée', grp: 'Bras', prim: ['triceps'], sec: ['chest', 'shoulders'],
    tech: ['Comme le développé couché, mais mains écartées de la largeur des épaules.', 'Garde les coudes près du corps pendant toute la descente.',
      'Descends la barre vers le bas de la poitrine.', 'Remonte en poussant avec les triceps jusqu\u2019à bras tendus.'] },
  { id: 'Incline_Dumbbell_Press', name: 'Développé incliné haltères', grp: 'Pectoraux', prim: ['chest'], sec: ['shoulders', 'triceps'],
    tech: ['Banc incliné à 30-45°, haltères au-dessus du haut de la poitrine, paumes vers l\u2019avant.', 'Descends lentement jusqu\u2019à sentir l\u2019étirement des pectoraux.',
      'Pousse en soufflant et rapproche les haltères en haut, sans les cogner.'] },
  { id: 'Bent_Over_Barbell_Row', name: 'Rowing barre buste penché', grp: 'Dos', prim: ['middle back'], sec: ['biceps', 'lats', 'shoulders'],
    tech: ['Barre en main, paumes vers toi, genoux légèrement fléchis.', 'Penche le buste vers l\u2019avant presque à l\u2019horizontale, dos bien droit, regard devant.',
      'Tire la barre vers le bas du ventre en serrant les omoplates, coudes près du corps.', 'Marque une pause en haut, puis redescends lentement bras tendus.'] },
  { id: 'One-Arm_Dumbbell_Row', name: 'Rowing haltère un bras', grp: 'Dos', prim: ['middle back'], sec: ['biceps', 'lats', 'shoulders'],
    tech: ['Main et genou du même côté sur le banc, dos plat parallèle au sol.', 'Haltère dans l\u2019autre main, bras tendu vers le sol.',
      'Tire l\u2019haltère vers la hanche en gardant le coude près du corps.', 'Serre le dos en haut, puis redescends lentement. Fais toutes les reps d\u2019un côté, puis change.'] },
  { id: 'Pullups', name: 'Tractions prise large', grp: 'Dos', prim: ['lats'], sec: ['biceps', 'middle back'],
    tech: ['Mains en pronation (paumes vers l\u2019avant), plus larges que les épaules.', 'Bras tendus, sors la poitrine et penche-toi légèrement en arrière.',
      'Tire en ramenant les coudes vers le bas et l\u2019arrière jusqu\u2019à ce que la barre arrive au haut de la poitrine.', 'Pause d\u2019une seconde, puis redescends lentement jusqu\u2019à bras tendus.'] },
  { id: 'V-Bar_Pullup', name: 'Tractions prise neutre', grp: 'Dos', prim: ['lats'], sec: ['biceps', 'middle back', 'shoulders'],
    tech: ['Paumes face à face, sur des poignées parallèles ou une poignée en V posée sur la barre.', 'Suspends-toi, sors la poitrine et penche-toi légèrement en arrière.',
      'Tire avec le dos jusqu\u2019à ce que la poitrine arrive presque aux poignées.', 'Redescends lentement jusqu\u2019à bras tendus.'] },
  { id: 'Dips_-_Chest_Version', name: 'Dips buste penché', grp: 'Pectoraux', prim: ['chest'], sec: ['shoulders', 'triceps'],
    tech: ['Aux barres parallèles, monte en appui, bras tendus.', 'Descends lentement en penchant le buste d\u2019environ 30° vers l\u2019avant, coudes légèrement écartés.',
      'Arrête-toi quand tu sens l\u2019étirement des pectoraux (épaules à hauteur des coudes environ).', 'Remonte en poussant et serre les pectoraux en haut.'] },
  { id: 'Barbell_Deadlift', name: 'Soulevé de terre', grp: 'Dos', prim: ['lower back'], sec: ['glutes', 'hamstrings', 'quadriceps', 'middle back', 'lats', 'traps', 'forearms', 'calves'],
    tech: ['Pieds largeur de hanches, barre au-dessus du milieu des pieds, tibias presque contre la barre.', 'Fléchis les genoux, attrape la barre juste à l\u2019extérieur des jambes, dos plat, poitrine sortie.',
      'Pousse dans le sol avec les jambes et monte en gardant la barre collée aux jambes jusqu\u2019à être droit.', 'Redescends en contrôle en poussant les fesses en arrière. Ne jamais arrondir le dos.'] },
  { id: 'Romanian_Deadlift', name: 'Soulevé de terre roumain', grp: 'Jambes', prim: ['hamstrings'], sec: ['glutes', 'lower back', 'calves'],
    tech: ['Debout, barre en main, genoux légèrement fléchis et bloqués dans cette position.', 'Pousse les fesses en arrière et descends la barre le long des cuisses, dos bien droit.',
      'Descends jusqu\u2019à sentir l\u2019étirement derrière les cuisses (sous les genoux environ).', 'Remonte en poussant les hanches vers l\u2019avant et en serrant les fessiers.'] },
  { id: 'Barbell_Squat', name: 'Squat barre', grp: 'Jambes', prim: ['quadriceps'], sec: ['glutes', 'hamstrings', 'lower back', 'calves'],
    tech: ['Dans un rack, barre sur le haut du dos (pas sur la nuque), pieds largeur d\u2019épaules, pointes légèrement ouvertes.', 'Garde le dos droit et la tête haute.',
      'Descends en fléchissant genoux et hanches jusqu\u2019à ce que les cuisses soient au moins parallèles au sol, genoux dans l\u2019axe des pieds.', 'Remonte en poussant dans les talons.'] },
  { id: 'Split_Squat_with_Dumbbells', name: 'Squat bulgare', grp: 'Jambes', prim: ['quadriceps'], sec: ['glutes', 'hamstrings'],
    tech: ['Pied arrière posé sur un banc, pied avant un grand pas devant, un haltère dans chaque main.', 'Descends en fléchissant le genou avant, buste droit, genou avant dans l\u2019axe du pied.',
      'Descends jusqu\u2019à ce que la cuisse avant soit parallèle au sol.', 'Remonte en poussant dans le talon avant. Fais toutes les reps d\u2019une jambe, puis change.'] },
  { id: 'Goblet_Squat', name: 'Goblet squat', grp: 'Jambes', prim: ['quadriceps'], sec: ['glutes', 'hamstrings', 'calves', 'shoulders'],
    tech: ['Tiens un haltère verticalement contre la poitrine, mains sous la tête de l\u2019haltère.', 'Pieds un peu plus larges que les épaules, pointes légèrement ouvertes.',
      'Descends en poussant les genoux vers l\u2019extérieur, coudes entre les genoux, dos droit.', 'Remonte en poussant dans les talons.'] },
  { id: 'Barbell_Hip_Thrust', name: 'Hip thrust barre', grp: 'Jambes', prim: ['glutes'], sec: ['hamstrings', 'calves'],
    tech: ['Haut du dos appuyé contre un banc, barre sur les hanches (mets une mousse pour le confort).', 'Pieds à plat, largeur des hanches, genoux fléchis.',
      'Pousse dans les talons pour monter les hanches jusqu\u2019à ce que le corps soit aligné des épaules aux genoux.', 'Serre fort les fessiers une seconde en haut, puis redescends lentement.'] },
  { id: 'Standing_Military_Press', name: 'Développé militaire barre', grp: 'Épaules', prim: ['shoulders'], sec: ['triceps'],
    tech: ['Debout, barre sur le haut de la poitrine, mains un peu plus larges que les épaules.', 'Gaine les abdos et serre les fessiers pour ne pas cambrer.',
      'Pousse la barre au-dessus de la tête jusqu\u2019à bras tendus, en reculant un peu la tête au passage.', 'Redescends lentement jusqu\u2019aux clavicules.'] },
  { id: 'Dumbbell_Shoulder_Press', name: 'Développé épaules haltères assis', grp: 'Épaules', prim: ['shoulders'], sec: ['triceps'],
    tech: ['Assis sur un banc avec dossier, haltères à hauteur des épaules, paumes vers l\u2019avant.', 'Pousse les haltères vers le haut en soufflant jusqu\u2019à ce qu\u2019ils se rejoignent presque.',
      'Redescends lentement à hauteur des épaules.'] },
  { id: 'Lying_Triceps_Press', name: 'Barre au front', grp: 'Bras', prim: ['triceps'], sec: [],
    tech: ['Allongé sur un banc, barre (EZ de préférence) tenue bras tendus au-dessus de la poitrine, prise moyenne.', 'Coudes serrés et fixes : seuls les avant-bras bougent.',
      'Descends lentement la barre vers le front en fléchissant les coudes.', 'Remonte en contractant les triceps.'] },
  { id: 'Dumbbell_Bicep_Curl', name: 'Curl haltères', grp: 'Bras', prim: ['biceps'], sec: ['forearms'],
    tech: ['Debout, un haltère dans chaque main, bras le long du corps, paumes vers l\u2019avant.', 'Coudes collés au corps, monte les haltères en contractant les biceps.',
      'Serre une seconde en haut, puis redescends lentement. Ne te balance pas.'] },
  { id: 'Hammer_Curls', name: 'Curl marteau', grp: 'Bras', prim: ['biceps'], sec: ['forearms'],
    tech: ['Debout, haltères le long du corps, paumes face à face (prise marteau).', 'Coudes fixes, monte les haltères vers les épaules sans tourner les poignets.',
      'Redescends lentement.'] },
  { id: 'Side_Lateral_Raise', name: 'Élévations latérales', grp: 'Épaules', prim: ['shoulders'], sec: [],
    tech: ['Debout, haltères le long du corps, buste très légèrement penché vers l\u2019avant.', 'Coudes légèrement fléchis, monte les bras sur les côtés jusqu\u2019à hauteur des épaules.',
      'Pause en haut, puis redescends lentement. Prends léger : ce sont les épaules qui travaillent, pas l\u2019élan.'] },
  { id: 'Hanging_Leg_Raise', name: 'Relevé de jambes suspendu', grp: 'Abdos', prim: ['abdominals'], sec: [],
    tech: ['Suspendu à une barre, bras tendus, jambes droites.', 'Monte les jambes en enroulant le bassin jusqu\u2019à former un angle de 90° avec le buste.',
      'Tiens une seconde, puis redescends lentement sans te balancer. Plus facile : genoux pliés.'] },
  { id: 'Plank', name: 'Gainage (planche)', grp: 'Abdos', prim: ['abdominals'], sec: [],
    tech: ['Appui sur les avant-bras et la pointe des pieds, coudes sous les épaules.', 'Corps bien droit de la tête aux talons : ni fesses en l\u2019air, ni dos creusé.',
      'Serre les abdos et les fessiers et respire normalement. Tiens le plus longtemps possible.'] }
];
const exById = id => EXERCISES.find(e => e.id === id);
const exByName = name => EXERCISES.find(e => e.name === name);
const exImg = (e, i) => `exercises/${e.id}/${i}.jpg`;
const musclesFr = l => l.map(m => MUSCLES_FR[m] || m);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function exMuscleLine(e) {
  return `🎯 <b>${esc(cap(musclesFr(e.prim).join(', ')))}</b>${e.sec.length ? ` <span class="muted">· aussi ${esc(musclesFr(e.sec).join(', '))}</span>` : ''}`;
}
function exInProgram(e) { return Object.entries(WORKOUTS).filter(([, l]) => l.some(x => x.name === e.name)).map(([k]) => k); }
function openExercise(id, img = 0) {
  const e = exById(id); if (!e) return;
  const prog = exInProgram(e);
  openSheet(`<h3>${esc(e.name)}</h3>
    <p class="hint">${esc(e.grp)}${prog.length ? ` · dans ta séance ${prog.join(' et ')}` : ''}</p>
    <div class="exv-seg seg" id="exvSeg"><button data-exi="0" class="${img === 0 ? 'active' : ''}">Début</button><button data-exi="1" class="${img === 1 ? 'active' : ''}">Fin</button></div>
    <img class="exv-img" id="exvImg" src="${exImg(e, img)}" alt="${esc(e.name)} – ${img ? 'fin' : 'début'} du mouvement">
    <p class="ex-mus">${exMuscleLine(e)}</p>
    <h4>Technique</h4>
    <ol class="steps">${e.tech.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <p class="hint">Photos : free-exercise-db (domaine public). Touche la photo pour voir l\u2019autre position.</p>
    <button class="btn ghost block r-close" data-close>Fermer</button>`);
  let cur = img;
  const set = i => { cur = i; $('#exvImg').src = exImg(e, i); $('#exvImg').alt = `${e.name} – ${i ? 'fin' : 'début'} du mouvement`; $$('#exvSeg button').forEach(b => b.classList.toggle('active', +b.dataset.exi === i)); };
  $('#exvSeg').onclick = ev => { const b = ev.target.closest('[data-exi]'); if (b) set(+b.dataset.exi); };
  $('#exvImg').onclick = () => set(1 - cur);
}
let exLibGroup = 'all';
function renderExLib() {
  $$('#exLibChips .chip').forEach(c => c.classList.toggle('active', c.dataset.g === exLibGroup));
  const list = EXERCISES.filter(e => exLibGroup === 'all' || e.grp === exLibGroup);
  $('#exLib').innerHTML = list.map(e => {
    const prog = exInProgram(e);
    return `<li data-exo="${e.id}"><img class="ex-thumb" src="${exImg(e, 0)}" alt="" loading="lazy">
      <div class="e-main"><div class="e-name">${esc(e.name)}</div><div class="e-sub">${esc(cap(musclesFr(e.prim).join(', ')))}${e.sec.length ? ' · ' + esc(musclesFr(e.sec).slice(0, 3).join(', ')) : ''}</div></div>
      ${prog.length ? `<span class="badge">${prog.join(' ')}</span>` : ''}</li>`;
  }).join('');
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
    const meta = def[i] || { target: '' }, lp = lastPerf(ex.name), exB = exByName(ex.name);
    return `<div class="ex" data-ex="${i}">
      <div class="ex-head"><span class="ex-name">${esc(ex.name)}</span><span class="ex-target">${ex.sets.length}×${esc(meta.target)}</span></div>
      ${exB ? `<div class="ex-media">${[0, 1].map(k => `<button class="ex-ph" data-exphoto="${exB.id}" data-i="${k}" aria-label="${k ? 'Fin' : 'Début'} du mouvement, agrandir"><img src="${exImg(exB, k)}" alt="" loading="lazy"><span>${k ? 'Fin' : 'Début'}</span></button>`).join('')}</div>
      <p class="ex-mus">${exMuscleLine(exB)}</p>
      <details class="ex-tech"><summary>Technique</summary><ol class="steps">${exB.tech.map(t => `<li>${esc(t)}</li>`).join('')}</ol></details>` : ''}
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
  renderPresets(); renderAISettings();
}
function exportData() {
  const blob = new Blob([JSON.stringify({ ...S, courses: C }, null, 2)], { type: 'application/json' });
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
      const { courses, ...rest } = d;
      S = migrate(rest); save();
      const c = shopSanitize(courses); if (c) { C = c; shopSave(); }
      renderAll(); toast('Sauvegarde importée');
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
  $('#datenav').style.visibility = (view === 'today' || view === 'add' || view === 'train' || (view === 'recipes' && recipeMode !== 'courses')) ? 'visible' : 'hidden';
  if (view === 'train') renderTrain();
  if (view === 'progress') renderProgress();
  if (view === 'settings') renderSettings();
  if (view === 'add') renderPresets();
  if (view === 'recipes') { if (recipeMode === 'courses') renderShop(); else if (recipeMode === 'frigo') renderFrigo(); else renderRecipes(); }
  window.scrollTo(0, 0);
  history.replaceState(null, '', '#' + (view === 'recipes' && recipeMode !== 'recipes' ? recipeMode : view));
}
function renderAll() { renderToday(); renderPresets(); renderBase(); renderRecipes(); renderShop(); renderFrigo(); renderTrain(); renderExLib(); renderProgress(); renderSettings(); }

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
    if (ph) { const en = entries().find(x => x.id === ph.dataset.photo); if (en) openEntryPhoto(en); }
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
  $('#barcodeForm').onsubmit = e => { e.preventDefault(); stopDictation(); lookupBarcode($('#barcodeInput').value); };
  $('#barcodeMic').onclick = () => startDictation($('#barcodeInput'), $('#barcodeVoiceStatus'), $('#barcodeMic'), code => lookupBarcode(code));
  micHint($('#barcodeVoiceStatus'));
  $('#scanBtn').onclick = startScan;
  $('#baseFilter').addEventListener('input', renderBase);
  $('#baseList').addEventListener('click', e => { const li = e.target.closest('[data-base]'); if (li) openGramsSheet(BASE_FOODS.find(f => f.name === li.dataset.base), 'Aliment de base'); });
  $('#manualBtn').onclick = openManual;
  $('#photoInput').onchange = e => { onPhoto(e.target.files[0]); e.target.value = ''; };
  $('#photoGoAI').onclick = e => { e.preventDefault(); goAISettings(); };
  bindAISettings();
  bindShop();
  bindFrigo();

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
  $('#sessionExercises').addEventListener('click', e => { const b = e.target.closest('[data-exphoto]'); if (b) openExercise(b.dataset.exphoto, +b.dataset.i); });
  $('#exLib').addEventListener('click', e => { const li = e.target.closest('[data-exo]'); if (li) openExercise(li.dataset.exo); });
  $('#exLibChips').addEventListener('click', e => { const c = e.target.closest('[data-g]'); if (c) { exLibGroup = c.dataset.g; renderExLib(); } });
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
    if (!confirm('Effacer TOUTES les données (repas, séances, poids, liste de courses) ? Pense à exporter avant.')) return;
    localStorage.removeItem(STORE_KEY); localStorage.removeItem(SHOP_KEY); S = freshState(); save(); C = shopFresh(); shopSave(); renderAll(); show('today'); toast('Données effacées');
  };

  $('#sheetBackdrop').addEventListener('click', e => { if (e.target.id === 'sheetBackdrop') closeSheet(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#sheetBackdrop').hidden) closeSheet(); });
}

/* ---------- Démarrage ---------- */
bind();
renderAll();
{ const h = (location.hash || '').slice(1); if (h === 'courses' || h === 'frigo') { recipeMode = h; setRecipeMode(h); } show(h === 'courses' || h === 'frigo' ? 'recipes' : ['today', 'add', 'recipes', 'train', 'progress', 'settings'].includes(h) ? h : 'today'); }
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW', e)));
}
window.CoachKillian = { analyzePhoto, buildAIRequest, extractJSON, normalizeAI, get state() { return S; }, get courses() { return C; }, get frigo() { return FR; }, frigoDetectPrompt, frigoRecipePrompt, normalizeRecipes, parseSpokenDigits, eanValid, getBarcodeDetector, loadBarcodePolyfill }; // pour le débogage / les tests
