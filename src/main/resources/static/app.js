const CAMPO_RESPOSTA = 'resposta';

const FOTO_DANDARA = 'dandara.png';

const mensagens = document.getElementById('mensagens');
const formulario = document.getElementById('form-chat');
const campoPergunta = document.getElementById('pergunta');
const botaoEnviar = document.getElementById('enviar');
const boasVindas = document.getElementById('boas-vindas');
const botaoNovaConversa = document.getElementById('nova-conversa');

async function enviarMensagem(texto) {
  const resposta = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: texto })
  });

  if (!resposta.ok) {
    throw new Error(mensagemDeErro(resposta.status));
  }

  const dados = await resposta.json();
  return lerTextoDaResposta(dados);
}

function lerTextoDaResposta(dados) {
  if (typeof dados === 'string') return dados;
  if (dados && typeof dados[CAMPO_RESPOSTA] === 'string') return dados[CAMPO_RESPOSTA];
  const primeiroTexto = dados && Object.values(dados).find((valor) => typeof valor === 'string');
  return primeiroTexto || 'A API respondeu, mas sem texto.';
}

function mensagemDeErro(status) {
  if (status === 400) return 'A API não entendeu o pedido (erro 400). Confira o campo "message" no MeuChatRequest.';
  if (status === 404) return 'Rota /api/chat não encontrada (erro 404). Confira o @PostMapping no controller.';
  return 'Não consegui falar com o modelo agora (erro ' + status + '). '
    + 'Confira se o Ollama está aberto e com login feito, e veja o console do Spring.';
}

function paraHtmlSeguro(markdown) {
  if (window.marked && window.DOMPurify) {
    return DOMPurify.sanitize(marked.parse(markdown));
  }
  return null;
}

function rolarParaOFim() {
  mensagens.scrollTop = mensagens.scrollHeight;
}

function criarLinha(autor, classeExtra) {
  boasVindas.hidden = true;

  const linha = document.createElement('div');
  linha.className = 'mensagem ' + autor + (classeExtra ? ' ' + classeExtra : '');

  if (autor === 'bot') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');

    const foto = document.createElement('img');
    foto.src = FOTO_DANDARA;
    foto.alt = '';
    avatar.appendChild(foto);

    linha.appendChild(avatar);
  }

  const balao = document.createElement('div');
  balao.className = 'balao';
  linha.appendChild(balao);

  mensagens.appendChild(linha);
  return { linha, balao };
}

function adicionarMensagem(autor, texto, classeExtra) {
  const { linha, balao } = criarLinha(autor, classeExtra);

  const html = autor === 'bot' && !classeExtra ? paraHtmlSeguro(texto) : null;
  if (html !== null) {
    balao.innerHTML = html;
  } else {
    balao.textContent = texto; // texto puro: nunca interpreta HTML do usuário
  }

  rolarParaOFim();
  return linha;
}

function mostrarDigitando() {
  const { linha, balao } = criarLinha('bot', 'digitando');
  balao.innerHTML = '<span class="pontos" aria-label="Digitando"><span></span><span></span><span></span></span>';
  rolarParaOFim();
  return linha;
}

// ===== 4. Enviar a pergunta =====
let aguardando = false;

function definirAguardando(valor) {
  aguardando = valor;
  botaoEnviar.disabled = valor;
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const texto = campoPergunta.value.trim();
  if (!texto || aguardando) return;

  campoPergunta.value = '';
  ajustarAltura();
  adicionarMensagem('usuario', texto);
  definirAguardando(true);
  const digitando = mostrarDigitando();

  try {
    const resposta = await enviarMensagem(texto);
    digitando.remove();
    adicionarMensagem('bot', resposta);
  } catch (erro) {
    digitando.remove();
    const mensagemErro = erro instanceof TypeError
      ? 'Não consegui falar com a API. A aplicação Spring está rodando?'
      : erro.message;
    adicionarMensagem('bot', mensagemErro, 'erro');
  } finally {
    definirAguardando(false);
    campoPergunta.focus();
  }
});

// Enter envia; Shift + Enter quebra a linha
campoPergunta.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter' && !evento.shiftKey && !evento.isComposing) {
    evento.preventDefault();
    formulario.requestSubmit();
  }
});

// A caixa de texto cresce conforme a pessoa digita
function ajustarAltura() {
  campoPergunta.style.height = 'auto';
  campoPergunta.style.height = Math.min(campoPergunta.scrollHeight, 200) + 'px';
}
campoPergunta.addEventListener('input', ajustarAltura);

// ===== 5. Sugestões e nova conversa =====
document.querySelectorAll('.sugestao').forEach((botao) => {
  botao.addEventListener('click', () => {
    campoPergunta.value = botao.textContent;
    formulario.requestSubmit();
  });
});

botaoNovaConversa.addEventListener('click', () => {
  mensagens.querySelectorAll('.mensagem').forEach((linha) => linha.remove());
  boasVindas.hidden = false;
  campoPergunta.focus();
});

campoPergunta.focus();
