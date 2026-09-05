export const API_BASE = 'https://hamburgueria-production-ea67.up.railway.app';

const CHAVE_SENHA = 'duobrasa_senha';

export function getSenha() {
  return localStorage.getItem(CHAVE_SENHA) || '';
}
export function setSenha(senha) {
  localStorage.setItem(CHAVE_SENHA, senha);
}
export function limparSenha() {
  localStorage.removeItem(CHAVE_SENHA);
}

export async function apiFetch(caminho, options = {}) {
  const headers = {
    ...(options.headers || {}),
    'x-app-password': getSenha()
  };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${caminho}`, { ...options, headers });
  if (res.status === 401) {
    limparSenha();
    window.location.reload();
  }
  return res;
}
