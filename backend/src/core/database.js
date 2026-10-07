import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../../data/guerra_pizzas.db");

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS pizzas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco REAL NOT NULL,
    disponivel INTEGER NOT NULL DEFAULT 1,
    imagem TEXT
  );
`);

export function getDb() {
  return db;
}

export function ensureInitialData() {
  const total = db.prepare("SELECT COUNT(*) AS total FROM pizzas").get();

  if (Number(total.total) > 0) {
    return;
  }

  db.exec(`
    INSERT INTO pizzas (nome, descricao, preco, disponivel, imagem)
    VALUES
      ('Calabresa', 'Molho de tomate, mussarela e calabresa.', 38.90, 1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'),
      ('Frango com Catupiry', 'Molho de tomate, muçarela, frango desfiado e catupiry.', 42.50, 1, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80'),
      ('Margherita', 'Molho de tomate artesanal, muçarela e manjericão.', 46.00, 1, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80'),
      ('Portuguesa', 'Molho, mussarela, presunto, cebola, azeitona e ovo.', 48.00, 1, 'https://www.receitasnestle.com.br/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/2eb7ece4ae9a67b773aa138589e2031d.jpg?itok=8rB5qKP-');
  `);
}
