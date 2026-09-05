import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import TelaCaixa from './TelaCaixa.jsx';
import TelaCozinha from './TelaCozinha.jsx';
import TelaProdutos from './TelaProdutos.jsx';
import TelaConfiguracoes from './TelaConfiguracoes.jsx';
import TelaFinancas from './TelaFinancas.jsx';
import Login from './Login.jsx';
import { API_BASE, getSenha, limparSenha } from './api.js';

const socket = io(API_BASE, { autoConnect: false });

export default function App() {
  const [autenticado, setAutenticado] = useState(!!getSenha());
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [taxasEntrega, setTaxasEntrega] = useState([]);
  const [tela, setTela] = useState('caixa'); // 'caixa' | 'cozinha' | 'produtos' | 'config' | 'financas'

  useEffect(() => {
    if (!autenticado) return;

    socket.auth = { senha: getSenha() };
    socket.connect();

    socket.on('pedidos:atualizados', (novosPedidos) => setPedidos(novosPedidos));
    socket.on('produtos:atualizados', (novosProdutos) => setProdutos(novosProdutos));
    socket.on('taxas:atualizadas', (novasTaxas) => setTaxasEntrega(novasTaxas));
    socket.on('connect_error', () => {
      // senha inválida ou expirada: força novo login
      limparSenha();
      setAutenticado(false);
    });

    return () => {
      socket.off('pedidos:atualizados');
      socket.off('produtos:atualizados');
      socket.off('taxas:atualizadas');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [autenticado]);

  function sair() {
    limparSenha();
    setAutenticado(false);
  }

  if (!autenticado) {
    return <Login onEntrar={() => setAutenticado(true)} />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>🔥 Duo Brasa</h1>
          <button onClick={sair}>Sair</button>
        </div>
        <nav style={{ marginBottom: 16 }}>
          <button onClick={() => setTela('caixa')} disabled={tela === 'caixa'}>💳 Caixa</button>{' '}
          <button onClick={() => setTela('cozinha')} disabled={tela === 'cozinha'}>👨‍🍳 Cozinha</button>{' '}
          <button onClick={() => setTela('produtos')} disabled={tela === 'produtos'}>📋 Produtos</button>{' '}
          <button onClick={() => setTela('config')} disabled={tela === 'config'}>⚙️ Configurações</button>{' '}
          <button onClick={() => setTela('financas')} disabled={tela === 'financas'}>💰 Finanças</button>
        </nav>
      </header>

      {tela === 'caixa' && <TelaCaixa pedidos={pedidos} produtos={produtos} taxasEntrega={taxasEntrega} />}
      {tela === 'cozinha' && <TelaCozinha pedidos={pedidos} />}
      {tela === 'produtos' && <TelaProdutos produtos={produtos} />}
      {tela === 'config' && <TelaConfiguracoes taxasEntrega={taxasEntrega} />}
      {tela === 'financas' && <TelaFinancas pedidos={pedidos} />}
    </div>
  );
}
