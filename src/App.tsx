import React, { useMemo, useState } from "react";

const INGREDIENT_COST = 10;

const ITENS = {
  kids: {
    nome: "Combo Kids",
    emoji: "🧁",
    venda: 1000,
    ingredientes: {
      leite: 3,
      açúcar: 3,
      arroz: 3,
      batata: 3,
    },
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
      leite: 2,
    },
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
      leite: 2,
    },
  },
  box: {
    nome: "Caixa Box",
    emoji: "🎁",
    venda: 6000,
    ingredientes: {},
  },
} as const;

type ItemKey = keyof typeof ITENS;

type LinhaPedido = {
  id: number;
  item: ItemKey;
  quantidade: number;
  peluciasPorCaixa: number;
  custoPelucia: number;
};

function moeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

function App() {
  const [linhas, setLinhas] = useState<LinhaPedido[]>([
    {
      id: 1,
      item: "kids",
      quantidade: 1,
      peluciasPorCaixa: 1,
      custoPelucia: 0,
    },
  ]);

  function adicionarLinha() {
    setLinhas((atual) => [
      ...atual,
      {
        id: Date.now(),
        item: "kids",
        quantidade: 1,
        peluciasPorCaixa: 1,
        custoPelucia: 0,
      },
    ]);
  }

  function removerLinha(id: number) {
    setLinhas((atual) => atual.filter((linha) => linha.id !== id));
  }

  function atualizarLinha(
    id: number,
    campo: keyof LinhaPedido,
    valor: string | number
  ) {
    setLinhas((atual) =>
      atual.map((linha) => {
        if (linha.id !== id) return linha;

        if (campo === "item") {
          return {
            ...linha,
            item: valor as ItemKey,
          };
        }

        const numero = Math.max(0, Number(valor) || 0);

        return {
          ...linha,
          [campo]: numero,
        };
      })
    );
  }

  const calculo = useMemo(() => {
    const materiais: Record<string, number> = {};

    let custoIngredientes = 0;
    let custoPelucias = 0;
    let custoTotal = 0;
    let vendaTotal = 0;
    let totalItens = 0;

    for (const linha of linhas) {
      if (!linha.quantidade) continue;

      const item = ITENS[linha.item];
      totalItens += linha.quantidade;
      vendaTotal += item.venda * linha.quantidade;

      if (linha.item === "box") {
        const totalPelucias = linha.quantidade * linha.peluciasPorCaixa;

        if (totalPelucias > 0) {
          materiais["pelúcia"] = (materiais["pelúcia"] || 0) + totalPelucias;
          custoPelucias += totalPelucias * linha.custoPelucia;
        }

        continue;
      }

      for (const [ingrediente, qtdBase] of Object.entries(item.ingredientes)) {
        const qtdFinal = qtdBase * linha.quantidade;
        materiais[ingrediente] = (materiais[ingrediente] || 0) + qtdFinal;
        custoIngredientes += qtdFinal * INGREDIENT_COST;
      }
    }

    custoTotal = custoIngredientes + custoPelucias;
    const lucro = vendaTotal - custoTotal;

    const materiaisOrdenados = Object.entries(materiais).sort((a, b) =>
      a[0].localeCompare(b[0], "pt-BR")
    );

    return {
      materiaisOrdenados,
      custoIngredientes,
      custoPelucias,
      custoTotal,
      lucro,
      vendaTotal,
      totalItens,
    };
  }, [linhas]);

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <header style={styles.hero}>
          <div style={styles.heroBadge}>🐈 Cat Café • Dishes & Desserts</div>
          <div style={styles.catCircle}>🐾</div>
          <h1 style={styles.heroTitle}>Calculadora</h1>
          <p style={styles.heroText}>
            Escolha os itens, informe as quantidades e veja os materiais
            necessários, o custo total, o lucro e o valor final para apresentar
            ao cliente.
          </p>
        </header>

        <div style={styles.gridTop}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>Montagem do Pedido</div>
            <div style={styles.cardBody}>
              {linhas.map((linha, index) => {
                const itemAtual = ITENS[linha.item];
                const ehBox = linha.item === "box";
                const totalLinhaVenda = itemAtual.venda * linha.quantidade;
                const totalPelucias = linha.quantidade * linha.peluciasPorCaixa;

                const custoLinha = ehBox
                  ? totalPelucias * linha.custoPelucia
                  : Object.values(itemAtual.ingredientes).reduce(
                      (acc, qtd) =>
                        acc + qtd * INGREDIENT_COST * linha.quantidade,
                      0
                    );

                return (
                  <div key={linha.id} style={styles.lineCard}>
                    <div style={styles.formGrid}>
                      <div style={styles.field}>
                        <label style={styles.label}>Item {index + 1}</label>
                        <select
                          value={linha.item}
                          onChange={(e) =>
                            atualizarLinha(linha.id, "item", e.target.value)
                          }
                          style={styles.input}
                        >
                          <option value="kids">🧁 Combo Kids — {moeda(1000)}</option>
                          <option value="p">🍰 Combo P — {moeda(1000)}</option>
                          <option value="g">🥪 Combo G — {moeda(1250)}</option>
                          <option value="box">🎁 Caixa Box — {moeda(6000)}</option>
                        </select>
                      </div>

                      <div style={styles.field}>
                        <label style={styles.label}>Quantidade</label>
                        <input
                          type="number"
                          min={0}
                          value={linha.quantidade}
                          onChange={(e) =>
                            atualizarLinha(linha.id, "quantidade", e.target.value)
                          }
                          style={styles.input}
                        />
                      </div>

                      <div style={styles.fieldButton}>
                        <button
                          onClick={() => removerLinha(linha.id)}
                          disabled={linhas.length === 1}
                          style={{
                            ...styles.buttonSecondary,
                            opacity: linhas.length === 1 ? 0.5 : 1,
                            cursor: linhas.length === 1 ? "not-allowed" : "pointer",
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    {ehBox && (
                      <div style={styles.boxGrid}>
                        <div style={styles.field}>
                          <label style={styles.label}>Pelúcias por caixa</label>
                          <input
                            type="number"
                            min={0}
                            value={linha.peluciasPorCaixa}
                            onChange={(e) =>
                              atualizarLinha(
                                linha.id,
                                "peluciasPorCaixa",
                                e.target.value
                              )
                            }
                            style={styles.input}
                          />
                        </div>

                        <div style={styles.field}>
                          <label style={styles.label}>
                            Custo unitário da pelúcia
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={linha.custoPelucia}
                            onChange={(e) =>
                              atualizarLinha(
                                linha.id,
                                "custoPelucia",
                                e.target.value
                              )
                            }
                            style={styles.input}
                          />
                        </div>
                      </div>
                    )}

                    <div style={styles.lineSummary}>
                      <div>
                        {itemAtual.emoji} {linha.quantidade}x {itemAtual.nome} ={" "}
                        {moeda(totalLinhaVenda)} de venda
                      </div>
                      <div>Custo: {moeda(custoLinha)}</div>
                      {ehBox && (
                        <div style={styles.lineSmall}>
                          Total de pelúcias nesta linha: {totalPelucias}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <button onClick={adicionarLinha} style={styles.buttonPrimary}>
                + Adicionar item
              </button>
            </div>
          </section>

          <section style={styles.card}>
            <div style={styles.cardHeader}>Resumo Financeiro</div>
            <div style={styles.cardBody}>
              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Total de itens</div>
                <div style={styles.metricValue}>{calculo.totalItens}</div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Custo ingredientes</div>
                <div style={styles.metricValueSmall}>
                  {moeda(calculo.custoIngredientes)}
                </div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Custo pelúcias</div>
                <div style={styles.metricValueSmall}>
                  {moeda(calculo.custoPelucias)}
                </div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Custo total</div>
                <div style={styles.metricValueSmall}>
                  {moeda(calculo.custoTotal)}
                </div>
              </div>

              <div style={styles.metricBox}>
                <div style={styles.metricLabel}>Lucro</div>
                <div style={styles.metricValueSmall}>
                  {moeda(calculo.lucro)}
                </div>
              </div>

              <div style={styles.totalBox}>
                <div style={styles.metricLabel}>Valor final para o cliente</div>
                <div style={styles.totalValue}>
                  {moeda(calculo.vendaTotal)}
                </div>
              </div>

              <p style={styles.footerNote}>
                Ingredientes: custo fixo de {moeda(INGREDIENT_COST)} por unidade.
                Caixa Box: custo de pelúcia definido por você.
              </p>
            </div>
          </section>
        </div>

        <section style={styles.card}>
          <div style={styles.cardHeader}>Materiais Necessários</div>
          <div style={styles.cardBody}>
            {calculo.materiaisOrdenados.length === 0 ? (
              <p style={styles.emptyText}>
                Adicione uma quantidade maior que zero para visualizar os
                materiais.
              </p>
            ) : (
              <div style={styles.materialGrid}>
                {calculo.materiaisOrdenados.map(([ingrediente, quantidade]) => {
                  const custoMaterial =
                    ingrediente === "pelúcia"
                      ? linhas
                          .filter((linha) => linha.item === "box")
                          .reduce(
                            (acc, linha) =>
                              acc +
                              linha.quantidade *
                                linha.peluciasPorCaixa *
                                linha.custoPelucia,
                            0
                          )
                      : quantidade * INGREDIENT_COST;

                  return (
                    <div key={ingrediente} style={styles.materialCard}>
                      <div style={styles.materialLabel}>{ingrediente}</div>
                      <div style={styles.materialValue}>{quantidade}</div>
                      <div style={styles.materialCost}>
                        Custo: {moeda(custoMaterial)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7e6eb",
    backgroundImage:
      "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1.2px, transparent 0)",
    backgroundSize: "24px 24px",
    padding: "16px",
  },
  wrapper: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  hero: {
    border: "4px solid #f1c7d3",
    background: "#f8dfe6",
    borderRadius: "36px",
    padding: "32px 24px",
    textAlign: "center",
    boxShadow: "0 16px 40px rgba(178,98,122,0.18)",
  },
  heroBadge: {
    display: "inline-block",
    background: "#fff",
    color: "#a24d67",
    border: "2px solid #efc3d0",
    borderRadius: "999px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: "14px",
    marginBottom: "16px",
  },
  catCircle: {
    width: "82px",
    height: "82px",
    borderRadius: "50%",
    margin: "0 auto 16px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    border: "4px solid #f1c7d3",
    fontSize: "34px",
  },
  heroTitle: {
    margin: 0,
    color: "#9c3f5e",
    fontSize: "52px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  heroText: {
    maxWidth: "820px",
    margin: "12px auto 0 auto",
    color: "#8f5870",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: 1.6,
  },
  gridTop: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },
  card: {
    border: "4px solid #f1c7d3",
    background: "#fbeef2",
    borderRadius: "32px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(178,98,122,0.16)",
  },
  cardHeader: {
    padding: "18px 22px",
    background: "#f9e3ea",
    borderBottom: "1px solid #f3d6de",
    color: "#a24d67",
    fontSize: "28px",
    fontWeight: 900,
  },
  cardBody: {
    padding: "22px",
  },
  lineCard: {
    border: "4px solid #efc3d0",
    background: "#fff7f9",
    borderRadius: "28px",
    padding: "16px",
    marginBottom: "16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 170px 130px",
    gap: "16px",
    alignItems: "end",
  },
  boxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldButton: {
    display: "flex",
    alignItems: "end",
  },
  label: {
    fontWeight: 700,
    color: "#9c3f5e",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    border: "2px solid #efc3d0",
    borderRadius: "16px",
    padding: "12px 14px",
    fontSize: "15px",
    color: "#8b4b61",
    background: "#fff",
    outline: "none",
  },
  buttonPrimary: {
    border: "2px solid #d98ea7",
    background: "#d98ea7",
    color: "#fff",
    borderRadius: "16px",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonSecondary: {
    width: "100%",
    border: "2px solid #efc3d0",
    background: "#fff",
    color: "#a24d67",
    borderRadius: "16px",
    padding: "12px 14px",
    fontSize: "15px",
    fontWeight: 700,
  },
  lineSummary: {
    marginTop: "16px",
    border: "2px solid #f3d6de",
    background: "#f9e7ed",
    borderRadius: "24px",
    padding: "12px 14px",
    color: "#9c3f5e",
    fontWeight: 700,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  lineSmall: {
    fontSize: "12px",
    color: "#8f5870",
    fontWeight: 600,
  },
  metricBox: {
    border: "4px solid #efc3d0",
    background: "#fff7f9",
    borderRadius: "26px",
    padding: "18px",
    textAlign: "center",
    marginBottom: "16px",
  },
  metricLabel: {
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#b16a82",
    fontWeight: 800,
  },
  metricValue: {
    marginTop: "8px",
    fontSize: "42px",
    fontWeight: 900,
    color: "#9c3f5e",
  },
  metricValueSmall: {
    marginTop: "8px",
    fontSize: "30px",
    fontWeight: 900,
    color: "#9c3f5e",
  },
  totalBox: {
    border: "4px solid #e7a7ba",
    background: "#f9d7e2",
    borderRadius: "30px",
    padding: "20px",
    textAlign: "center",
  },
  totalValue: {
    marginTop: "10px",
    fontSize: "40px",
    fontWeight: 900,
    color: "#923753",
  },
  footerNote: {
    marginTop: "12px",
    textAlign: "center",
    color: "#8f5870",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.6,
  },
  emptyText: {
    color: "#8f5870",
    fontWeight: 600,
  },
  materialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  materialCard: {
    border: "4px solid #efc3d0",
    background: "#fff7f9",
    borderRadius: "26px",
    padding: "18px",
    textAlign: "center",
  },
  materialLabel: {
    color: "#b16a82",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: 800,
  },
  materialValue: {
    marginTop: "10px",
    color: "#9c3f5e",
    fontSize: "40px",
    fontWeight: 900,
  },
  materialCost: {
    marginTop: "6px",
    color: "#8f5870",
    fontSize: "12px",
    fontWeight: 600,
  },
};

export default App;
