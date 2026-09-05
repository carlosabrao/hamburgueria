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
const CONFIG_FILE = path.join(__dirname, 'config.json');

function lerJSON(file, padrao) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(padrao));
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function salvarJSON(file, dados) {
  fs.writeFileSync(file, JSON.stringify(dados, null, 2));
}

/* ---------- CONFIG (taxa de entrega, etc.) ---------- */

app.get('/api/config', (req, res) => {
  res.json(lerJSON(CONFIG_FILE, { taxaEntrega: 0 }));
});

app.put('/api/config', (req, res) => {
  const config = lerJSON(CONFIG_FILE, { taxaEntrega: 0 });
  const novaConfig = {
    ...config,
    taxaEntrega: req.body.taxaEntrega !== undefined ? Number(req.body.taxaEntrega) : config.taxaEntrega
  };
  salvarJSON(CONFIG_FILE, novaConfig);
  io.emit('config:atualizada', novaConfig);
  res.json(novaConfig);
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
// comEntrega: boolean (opcional)
app.post('/api/pedidos', (req, res) => {
  const pedidos = lerJSON(PEDIDOS_FILE, []);
  const config = lerJSON(CONFIG_FILE, { taxaEntrega: 0 });
  const itens = Array.isArray(req.body.itens) ? req.body.itens : [];
  const comEntrega = !!req.body.comEntrega;
  const taxaEntrega = comEntrega ? (config.taxaEntrega || 0) : 0;
  const subtotal = itens.reduce((soma, item) => soma + (Number(item.preco) || 0) * (Number(item.quantidade) || 0), 0);
  const total = subtotal + taxaEntrega;

  const novoPedido = {
    id: Date.now().toString(),
    cliente: req.body.cliente || '',
    telefone: req.body.telefone || '',
    endereco: req.body.endereco || '',
    itens,
    comEntrega,
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
  socket.emit('config:atualizada', lerJSON(CONFIG_FILE, { taxaEntrega: 0 }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
