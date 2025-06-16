// script.js

document.addEventListener("DOMContentLoaded", function () {
  let jogadores = JSON.parse(localStorage.getItem("jogadores")) || [];

  const addPlayerBtn = document.getElementById("addPlayerBtn");
  const formContainer = document.getElementById("formulario-jogador");
  const form = document.getElementById("form-jogador");
  const tabela = document.getElementById("tabela-jogadores");
  const filtroNome = document.getElementById("filtro-nome");
  const filtroPosicao = document.getElementById("filtro-posicao");
  const ordenarPosicao = document.getElementById("ordenar-posicao");
  const limparDadosBtn = document.getElementById("limpar-dados");
  const exportarBtn = document.getElementById("exportar-dados");
  const importarInput = document.getElementById("importar-dados");
  const btnImportar = document.getElementById("btn-importar");

  const destaqueNome = document.getElementById("destaque-nome");
  const destaquePosicao = document.getElementById("destaque-posicao");
  const destaqueTrofeus = document.getElementById("destaque-trofeus");

  let ordemAscendente = true;

  const ordemPosicao = {
    "Goleiro": 1,
    "Zagueiro": 2,
    "Volante": 3,
    "Ala": 4,
    "Meia": 5,
    "Atacante": 6
  };

  addPlayerBtn.addEventListener("click", () => {
    formContainer.style.display = "block";
  });

  document.getElementById("cancelar").addEventListener("click", () => {
    formContainer.style.display = "none";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const posicoesSelecionadas = Array.from(
      document.querySelectorAll('input[name="posicao"]:checked')
    ).map(cb => cb.value);

    const trofeus = parseInt(document.getElementById("trofeus").value) || 0;
    const medalhas = parseInt(document.getElementById("medalhas").value) || 0;
    const capitao = document.getElementById("capitao").checked;

    jogadores.push({
      nome,
      posicoes: posicoesSelecionadas,
      trofeus,
      medalhas,
      capitao,
      capitaoVezes: capitao ? 1 : 0
    });

    salvarJogadores();
    atualizarTabela();
    form.reset();
    formContainer.style.display = "none";
  });

  filtroNome.addEventListener("input", atualizarTabela);
  filtroPosicao.addEventListener("change", atualizarTabela);
  ordenarPosicao.addEventListener("click", () => {
    ordemAscendente = !ordemAscendente;
    atualizarTabela();
  });

  limparDadosBtn?.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja apagar todos os dados?")) {
      jogadores = [];
      localStorage.removeItem("jogadores");
      atualizarTabela();
    }
  });

  exportarBtn?.addEventListener("click", () => {
    const dataStr = JSON.stringify(jogadores, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jogadores_md3.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  btnImportar?.addEventListener("click", () => {
    importarInput.click();
  });

  importarInput?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          jogadores = data;
          salvarJogadores();
          atualizarTabela();
        } else {
          alert("Arquivo inválido.");
        }
      } catch {
        alert("Erro ao importar o arquivo.");
      }
    };
    reader.readAsText(file);
  });

  function salvarJogadores() {
    localStorage.setItem("jogadores", JSON.stringify(jogadores));
  }

  function atualizarTabela() {
    const nomeFiltro = filtroNome.value.toLowerCase();
    const posicaoFiltro = filtroPosicao.value;

    let listaFiltrada = jogadores.filter((j) => {
      const nomeValido = j.nome.toLowerCase().includes(nomeFiltro);
      const posicaoValida = !posicaoFiltro || (j.posicoes || []).includes(posicaoFiltro);
      return nomeValido && posicaoValida;
    });

    listaFiltrada.sort((a, b) => {
      const ordemA = Math.min(...(a.posicoes || []).map(p => ordemPosicao[p] || 999));
      const ordemB = Math.min(...(b.posicoes || []).map(p => ordemPosicao[p] || 999));
      return ordemAscendente ? ordemA - ordemB : ordemB - ordemA;
    });

    tabela.innerHTML = "";
    listaFiltrada.forEach((jogador) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${jogador.nome}</td>
        <td>${(jogador.posicoes || []).join(', ')}</td>
        <td>
          <button onclick="ajustarValorPorNome('${jogador.nome}', 'trofeus', -1)">-</button>
          <span>${jogador.trofeus}</span>
          <button onclick="ajustarValorPorNome('${jogador.nome}', 'trofeus', 1)">+</button>
        </td>
        <td>
          <button onclick="ajustarValorPorNome('${jogador.nome}', 'medalhas', -1)">-</button>
          <span>${jogador.medalhas}</span>
          <button onclick="ajustarValorPorNome('${jogador.nome}', 'medalhas', 1)">+</button>
        </td>
        <td>
          <button onclick="definirCapitaoPorNome('${jogador.nome}', false)">-</button>
          <span>${jogador.capitao ? "🧠" : "✖"}</span>
          <button onclick="definirCapitaoPorNome('${jogador.nome}', true)">+</button>
        </td>
        <td>
          <button onclick="ajustarValorPorNome('${jogador.nome}', 'capitaoVezes', -1)">-</button>
          <span>${jogador.capitaoVezes}</span>
          <button onclick="ajustarValorPorNome('${jogador.nome}', 'capitaoVezes', 1)">+</button>
        </td>
        <td>
          <button onclick="removerJogadorPorNome('${jogador.nome}')">Remover</button>
        </td>
      `;

      tabela.appendChild(tr);
    });

    atualizarDestaque();
  }

  function atualizarDestaque() {
  if (jogadores.length === 0) {
    destaqueNome.textContent = "-";
    destaquePosicao.textContent = "-";
    destaqueTrofeus.textContent = "0";
    return;
  }

  const destaque = jogadores.reduce((mais, atual) =>
    atual.trofeus > mais.trofeus ? atual : mais
  );

  destaqueNome.innerHTML = `🏅 <span style="color: white; text-shadow: 0 0 10px white;">${destaque.nome}</span>`;
  destaquePosicao.textContent = destaque.posicao || "-";
  destaqueTrofeus.textContent = destaque.trofeus;
}


  window.ajustarValorPorNome = function (nome, campo, delta) {
    const jogador = jogadores.find(j => j.nome === nome);
    if (!jogador) return;
    jogador[campo] += delta;
    if (jogador[campo] < 0) jogador[campo] = 0;
    salvarJogadores();
    atualizarTabela();
  };

  window.definirCapitaoPorNome = function (nome, status) {
    const jogador = jogadores.find(j => j.nome === nome);
    if (!jogador) return;
    if (jogador.capitao !== status && status === true) {
      jogador.capitaoVezes++;
    }
    jogador.capitao = status;
    salvarJogadores();
    atualizarTabela();
  };

  window.removerJogadorPorNome = function (nome) {
    jogadores = jogadores.filter(j => j.nome !== nome);
    salvarJogadores();
    atualizarTabela();
  };

  setTimeout(() => {
    const botaoAlterarMesAno = document.getElementById("alterar-mes-ano");
    const spanMesAno = document.getElementById("mesAno");

    if (botaoAlterarMesAno) {
      botaoAlterarMesAno.addEventListener("click", () => {
        const atual = spanMesAno.textContent;
        const novo = prompt("Digite o novo mês/ano (ex: JULHO 2025):", atual);
        if (novo) spanMesAno.textContent = novo;
      });
    }

    document.querySelectorAll(".btn-alterar-data").forEach(button => {
      button.addEventListener("click", () => {
        const span = button.previousElementSibling;
        const atual = span.textContent;
        const nova = prompt("Digite a nova data (formato DD/MM):", atual);
        if (nova) span.textContent = nova;
      });
    });
  }, 200);

  atualizarTabela();
});
