import React, { useMemo, useState } from "react";

const INGREDIENT_COST = 10;
const BOX_PLUSH_COST = 3000;

const ITENS = {
  kids: {
    nome: "Combo Kids",
    emoji: "🧁",
    venda: 1000,
    ingredientes: {
      leite: 3,
      açúcar: 3,
      arroz: 3,
      batata: 3
    }
  },
  p: {
    nome: "Combo P",
    emoji: "🍰",
    venda: 1000,
    ingredientes: {
      açúcar: 2,
      farinha: 3,
      cacau: 3,
      manteiga: 1,
      queijo: 1,
      água: 1,
      café: 1,
      leite: 2
    }
  },
  g: {
    nome: "Combo G",
    emoji: "🥪",
    venda: 1250,
    ingredientes: {
      açúcar: 2,
      farinha: 4,
      cacau: 4,
      manteiga: 2,
      queijo: 1,
      água: 2,
      café: 2,
      leite: 2
    }
  },
  box: {
    nome: "Caixa Box",
    emoji: "🎁",
    venda: 6000,
    ingredientes: {
      pelúcia: 1
    }
  }
} as const;

type ItemKey = keyof typeof ITENS;

type LinhaPedido = {
  id: number;
  item: ItemKey;
  quantidade: number;
};

type MateriaisMap = Record<string, number>;

function moeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(valor);
}

function custoUnitarioDoMaterial(nome: string): number {
  return nome === "pelúcia" ? BOX_PLUSH_COST : INGREDIENT_COST;
}

function custoDaLinha(item: ItemKey, quantidade: number): number {
  const ingredientes = ITENS[item].ingredientes;

  return Object.entries(ingredientes).reduce((acc, [nome, qtd]) => {
    return acc + qtd * quantidade * custoUnitarioDoMaterial(nome);
  }, 0);
}

