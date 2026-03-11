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
    ingredientes: {}
  }
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
    maximumFractionDigits: 0
  }).format(valor);
}

export default function App() {
  const [linhas, setLinhas] = useState<LinhaPedido[]>([
    {
      id: 1,
      item: "kids",
      quantidade: 1,
      peluciasPorCaixa: 1,
      custoPelucia: 0
    }
  ]);

  function adicionarLinha() {
    setLinhas((atual) => [
      ...atual,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        item: "kids",
        quantidade: 1,
        peluciasPorCaixa: 1,
        custoPelucia: 0
      }
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
            item: valor as ItemKey
          };
        }

        const numero = Math.max(0, Number(valor) || 0);

        return {
          ...linha,
          [campo]: numero
        };
      })
    );
  }

  const calculo = useMemo(() => {
    const materiais: Record<string, number> = {};

    let custoIngredientes = 0;
    let custoPelucias = 0;
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

    const custoTotal = custoIngredientes + custoPelucias;
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
      totalItens
    };
  }, [linhas]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.hero}>
          <div style={styles.badge}>🐈 Cat Café • Dishes & Desserts</div>
          <div style={styles.iconCircle}>🐾</div>
          <h1 style={styles.title}>Calculadora</h1>
          <p style={styles.subtitle}>
            Escolha os itens, informe as quantidades e veja os materiais
            necessários, o custo total, o lucro e o valor final para apresentar
            ao cliente.
          </p>
        </header>

        <div style={styles.topGrid}>
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
                      (acc, qtd) => acc + qtd * INGREDIENT_COST * linha.quantidade,
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

                      <div style={styles.buttonField}>
                        <button
                          type="button"
                          onClick={() => removerLinha(linha.id)}
                          disabled={linhas.length === 1}
                          style={{
                            ...styles.secondaryButton,
                            opacity: linhas.length === 1 ? 0.5 : 1,
                            cursor: linhas.length === 1 ? "not-allowed" : "pointer"
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
                              atualizarLinha(linha.id, "custoPelucia", e.target.value)
                            }
                            style={styles.input}
                          />
                        </div>
                      </div>
                    )}

                    <div style={styles.summaryBox}>
                      <div>
                        {itemAtual.emoji} {linha.quantidade}x {itemAtual.nome} ={" "}
                        {moeda(totalLinhaVenda)} de venda
                      </div>
                      <div>Custo: {moeda(custoLinha)}</div>
                      {ehBox && (
                        <div style={styles.smallText}>
                          Total de pelúcias nesta linha: {totalPelucias}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <button type="button" onClick={adicionarLinha} style={styles.primaryButton}>
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
                <div style={styles.totalValue}>{moeda(calculo.vendaTotal)}</div>
              </div>
            </div>
          </section>
        </div>

        <section style={styles.card}>
          <div style={styles.cardHeader}>Materiais Necessários</div>
          <div style={styles.cardBody}>
            {calculo.materiaisOrdenados.length === 0 ? (
              <div style={styles.emptyText}>
                Adicione uma quantidade maior que zero para visualizar os materiais.
              </div>
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
                      <div style={styles.materialName}>{ingrediente}</div>
                      <div style={styles.materialQty}>{quantidade}</div>
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
    padding: "16px"
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  hero: {
    background: "#f8dfe6",
    border: "4px solid #f1c7d3",
    borderRadius: "32px",
    padding: "32px 20px",
    textAlign: "center",
    boxShadow: "0 16px 40px rgba(178,98,122,0.18)"
  },
  badge: {
    display: "inline-block",
    background: "#ffffff",
    color: "#a24d67",
    border: "2px solid #efc3d0",
    borderRadius: "999px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: "14px",
    marginBottom: "16px"
  },
  iconCircle: {
    width: "80px",
    height: "80px",
    margin: "0 auto 16px auto",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    border: "4px solid #f1c7d3",
    fontSize: "32px"
  },
  title: {
    margin: 0,
    fontSize: "48px",
    fontWeight: 900,
    color: "#9c3f5e",
    textTransform: "uppercase"
  },
  subtitle: {
    margin: "12px auto 0 auto",
    maxWidth: "820px",
    color: "#8f5870",
    fontSize: "16px",
    lineHeight: 1.6,
    fontWeight: 600
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px"
  },
  card: {
    background: "#fbeef2",
    border: "4px solid #f1c7d3",
    borderRadius: "28px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(178,98,122,0.16)"
  },
  cardHeader: {
    background: "#f9e3ea",
    color: "#a24d67",
    padding: "18px 22px",
    fontSize: "26px",
    fontWeight: 900,
    borderBottom: "1px solid #f3d6de"
  },
  cardBody: {
    padding: "20px"
  },
  lineCard: {
    background: "#fff7f9",
    border: "4px solid #efc3d0",
    borderRadius: "24px",
    padding: "16px",
    marginBottom: "16px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 170px 130px",
    gap: "16px",
    alignItems: "end"
  },
  boxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "16px"
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  buttonField: {
    display: "flex",
    alignItems: "end"
  },
  label: {
    color: "#9c3f5e",
    fontSize: "14px",
    fontWeight: 700
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "16px",
    border: "2px solid #efc3d0",
    background: "#fff",
    color: "#8b4b61",
    fontSize: "15px",
    outline: "none"
  },
  primaryButton: {
    border: "2px solid #d98ea7",
    background: "#d98ea7",
    color: "#fff",
    borderRadius: "16px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer"
  },
  secondaryButton: {
    width: "100%",
    border: "2px solid #efc3d0",
    background: "#fff",
    color: "#a24d67",
    borderRadius: "16px",
    padding: "12px 14px",
    fontWeight: 700
  },
  summaryBox: {
    marginTop: "16px",
    background: "#f9e7ed",
    border: "2px solid #f3d6de",
    borderRadius: "20px",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#9c3f5e",
    fontWeight: 700
  },
  smallText: {
    fontSize: "12px",
    color: "#8f5870"
  },
  metricBox: {
    background: "#fff7f9",
    border: "4px solid #efc3d0",
    borderRadius: "22px",
    padding: "18px",
    textAlign: "center",
    marginBottom: "16px"
  },
  metricLabel: {
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#b16a82",
    fontWeight: 800
  },
  metricValue: {
    marginTop: "8px",
    fontSize: "40px",
    fontWeight: 900,
    color: "#9c3f5e"
  },
  metricValueSmall: {
    marginTop: "8px",
    fontSize: "28px",
    fontWeight: 900,
    color: "#9c3f5e"
  },
  totalBox: {
    background: "#f9d7e2",
    border: "4px solid #e7a7ba",
    borderRadius: "26px",
    padding: "20px",
    textAlign: "center"
  },
  totalValue: {
    marginTop: "10px",
    fontSize: "38px",
    fontWeight: 900,
    color: "#923753"
  },
  emptyText: {
    color: "#8f5870",
    fontWeight: 600
  },
  materialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px"
  },
  materialCard: {
    background: "#fff7f9",
    border: "4px solid #efc3d0",
    borderRadius: "22px",
    padding: "18px",
    textAlign: "center"
  },
  materialName: {
    color: "#b16a82",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: 800
  },
  materialQty: {
    marginTop: "10px",
    color: "#9c3f5e",
    fontSize: "38px",
    fontWeight: 900
  },
  materialCost: {
    marginTop: "6px",
    color: "#8f5870",
    fontSize: "12px",
    fontWeight: 600
  }
};
