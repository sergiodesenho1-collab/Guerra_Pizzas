import { ensureInitialData, getDb } from "../../core/database.js";

const db = getDb();

ensureInitialData();

function mapPizza(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    nome: row.nome,
    descricao: row.descricao,
    preco: Number(row.preco),
    disponivel: Boolean(row.disponivel),
    imagem: row.imagem,
  };
}

function validarDadosPizza(dados) {
  const nome = String(dados?.nome ?? "").trim();
  const descricao = String(dados?.descricao ?? "").trim();
  const preco = Number(dados?.preco);

  if (!nome) {
    return { valido: false, mensagem: "O campo nome é obrigatório." };
  }

  if (!descricao) {
    return { valido: false, mensagem: "O campo descrição é obrigatório." };
  }

  if (!Number.isFinite(preco) || preco <= 0) {
    return {
      valido: false,
      mensagem: "O campo preço deve ser um número maior que zero.",
    };
  }

  return {
    valido: true,
    dados: {
      nome,
      descricao,
      preco,
      disponivel: dados?.disponivel ?? true,
      imagem:
        dados?.imagem ??
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    },
  };
}

export function listarTodas() {
  const rows = db.prepare("SELECT * FROM pizzas ORDER BY id").all();
  return rows.map(mapPizza);
}

export function listarPizzas() {
  return listarTodas();
}

export function buscarPorId(id) {
  const row = db.prepare("SELECT * FROM pizzas WHERE id = ?").get(id);
  return mapPizza(row);
}

export function criar(dados) {
  const resultado = validarDadosPizza(dados);

  if (!resultado.valido) {
    return { erro: resultado.mensagem };
  }

  const statement = db.prepare(`
    INSERT INTO pizzas (nome, descricao, preco, disponivel, imagem)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    resultado.dados.nome,
    resultado.dados.descricao,
    resultado.dados.preco,
    resultado.dados.disponivel ? 1 : 0,
    resultado.dados.imagem,
  );

  return buscarPorId(result.lastInsertRowid);
}

export function atualizar(id, dados) {
  const pizza = buscarPorId(id);

  if (!pizza) {
    return null;
  }

  if (dados && Object.keys(dados).length > 0) {
    const resultado = validarDadosPizza({
      ...pizza,
      ...dados,
    });

    if (!resultado.valido) {
      return { erro: resultado.mensagem };
    }

    db.prepare(
      `
      UPDATE pizzas
      SET nome = ?, descricao = ?, preco = ?, disponivel = ?, imagem = ?
      WHERE id = ?
    `,
    ).run(
      resultado.dados.nome,
      resultado.dados.descricao,
      resultado.dados.preco,
      resultado.dados.disponivel ? 1 : 0,
      resultado.dados.imagem,
      id,
    );

    return buscarPorId(id);
  }

  return pizza;
}

export function remover(id) {
  const pizza = buscarPorId(id);

  if (!pizza) {
    return null;
  }

  db.prepare("DELETE FROM pizzas WHERE id = ?").run(id);

  return pizza;
}
