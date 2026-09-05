const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

const PEDIDOS_FILE = path.join(__dirname, 'pedidos.json');
const PRODUTOS_FILE = path.join(__dirname, 'produtos.json');
const TAXAS_FILE = path.join(__dirname, 'taxasEntrega.json');

function lerJSON(file, padrao) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(padrao));
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function salvarJSON(file, dados) {
  fs.writeFileSync(file, JSON.stringify(dados, null, 2));
}

/* ---------- TAXAS DE ENTREGA (por bairro) ---------- */

app.get('/api/taxas-entrega', (req, res) => {
  res.json(lerJSON(TAXAS_FILE, []));
});

app.post('/api/taxas-entrega', (req, res) => {
  const taxas = lerJSON(TAXAS_FILE, []);
  const nova = {
    id: Date.now().toString(),
    bairro: req.body.bairro || '',
    taxa: Number(req.body.taxa) || 0
  };
  taxas.push(nova);
  salvarJSON(TAXAS_FILE, taxas);
  io.emit('taxas:atualizadas', taxas);
  res.status(201).json(nova);
});

app.put('/api/taxas-entrega/:id', (req, res) => {
  const taxas = lerJSON(TAXAS_FILE, []);
  const idx = taxas.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Taxa não encontrada' });
  taxas[idx] = {
    ...taxas[idx],
    bairro: req.body.bairro ?? taxas[idx].bairro,
    taxa: req.body.taxa !== undefined ? Number(req.body.taxa) : taxas[idx].taxa
  };
  salvarJSON(TAXAS_FILE, taxas);
  io.emit('taxas:atualizadas', taxas);
  res.json(taxas[idx]);
});

app.delete('/api/taxas-entrega/:id', (req, res) => {
  let taxas = lerJSON(TAXAS_FILE, []);
  taxas = taxas.filter(t => t.id !== req.params.id);
  salvarJSON(TAXAS_FILE, taxas);
  io.emit('taxas:atualizadas', taxas);
  res.status(204).end();
});

/* ---------- PRODUTOS ---------- */

app.get('/api/produtos', (req, res) => {
  res.json(lerJSON(PRODUTOS_FILE, []));
});

app.post('/api/produtos', (req, res) => {
  const produtos = lerJSON(PRODUTOS_FILE, []);
  const novo = {
    id: Date.now().toString(),
    nome: req.body.nome || '',
    preco: Number(req.body.preco) || 0
  };
  produtos.push(novo);
  salvarJSON(PRODUTOS_FILE, produtos);
  io.emit('produtos:atualizados', produtos);
  res.status(201).json(novo);
});

app.put('/api/produtos/:id', (req, res) => {
  const produtos = lerJSON(PRODUTOS_FILE, []);
  const idx = produtos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' });
  produtos[idx] = {
    ...produtos[idx],
    nome: req.body.nome ?? produtos[idx].nome,
    preco: req.body.preco !== undefined ? Number(req.body.preco) : produtos[idx].preco
  };
  salvarJSON(PRODUTOS_FILE, produtos);
  io.emit('produtos:atualizados', produtos);
  res.json(produtos[idx]);
});

app.delete('/api/produtos/:id', (req, res) => {
  let produtos = lerJSON(PRODUTOS_FILE, []);
  produtos = produtos.filter(p => p.id !== req.params.id);
  salvarJSON(PRODUTOS_FILE, produtos);
  io.emit('produtos:atualizados', produtos);
  res.status(204).end();
});

/* ---------- PEDIDOS ---------- */

app.get('/api/pedidos', (req, res) => {
  res.json(lerJSON(PEDIDOS_FILE, []));
});

// itens esperado: [{ nome, preco, quantidade }]
// taxaEntregaId: id de uma taxa cadastrada (opcional, null/omitido = retirada, sem entrega)
app.post('/api/pedidos', (req, res) => {
  const pedidos = lerJSON(PEDIDOS_FILE, []);
  const taxas = lerJSON(TAXAS_FILE, []);
  const itens = Array.isArray(req.body.itens) ? req.body.itens : [];

  let bairroEntrega = null;
  let taxaEntrega = 0;
  if (req.body.taxaEntregaId) {
    const taxaEscolhida = taxas.find(t => t.id === req.body.taxaEntregaId);
    if (taxaEscolhida) {
      bairroEntrega = taxaEscolhida.bairro;
      taxaEntrega = taxaEscolhida.taxa;
    }
  }

  const subtotal = itens.reduce((soma, item) => soma + (Number(item.preco) || 0) * (Number(item.quantidade) || 0), 0);
  const total = subtotal + taxaEntrega;

  const novoPedido = {
    id: Date.now().toString(),
    cliente: req.body.cliente || '',
    telefone: req.body.telefone || '',
    endereco: req.body.endereco || '',
    itens,
    bairroEntrega,
    taxaEntrega,
    subtotal,
    total,
    observacoes: req.body.observacoes || '',
    status: 'pendente',
    dataCriacao: new Date().toISOString()
  };
  pedidos.push(novoPedido);
  salvarJSON(PEDIDOS_FILE, pedidos);
  io.emit('pedidos:atualizados', pedidos);
  res.status(201).json(novoPedido);
});

app.put('/api/pedidos/:id', (req, res) => {
  const pedidos = lerJSON(PEDIDOS_FILE, []);
  const idx = pedidos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Pedido não encontrado' });
  pedidos[idx] = { ...pedidos[idx], ...req.body };
  salvarJSON(PEDIDOS_FILE, pedidos);
  io.emit('pedidos:atualizados', pedidos);
  res.json(pedidos[idx]);
});

app.delete('/api/pedidos/:id', (req, res) => {
  let pedidos = lerJSON(PEDIDOS_FILE, []);
  pedidos = pedidos.filter(p => p.id !== req.params.id);
  salvarJSON(PEDIDOS_FILE, pedidos);
  io.emit('pedidos:atualizados', pedidos);
  res.status(204).end();
});

/* ---------- SOCKET ---------- */

io.on('connection', (socket) => {
  socket.emit('pedidos:atualizados', lerJSON(PEDIDOS_FILE, []));
  socket.emit('produtos:atualizados', lerJSON(PRODUTOS_FILE, []));
  socket.emit('taxas:atualizadas', lerJSON(TAXAS_FILE, []));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
