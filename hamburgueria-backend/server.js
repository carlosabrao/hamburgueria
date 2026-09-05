const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// CORS liberado (ajuste "origin" para seu domínio do Vercel em produção)
app.use(cors({ origin: '*' }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

const DB_FILE = path.join(__dirname, 'pedidos.json');

function lerPedidos() {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]');
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function salvarPedidos(pedidos) {
  fs.writeFileSync(DB_FILE, JSON.stringify(pedidos, null, 2));
}

// Listar pedidos
app.get('/api/pedidos', (req, res) => {
  res.json(lerPedidos());
});

// Criar pedido
app.post('/api/pedidos', (req, res) => {
  const pedidos = lerPedidos();
  const novoPedido = {
    id: Date.now().toString(),
    cliente: req.body.cliente || '',
    telefone: req.body.telefone || '',
    endereco: req.body.endereco || '',
    itens: req.body.itens || [],
    observacoes: req.body.observacoes || '',
    status: 'pendente', // pendente -> preparando -> pronto -> entregue
    dataCriacao: new Date().toISOString()
  };
  pedidos.push(novoPedido);
  salvarPedidos(pedidos);
  io.emit('pedidos:atualizados', pedidos);
  res.status(201).json(novoPedido);
});

// Atualizar status do pedido
app.put('/api/pedidos/:id', (req, res) => {
  const pedidos = lerPedidos();
  const idx = pedidos.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ erro: 'Pedido não encontrado' });
  pedidos[idx] = { ...pedidos[idx], ...req.body };
  salvarPedidos(pedidos);
  io.emit('pedidos:atualizados', pedidos);
  res.json(pedidos[idx]);
});

// Excluir pedido
app.delete('/api/pedidos/:id', (req, res) => {
  let pedidos = lerPedidos();
  pedidos = pedidos.filter(p => p.id !== req.params.id);
  salvarPedidos(pedidos);
  io.emit('pedidos:atualizados', pedidos);
  res.status(204).end();
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.emit('pedidos:atualizados', lerPedidos());

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
