// Fichas de producto: descripción, familia y notas olfativas.
// Las notas salen de las fichas de tiendas y bases de perfumes; los textos son propios.
window.INFO = {
  'tubitos': {
    family: 'Árabes en formato chico', size: '10 ml', gender: 'Para todos',
    desc: 'Tus perfumes árabes favoritos en tubitos de vidrio con atomizador. Ideales para probar un aroma antes de comprar el frasco grande, para llevar en la cartera o para regalar. Elegí el aroma y lo preparamos al momento.',
    ideal: ['Para probar', 'Para la cartera', 'Para regalar'],
  },
  'combo-benetton-kos': {
    family: 'Amaderado especiado + Aromático acuático', size: 'Tribe Elixir 90 ml + King of Seduction Absolute 100 ml', gender: 'Masculino',
    desc: 'Dos perfumes masculinos de marca a un precio que no vas a encontrar en otro lado. Tribe Elixir es cálido y envolvente, con pimienta, vainilla y cuero: para la noche. King of Seduction Absolute es fresco, con pomelo y un fondo marino y de cuero: para el día. Uno para cada momento.',
    notes: { top: ['Pimienta negra', 'Pomelo', 'Lavanda'], heart: ['Bálsamo de abeto', 'Haba tonka', 'Acorde marino', 'Cardamomo'], base: ['Vainilla', 'Cuero', 'Musgo de roble', 'Vetiver'] },
    ideal: ['Día y noche', 'Para regalar'],
  },
  'erba-pura': {
    brand: 'Xerjoff', family: 'Ámbar frutal', size: '100 ml · Eau de Parfum', gender: 'Unisex',
    desc: 'Uno de los perfumes de nicho más buscados. Abre con cítricos de Sicilia muy jugosos, sigue con un corazón de frutas maduras y se asienta en un fondo de almizcle blanco, vainilla y ámbar que dura todo el día y deja estela.',
    notes: { top: ['Naranja de Sicilia', 'Limón', 'Bergamota'], heart: ['Acorde de frutas'], base: ['Almizcle blanco', 'Vainilla de Madagascar', 'Ámbar'] },
    ideal: ['Larga duración', 'Todo el año', 'Mucha estela'],
  },
  'erba-gold': {
    brand: 'Xerjoff', family: 'Cítrico especiado', size: '100 ml · Eau de Parfum', gender: 'Unisex',
    desc: 'La versión dorada de Erba Pura. Arranca con cítricos y jengibre, pasa a un corazón de manzana verde, melón y pera con especias suaves como canela y cardamomo, y termina en almizcle, ámbar y vainilla. Fresco y cálido a la vez.',
    notes: { top: ['Limón de Amalfi', 'Naranja', 'Bergamota', 'Jengibre'], heart: ['Manzana verde', 'Melón', 'Pera', 'Canela', 'Cardamomo'], base: ['Almizcle blanco', 'Ámbar', 'Vainilla', 'Maderas'] },
    ideal: ['Primavera y verano', 'Unisex'],
  },
  'mini-perfumes': {
    family: 'Varios', size: 'Formato mini', gender: 'Para todos',
    desc: 'Versiones chiquitas de los perfumes más pedidos, a un precio súper accesible. Perfectas para tener siempre a mano, para viajar o para armar un regalo. Consultanos qué aromas hay disponibles hoy.',
    ideal: ['Para viajar', 'Para regalar'],
  },
  'splash-arabe': {
    brand: 'Lattafa y otros', family: 'Dulce frutal', size: 'Body splash', gender: 'Femenino',
    desc: 'Body splash con los aromas de los perfumes árabes más queridos, como Yara y Eclaire. Más livianos que un perfume, para ponerte después de bañarte y retocar durante el día. Dejan la piel con un aroma dulce y suave.',
    ideal: ['Uso diario', 'Después del baño'],
  },
  'tubbees': {
    brand: 'Tubbees', family: 'Gourmand frutal', size: '90 ml · Body mist', gender: 'Femenino',
    desc: 'Body mists con aromas golosos y divertidos, en un envase que parece un vasito de helado. Hay 6 versiones, entre ellas Berry Berry Explosion (frutos rojos), Blueberry Sorbet (arándano y cítricos), Candy Apple (manzana acaramelada), Lemon-a-licious, Golden Praline Bliss (praliné y cacao) y Tira Miss You (café con leche y almendra).',
    ideal: ['Uso diario', 'Para las más chicas', 'Para regalar'],
  },
  'lucy-anderson': {
    brand: 'Lucy Anderson', family: 'Varios', size: 'Perfumes y sets', gender: 'Femenino',
    desc: 'Fragancias de la línea Lucy Anderson: aromas modernos a muy buen precio, en perfume solo o en sets con body splash, listos para regalar. Hay varias versiones, consultanos cuáles tenemos hoy.',
    ideal: ['Para regalar', 'Precio accesible'],
  },
  'tintura-cherry': {
    brand: 'Fidelité', family: 'Coloración', size: 'Tono 222 Cherry', gender: 'Para todos',
    desc: 'Tintura permanente Fidelité en el tono 222 Cherry, un rojo cereza intenso que está muy de moda. Viene con el agua oxigenada incluida, así que tenés todo para teñirte en casa. Si buscás otro tono, preguntanos: tenemos toda la carta de colores.',
    ideal: ['Uso en casa', 'Agua oxigenada incluida'],
  },
  'yara': {
    brand: 'Lattafa', family: 'Floral gourmand', size: '100 ml · Eau de Parfum', gender: 'Femenino',
    desc: 'El perfume árabe más pedido. Abre con orquídea, heliotropo y mandarina, tiene un corazón cremoso de frutas tropicales con un toque goloso y un fondo suave de vainilla, almizcle y sándalo. Dulce sin empalagar y con muy buena duración.',
    notes: { top: ['Orquídea', 'Heliotropo', 'Mandarina'], heart: ['Acorde gourmand', 'Frutas tropicales'], base: ['Vainilla', 'Almizcle', 'Sándalo'] },
    ideal: ['Todo el año', 'Día y noche', 'Larga duración'],
  },
  'yara-candy': {
    brand: 'Lattafa', family: 'Floral frutal gourmand', size: '100 ml · Eau de Parfum', gender: 'Femenino',
    desc: 'La versión más golosa y divertida de Yara. Arranca jugosa con grosella negra y mandarina, sigue con un caramelo de frutilla efervescente y gardenia, y termina en vainilla, almizcle, ámbar y sándalo.',
    notes: { top: ['Grosella negra', 'Mandarina verde'], heart: ['Caramelo de frutilla', 'Gardenia'], base: ['Vainilla', 'Almizcle', 'Ámbar', 'Sándalo'] },
    ideal: ['Primavera y verano', 'De día'],
  },
  'asad': {
    brand: 'Lattafa', family: 'Oriental ambarado', size: '100 ml · Eau de Parfum', gender: 'Masculino',
    desc: 'Intenso, especiado y con mucha presencia. Pimienta negra, tabaco y un toque de ananá en la salida; café, pachulí e iris en el corazón; y un fondo cálido de vainilla, ámbar y maderas. Ideal para las noches y el invierno.',
    notes: { top: ['Pimienta negra', 'Tabaco', 'Ananá'], heart: ['Café', 'Pachulí', 'Iris'], base: ['Vainilla', 'Ámbar', 'Maderas secas', 'Benjuí', 'Ládano'] },
    ideal: ['Noche', 'Otoño e invierno', 'Mucha estela'],
  },
  'eclaire': {
    brand: 'Lattafa', family: 'Gourmand', size: '100 ml · Eau de Parfum', gender: 'Femenino',
    desc: 'Huele a pastelería francesa: caramelo, leche y azúcar en la salida, miel y flores blancas en el corazón, y un fondo de vainilla, praliné y almizcle. Cálido, cremoso y muy adictivo.',
    notes: { top: ['Caramelo', 'Leche', 'Azúcar'], heart: ['Miel', 'Flores blancas'], base: ['Vainilla', 'Praliné', 'Almizcle'] },
    ideal: ['Otoño e invierno', 'Para las golosas'],
  },
  'club-de-nuit': {
    brand: 'Armaf', family: 'Chipre frutal', size: '105 ml · Eau de Toilette', gender: 'Masculino',
    desc: 'Un clásico que no falla. Abre fresco y frutal con limón, ananá, bergamota y manzana; tiene un corazón ahumado de abedul con rosa y jazmín, y un fondo de almizcle, ámbar gris, pachulí y vainilla. Elegante y muy duradero.',
    notes: { top: ['Limón', 'Ananá', 'Bergamota', 'Grosella negra', 'Manzana'], heart: ['Abedul', 'Jazmín', 'Rosa'], base: ['Almizcle', 'Ámbar gris', 'Pachulí', 'Vainilla'] },
    ideal: ['Todo el año', 'Larga duración', 'Oficina y salidas'],
  },
  'bharara-rose': {
    brand: 'Bharara', family: 'Floral frutal', size: '100 ml · Eau de Parfum', gender: 'Femenino',
    desc: 'Femenino y romántico. Una salida fresca de bergamota y pomelo da paso a un corazón de rosa, jazmín y gardenia con frutas como pera y lichi, sobre un fondo cálido y cremoso de vainilla, sándalo y ámbar.',
    notes: { top: ['Bergamota', 'Pomelo', 'Geranio'], heart: ['Rosa', 'Jazmín', 'Gardenia', 'Pera', 'Lichi'], base: ['Vainilla', 'Sándalo', 'Ámbar', 'Almizcle'] },
    ideal: ['De día', 'Primavera'],
  },
  'sugar-kiss': {
    brand: 'Shakira', family: 'Dulce frutal', size: 'Eau de Toilette', gender: 'Femenino',
    desc: 'Una fragancia de Shakira dulce, frutal y divertida, pensada para usar todos los días. Liviana y fácil de llevar, ideal para las más jóvenes. Vení a probarla al local.',
    ideal: ['Uso diario', 'Para regalar'],
  },
  'cher': {
    brand: 'Cher', family: 'Chipre floral', size: '100 ml · Eau de Parfum', gender: 'Femenino',
    desc: 'Uno de los perfumes argentinos más queridos. Abre con gardenia, naranja y mandarina, tiene un corazón de miel, jazmín y azahar, y un fondo cálido de pachulí, cera de abeja y caramelo. Femenino, luminoso y con un toque dulce.',
    notes: { top: ['Gardenia', 'Naranja', 'Mandarina'], heart: ['Miel', 'Jazmín', 'Azahar'], base: ['Pachulí', 'Cera de abeja', 'Caramelo'] },
    ideal: ['Todo el año', 'De día'],
  },
  'ciel': {
    brand: 'Ciel', family: 'Varios', size: 'Eau de Parfum', gender: 'Femenino',
    desc: 'La clásica línea argentina Ciel, con versiones para cada personalidad: Clásico, Shine, Magic, Noir, Crystal, Nuit y la nueva Sweet Kiss. Frascos icónicos y aromas que acompañan generaciones. Preguntanos por tu favorita.',
    ideal: ['Para regalar', 'Clásico argentino'],
  },
  'love-spell': {
    brand: "Victoria's Secret", family: 'Floral frutal', size: '250 ml · Fragrance mist', gender: 'Femenino',
    desc: 'La bruma corporal más famosa de Victoria\'s Secret: flor de cerezo y durazno, fresca y dulce a la vez. Para usar en todo el cuerpo y en el pelo. También tenemos otras versiones como Coconut Passion.',
    notes: { top: ['Flor de cerezo'], heart: ['Durazno'], base: ['Almizcle suave'] },
    ideal: ['Uso diario', 'Después del baño'],
  },
  'idi': {
    brand: 'IDI Make Up', family: 'Maquillaje', size: 'Labiales, gloss y más', gender: 'Para todos',
    desc: 'Tenemos la isla completa de IDI Make Up: labiales líquidos ultra mate, gloss, bases, sombras y todo lo que necesitás para tu rutina. Vení a probar los tonos al local o consultanos por WhatsApp.',
    ideal: ['Probalo en el local'],
  },
  'bolso-shine': {
    brand: 'Shine', family: 'Marroquinería', size: 'Carteras y bolsos', gender: 'Femenino',
    desc: 'Carteras y bolsos Shine en varios modelos y colores, con terminación brillante. Algunos vienen con perfume y desodorante de regalo. Consultanos qué modelos tenemos hoy.',
    ideal: ['Para regalar'],
  },
  'set-ciel-neceser': {
    brand: 'Ciel', family: 'Set de regalo', size: 'Perfume + desodorante + neceser', gender: 'Femenino',
    desc: 'El set ideal para regalar: perfume Ciel, desodorante a tono y un neceser tornasolado que después sirve para el maquillaje. Hay versiones de Shine, Magic, Nuit y más. Consultanos cuáles tenemos.',
    ideal: ['Para regalar', 'Listo para entregar'],
  },
  'bolso-camel': {
    family: 'Marroquinería', size: 'Bolso mediano', gender: 'Femenino',
    desc: 'Bolso de cuero ecológico con manijas cortas y correa larga regulable, para llevar en la mano o cruzado. Espacioso y fácil de combinar. Viene en varios colores.',
    ideal: ['Uso diario', 'Oficina'],
  },
  'bolso-beige': {
    family: 'Marroquinería', size: 'Bolso grande', gender: 'Femenino',
    desc: 'Bolso amplio con bandolera y varios bolsillos, ideal para el día a día: entra todo y queda ordenado. Tonos neutros que van con cualquier ropa.',
    ideal: ['Uso diario', 'Para viajar'],
  },
  'cartera-roja': {
    family: 'Marroquinería', size: 'Cartera de mano', gender: 'Femenino',
    desc: 'Cartera elegante de cuero ecológico con manijas y herrajes dorados. Le da el toque de color a cualquier look, de día o para salir.',
    ideal: ['Salidas', 'Para regalar'],
  },
  'aros-dorados': {
    family: 'Bijou', size: 'Argollas', gender: 'Femenino',
    desc: 'Argollas doradas lisas, el clásico que nunca falla. Livianas y cómodas para usar todo el día. Tenemos varios tamaños.',
    ideal: ['Uso diario', 'Para regalar'],
  },
  'aros-strass': {
    family: 'Bijou', size: 'Argollas grandes', gender: 'Femenino',
    desc: 'Argollas grandes con strass que brillan con la luz. Para las salidas, los cumples y las fiestas.',
    ideal: ['Salidas', 'Fiestas'],
  },
  'pulsera-strass': {
    family: 'Bijou', size: 'Pulseras', gender: 'Femenino',
    desc: 'Pulseras doradas con strass, finitas y brillantes. Quedan lindas solas o combinando varias en la misma muñeca.',
    ideal: ['Para regalar', 'Combinables'],
  },
  'valijas': {
    family: 'Marroquinería infantil', size: 'Carry-on', gender: 'Para los peques',
    desc: 'Valijas infantiles tamaño carry-on, con ruedas y manija extensible, en diseños divertidos. Para que los chicos lleven sus cosas en las vacaciones. También tenemos mochilas.',
    ideal: ['Vacaciones', 'Para regalar'],
  },
};
