# 🚀 Guia Rápido - FinanControl

## Para começar AGORA (5 minutos)

### 1️⃣ Criar Projeto Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: `financontrol-[seu-nome]`
4. Desabilite Google Analytics (não é necessário)
5. Clique em "Criar projeto"

### 2️⃣ Ativar Autenticação

1. No menu lateral, clique em "Authentication"
2. Clique em "Vamos começar"
3. Em "Provedores de login", clique em "E-mail/senha"
4. Ative a primeira opção (E-mail/senha)
5. Clique em "Salvar"

### 3️⃣ Criar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Começar no modo de produção"
4. Escolha uma localização (sugestão: southamerica-east1)
5. Clique em "Ativar"

### 4️⃣ Configurar Regras de Segurança

1. Ainda em "Firestore Database", clique na aba "Regras"
2. Substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Clique em "Publicar"

### 5️⃣ Pegar Credenciais

1. Clique no ícone de engrenagem ⚙️ (ao lado de "Visão geral do projeto")
2. Clique em "Configurações do projeto"
3. Role até "Seus aplicativos"
4. Clique no ícone `</>`(Web)
5. Apelido do app: "FinanControl"
6. NÃO marque Firebase Hosting
7. Clique em "Registrar app"
8. **COPIE** o objeto `firebaseConfig`

### 6️⃣ Configurar App

1. Abra o arquivo `js/firebase-config.js`
2. Substitua as credenciais:

```javascript
const firebaseConfig = {
    apiKey: "cole-aqui",
    authDomain: "cole-aqui",
    projectId: "cole-aqui",
    storageBucket: "cole-aqui",
    messagingSenderId: "cole-aqui",
    appId: "cole-aqui"
};
```

### 7️⃣ Testar Localmente

#### Opção A - Python (mais fácil)
```bash
cd financontrol
python -m http.server 8000
```

Acesse: http://localhost:8000

#### Opção B - Node.js
```bash
cd financontrol
npx serve
```

#### Opção C - VS Code
Instale a extensão "Live Server" e clique em "Go Live"

### 8️⃣ Criar Primeira Conta

1. Na tela de login, clique em "Registrar"
2. Digite seu e-mail e senha
3. Clique em "Criar Conta"
4. Pronto! Você está dentro! 🎉

---

## 🎯 Primeiros Passos no App

### 1. Adicione uma Conta Bancária
- Dashboard > "Adicionar" em Contas Bancárias
- Nome: "Conta Corrente"
- Banco: "Nubank"
- Saldo: 1000
- Cor: Escolha uma cor

### 2. Adicione um Cartão
- Dashboard > "Adicionar" em Cartões de Crédito
- Nome: "Nubank Mastercard"
- Limite: 5000
- Fechamento: dia 10
- Vencimento: dia 17

### 3. Registre uma Transação
- Menu > Transações > "Nova Transação"
- Tipo: Despesa
- Descrição: "Almoço"
- Valor: 35.00
- Categoria: Alimentação
- Conta: Escolha uma

### 4. Defina um Orçamento
- Menu > Orçamento > "Definir Orçamento"
- Categoria: Alimentação
- Valor: 500.00

### 5. Crie um Lembrete
- Menu > Lembretes > "Novo Lembrete"
- Descrição: "Conta de luz"
- Valor: 150.00
- Vencimento: Próxima semana

---

## 📱 Instalar como App

### No Celular (Android/iOS)
1. Abra no navegador (Chrome/Safari)
2. Menu (⋮) > "Adicionar à tela inicial"
3. Confirme
4. Ícone aparecerá na tela inicial! 🎊

### No Computador (Chrome/Edge)
1. Abra no navegador
2. Procure o ícone de instalação na barra de endereço
3. Clique em "Instalar"
4. App instalado! 🎊

---

## 🆘 Problemas Comuns

### "Erro ao fazer login"
- Verifique se ativou Authentication no Firebase
- Confirme se as credenciais estão corretas

### "Nenhum dado aparece"
- Verifique se as regras do Firestore estão corretas
- Abra o console do navegador (F12) e veja os erros

### "Service Worker não registra"
- Use um servidor HTTP (não abra o arquivo diretamente)
- Limpe o cache do navegador

### "Dados não sincronizam"
- Verifique sua conexão com internet
- Veja se o Firestore está ativo no Firebase Console

---

## 🎨 Personalizações Rápidas

### Mudar Cores
Edite `index.html`, linha do TailwindCSS:
- `indigo-600` → `blue-600` (azul)
- `indigo-600` → `purple-600` (roxo)
- `indigo-600` → `green-600` (verde)

### Adicionar Categorias
Edite `js/app.js`, na linha ~20:
```javascript
categories: {
    expense: ['Alimentação', 'SuaCategoria', ...],
    income: ['Salário', 'SuaCategoria', ...]
}
```

---

## 🚀 Deploy Grátis

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Seu app estará em: `https://seu-projeto.web.app`

### Vercel (mais fácil)
1. Acesse: https://vercel.com
2. Conecte com GitHub
3. Importe seu repositório
4. Deploy automático! ✨

---

## 💡 Dicas

- 📊 Use gráficos para visualizar seus gastos
- 💰 Configure orçamentos mensais para controlar gastos
- 🔔 Ative lembretes para não perder vencimentos
- 📱 Instale como PWA para acesso rápido
- 🔄 Dados sincronizam automaticamente entre dispositivos

---

**Dúvidas?** Abra o console do navegador (F12) e veja se há erros!