export default function App() {
  const [linhas, setLinhas] = useState<LinhaPedido[]>([
    {
      id: 1,
      item: "kids",
      quantidade: 1
    }
  ]);

  function adicionarLinha() {
    setLinhas((atual) => [
      ...atual,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        item: "kids",
        quantidade: 1
      }
    ]);
  }

  function limparPedido() {
    setLinhas([
      {
        id: 1,
        item: "kids",
        quantidade: 0
      }
    ]);
  }

  function removerLinha(id: number) {
    setLinhas((atual) => atual.filter((linha) => linha.id !== id));
  }

  function atualizarLinha(
    id: number,
    campo: "item" | "quantidade",
    valor: string
  ) {
    setLinhas((atual) =>
      atual.map((linha) => {
        if (linha.id !== id) return linha;

        if (campo === "item") {
          return {
            ...linha,
            item: valor as ItemKey
          };
        }

        return {
          ...linha,
          quantidade: Math.max(0, Number(valor) || 0)
        };
      })
    );
  }

  const resultado = useMemo(() => {
    const materiais: MateriaisMap = {};
    let custoTotal = 0;
    let valorVendaTotal = 0;
    let totalItens = 0;

    for (const linha of linhas) {
      if (linha.quantidade <= 0) continue;

      const itemAtual = ITENS[linha.item];
      totalItens += linha.quantidade;
      valorVendaTotal += itemAtual.venda * linha.quantidade;
      custoTotal += custoDaLinha(linha.item, linha.quantidade);

      for (const [material, qtdBase] of Object.entries(itemAtual.ingredientes)) {
        materiais[material] =
          (materiais[material] || 0) + qtdBase * linha.quantidade;
      }
    }

    const custoIngredientes = Object.entries(materiais)
      .filter(([nome]) => nome !== "pelúcia")
      .reduce((acc, [_, qtd]) => acc + qtd * INGREDIENT_COST, 0);

    const custoPelucia = (materiais["pelúcia"] || 0) * BOX_PLUSH_COST;
    const lucro = valorVendaTotal - custoTotal;

    const materiaisOrdenados = Object.entries(materiais).sort((a, b) =>
      a[0].localeCompare(b[0], "pt-BR")
    );

    return {
      materiaisOrdenados,
      custoIngredientes,
      custoPelucia,
      custoTotal,
      lucro,
      valorVendaTotal,
      totalItens
    };
  }, [linhas]);

  return (
    <div className="page">
      <div className="app-shell">
        <header className="hero">
          <div className="hero-top-badge">CAT CAFÉ • DISHES & DESSERTS</div>

          <div className="logo-circle">
            <span>🐈</span>
          </div>

          <h1 className="hero-title">MENU CALCULADORA</h1>

          <p className="hero-text">
            Escolha os itens, informe as quantidades e veja automaticamente os
            materiais necessários, custo total, lucro e valor final apresentado
            ao cliente.
          </p>
        </header>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-title">Montagem do Pedido</div>

            <div className="panel-body">
              {linhas.map((linha, index) => {
                const itemAtual = ITENS[linha.item];
                const totalVendaLinha = itemAtual.venda * linha.quantidade;
                const custoLinha = custoDaLinha(linha.item, linha.quantidade);

                return (
                  <div className="line-card" key={linha.id}>
                    <div className="line-grid">
                      <div className="field">
                        <label>Item {index + 1}</label>
                        <select
                          value={linha.item}
                          onChange={(e) =>
                            atualizarLinha(linha.id, "item", e.target.value)
                          }
                        >
                          <option value="kids">🧁 Combo Kids — {moeda(1000)}</option>
                          <option value="p">🍰 Combo P — {moeda(1000)}</option>
                          <option value="g">🥪 Combo G — {moeda(1250)}</option>
                          <option value="box">🎁 Caixa Box — {moeda(6000)}</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Quantidade</label>
                        <input
                          type="number"
                          min={0}
                          value={linha.quantidade}
                          onChange={(e) =>
                            atualizarLinha(linha.id, "quantidade", e.target.value)
                          }
                        />
                      </div>

                      <div className="field button-slot">
                        <label className="label-hidden">Remover</label>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => removerLinha(linha.id)}
                          disabled={linhas.length === 1}
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    <div className="line-summary">
                      <span>
                        {itemAtual.emoji} {linha.quantidade}x {itemAtual.nome}
                      </span>
                      <span>Venda: {moeda(totalVendaLinha)}</span>
                      <span>Custo: {moeda(custoLinha)}</span>
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "8px"
                }}
              >
                <button
                  type="button"
                  className="button button-primary"
                  onClick={adicionarLinha}
                >
                  + Adicionar Item
                </button>

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={limparPedido}
                >
                  Limpar pedido
                </button>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title">Resumo Financeiro</div>

            <div className="panel-body metrics">
              <div className="metric-card">
                <span className="metric-label">Total de Combos</span>
                <strong className="metric-value">{resultado.totalItens}</strong>
              </div>

              <div className="metric-card">
                <span className="metric-label">Custo de Produção</span>
                <strong className="metric-value small">
                  {moeda(resultado.custoTotal)}
                </strong>
              </div>

              <div className="metric-card">
                <span className="metric-label">Lucro</span>
                <strong className="metric-value small">
                  {moeda(resultado.lucro)}
                </strong>
              </div>

              <div className="metric-card total-highlight">
                <span className="metric-label">Valor final para o cliente</span>
                <strong className="metric-value">
                  {moeda(resultado.valorVendaTotal)}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-title">Materiais Necessários</div>

          <div className="panel-body">
            {resultado.materiaisOrdenados.length === 0 ? (
              <div className="empty-state">
                Adicione uma quantidade maior que zero para visualizar os materiais.
              </div>
            ) : (
              <div className="materials-grid">
                {resultado.materiaisOrdenados.map(([nome, quantidade]) => (
                  <div className="material-card" key={nome}>
                    <span className="material-name">{nome}</span>
                    <strong className="material-qty">{quantidade}</strong>
                    <span className="material-cost">
                      Custo: {moeda(quantidade * custoUnitarioDoMaterial(nome))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
