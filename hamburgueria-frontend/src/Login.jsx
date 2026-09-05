import React, { useState } from 'react';
import { API_BASE, setSenha } from './api.js';

export default function Login({ onEntrar }) {
  const [senha, setSenhaLocal] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha })
      });
      if (res.ok) {
        setSenha(senha);
        onEntrar();
      } else {
        setErro('Senha incorreta.');
      }
    } catch {
      setErro('Não foi possível conectar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <form onSubmit={entrar} style={{ width: 280, textAlign: 'center' }}>
        <h1>🔥 Duo Brasa</h1>
        <p style={{ color: '#555', marginBottom: 16 }}>Digite a senha para acessar o sistema</p>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenhaLocal(e.target.value)}
          autoFocus
          style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10 }}
        />
        {erro && <p style={{ color: '#dc2626', fontSize: 13 }}>{erro}</p>}
        <button type="submit" disabled={carregando} style={{ width: '100%', padding: 10 }}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
