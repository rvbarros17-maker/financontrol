# FinanControl 💰

Aplicativo de controle financeiro pessoal completo com PWA.

## 📋 Funcionalidades

### ✅ Contas Bancárias
- Cadastro de múltiplas contas
- Visualização de saldos
- Cores personalizadas

### 💳 Cartões de Crédito
- Controle de limite e gastos
- Datas de fechamento e vencimento
- Visualização de fatura atual

### 📊 Transações
- Registro de receitas e despesas
- Categorização automática
- Filtros avançados
- Histórico completo

### 📅 Orçamento Mensal
- Definição de metas por categoria
- Acompanhamento em tempo real
- Alertas de gastos

### 🔔 Lembretes de Vencimento
- Notificações de contas a pagar
- Controle de vencimentos
- Alertas antecipados

### 📈 Relatórios
- Gráficos de despesas por categoria
- Evolução mensal de receitas/despesas
- Análise de patrimônio

## 🚀 Instalação

### 1. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto (ou use um existente)
3. Ative **Authentication** (Email/Password)
4. Ative **Firestore Database**
5. Copie as credenciais do projeto

### 2. Configurar o App

Edite o arquivo `js/firebase-config.js` e substitua com suas credenciais:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "sua-app-id"
};
```

### 3. Regras do Firestore

Configure as seguintes regras de segurança no Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Contas e Cartões
    match /accounts/{accountId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Transações
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Orçamentos
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Lembretes
    match /reminders/{reminderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Criar Índices no Firestore

Crie os seguintes índices compostos:

**Collection: transactions**
- userId (Ascending) + date (Descending)

**Collection: reminders**
- userId (Ascending) + dueDate (Ascending)

**Collection: budgets**
- userId (Ascending) + month (Ascending)

### 5. Deploy

Você pode hospedar no:

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
Arraste a pasta para o [Netlify Drop](https://app.netlify.com/drop)

## 📱 Instalação como PWA

### Android/iOS
1. Abra o app no navegador
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"

### Desktop (Chrome/Edge)
1. Abra o app no navegador
2. Clique no ícone de instalação na barra de endereço
3. Clique em "Instalar"

## 🎨 Estrutura do Projeto

```
financontrol/
├── index.html              # Página principal
├── manifest.json           # Configuração PWA
├── sw.js                   # Service Worker
├── js/
│   ├── firebase-config.js  # Configuração Firebase
│   ├── auth.js            # Sistema de autenticação
│   └── app.js             # Lógica principal
├── css/                   # Estilos customizados (se necessário)
└── images/               # Ícones do app
```

## 🗄️ Estrutura de Dados

### Accounts (Contas e Cartões)
```javascript
{
  userId: string,
  name: string,
  type: 'bank' | 'card',
  // Para contas bancárias
  bank: string,
  balance: number,
  // Para cartões
  brand: string,
  limit: number,
  closingDay: number,
  dueDay: number,
  currentSpent: number,
  // Comum
  color: string,
  createdAt: timestamp
}
```

### Transactions
```javascript
{
  userId: string,
  type: 'income' | 'expense',
  description: string,
  amount: number,
  category: string,
  accountId: string,
  date: string,
  notes: string,
  createdAt: timestamp
}
```

### Budgets
```javascript
{
  userId: string,
  month: string,        // YYYY-MM
  category: string,
  amount: number,
  createdAt: timestamp
}
```

### Reminders
```javascript
{
  userId: string,
  description: string,
  amount: number,
  dueDate: string,      // YYYY-MM-DD
  createdAt: timestamp
}
```

## 🔒 Segurança

- ✅ Autenticação obrigatória
- ✅ Dados isolados por usuário
- ✅ Regras de segurança no Firestore
- ✅ Validação client-side e server-side

## 🛠️ Tecnologias

- **Frontend**: HTML5, TailwindCSS, JavaScript (ES6+)
- **Backend**: Firebase (Auth + Firestore)
- **Gráficos**: Chart.js
- **Icons**: Font Awesome
- **PWA**: Service Worker + Web App Manifest

## 📝 TODO / Próximas Features

- [ ] Importar/Exportar dados (CSV, JSON)
- [ ] Backup automático
- [ ] Metas financeiras
- [ ] Investimentos
- [ ] Múltiplas moedas
- [ ] Dark mode
- [ ] Notificações push
- [ ] Integração com bancos (Open Banking)
- [ ] Relatórios em PDF
- [ ] Modo família (compartilhamento)

## 📄 Licença

Projeto pessoal - Uso livre

## 👨‍💻 Desenvolvido por

Rafa - CEO Totaliz

---

**Dica**: Para melhor experiência, instale como PWA no seu dispositivo!
