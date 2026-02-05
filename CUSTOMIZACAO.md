# 🎨 Customização - FinanControl

## 🎯 Personalizações Fáceis (sem programação)

### 1. Mudar Cores do Tema

**Localização**: `index.html` (linha ~15 no `<style>`)

#### Cor Principal (Indigo → Sua Cor)
```css
/* Procure por: #4F46E5 */
/* Substitua por: */

Azul:    #3B82F6
Verde:   #10B981
Roxo:    #8B5CF6
Rosa:    #EC4899
Laranja: #F97316
```

#### Como fazer:
1. Abra `index.html` no editor
2. Ctrl+F → procure `#4F46E5`
3. Substituir tudo por sua cor favorita
4. Salve e recarregue

### 2. Adicionar/Remover Categorias

**Localização**: `js/app.js` (linha ~20)

```javascript
categories: {
    expense: [
        'Alimentação',
        'Transporte',
        'Moradia',
        'Saúde',
        'Educação',
        'Lazer',
        'Vestuário',
        'Telecomunicações',
        'Impostos',
        'Outros',
        // ← ADICIONE AQUI
        'Pets',
        'Academia',
        'Streaming'
    ],
    income: [
        'Salário',
        'Freelance',
        'Investimentos',
        'Vendas',
        'Outros',
        // ← ADICIONE AQUI
        'Bônus',
        'Comissão'
    ]
}
```

### 3. Mudar Nome do App

#### No HTML
**Arquivo**: `index.html`
```html
<!-- Linha ~5 -->
<title>Seu Nome Aqui - Controle Financeiro</title>

<!-- Linha ~32 -->
<h1 class="text-xl font-bold">Seu Nome Aqui</h1>
```

#### No Manifest (PWA)
**Arquivo**: `manifest.json`
```json
{
  "name": "Seu Nome Aqui - Controle Financeiro",
  "short_name": "Seu Nome",
  "description": "Sua descrição personalizada"
}
```

### 4. Personalizar Ícone do App

Substitua os arquivos em `/images/`:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

**Dica**: Use o Canva ou Figma para criar ícones personalizados!

### 5. Alterar Moeda

**Localização**: `js/app.js` (função `formatCurrency`, linha ~850)

```javascript
formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'  // ← MUDE AQUI
    }).format(value);
}
```

**Opções**:
- `BRL` - Real (R$)
- `USD` - Dólar ($)
- `EUR` - Euro (€)
- `GBP` - Libra (£)

---

## 🚀 Personalizações Avançadas

### 1. Adicionar Nova Funcionalidade de Relatório

**Exemplo**: Relatório de Gastos por Cartão

```javascript
// Em js/app.js, adicione:

async renderCardExpensesReport() {
    const cards = this.cards;
    const expenses = this.transactions.filter(t => t.type === 'expense');
    
    const cardData = {};
    cards.forEach(card => {
        cardData[card.name] = expenses
            .filter(e => e.accountId === card.id)
            .reduce((sum, e) => sum + e.amount, 0);
    });
    
    // Renderizar gráfico...
}
```

### 2. Adicionar Exportação para Excel

```javascript
// Adicione esta função em js/app.js:

async exportToExcel() {
    const data = this.transactions.map(t => ({
        Data: t.date,
        Descrição: t.description,
        Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
        Valor: t.amount,
        Categoria: t.category
    }));
    
    // Usar biblioteca como SheetJS para gerar Excel
    // npm install xlsx
}
```

### 3. Integrar com API de Cotações

```javascript
// Adicionar conversão automática de moedas:

async fetchExchangeRates() {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const rates = await response.json();
    this.exchangeRates = rates.rates;
}
```

### 4. Implementar Modo Escuro

```javascript
// Em index.html, adicione no <style>:

@media (prefers-color-scheme: dark) {
    body {
        background-color: #1F2937;
        color: #F9FAFB;
    }
    
    .bg-white {
        background-color: #374151 !important;
    }
    
    .text-gray-800 {
        color: #F9FAFB !important;
    }
}

// Ou adicione um toggle manual:
<button onclick="toggleDarkMode()">🌙</button>
```

### 5. Notificações Push de Vencimentos

```javascript
// No sw.js (Service Worker), adicione:

// Agendar notificação
async scheduleNotification(reminder) {
    const dueDate = new Date(reminder.dueDate);
    const now = new Date();
    const timeDiff = dueDate - now;
    
    if (timeDiff > 0 && timeDiff < 86400000) { // 24h
        setTimeout(() => {
            self.registration.showNotification('Vencimento Próximo!', {
                body: `${reminder.description} vence amanhã!`,
                icon: '/images/icon-192.png',
                badge: '/images/icon-192.png'
            });
        }, timeDiff - 86400000); // 1 dia antes
    }
}
```

### 6. Backup Automático

```javascript
// Adicione em js/app.js:

async createBackup() {
    const backup = {
        accounts: this.accounts,
        cards: this.cards,
        transactions: this.transactions,
        budgets: this.budgets,
        reminders: this.reminders,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financontrol-backup-${Date.now()}.json`;
    a.click();
}

// Botão no HTML:
<button onclick="app.createBackup()">📥 Fazer Backup</button>
```

### 7. Importar Dados de Arquivo

```javascript
async importFromFile(file) {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Importar para Firestore
            for (const account of data.accounts) {
                await addDoc(collection(db, 'accounts'), {
                    ...account,
                    userId: this.userId
                });
            }
            
            alert('Dados importados com sucesso!');
            this.loadData();
        } catch (error) {
            alert('Erro ao importar dados!');
        }
    };
    
    reader.readAsText(file);
}
```

---

## 🎨 Temas Pré-Configurados

### Tema Minimalista (Preto e Branco)
```css
/* Cores principais */
--primary: #000000;
--secondary: #FFFFFF;
--success: #4B5563;
--error: #6B7280;
--warning: #9CA3AF;
```

### Tema Natureza (Verde)
```css
--primary: #059669;
--secondary: #D1FAE5;
--success: #10B981;
--error: #DC2626;
--warning: #FBBF24;
```

### Tema Oceano (Azul)
```css
--primary: #0284C7;
--secondary: #E0F2FE;
--success: #06B6D4;
--error: #EF4444;
--warning: #F59E0B;
```

### Tema Sunset (Laranja/Rosa)
```css
--primary: #EA580C;
--secondary: #FFF7ED;
--success: #10B981;
--error: #DC2626;
--warning: #FBBF24;
```

---

## 📱 Customizar PWA

### Mudar Splash Screen
Edite `manifest.json`:
```json
{
  "background_color": "#SUA_COR_AQUI",
  "theme_color": "#SUA_COR_AQUI"
}
```

### Adicionar Atalhos (App Shortcuts)
```json
"shortcuts": [
  {
    "name": "Nova Transação",
    "url": "/#nova-transacao",
    "icons": [{ "src": "/images/icon-192.png", "sizes": "192x192" }]
  },
  {
    "name": "Ver Relatórios",
    "url": "/#relatorios",
    "icons": [{ "src": "/images/icon-192.png", "sizes": "192x192" }]
  }
]
```

---

## 🔧 Ferramentas Úteis

### Geradores de Cores
- Coolors.co - Paletas de cores
- Adobe Color - Harmonia de cores
- Colormind.io - IA para paletas

### Editores de Ícones
- Favicon.io - Criar favicons
- IconKitchen - Ícones para PWA
- Canva - Design completo

### Testes
- Lighthouse (Chrome DevTools) - Performance
- PageSpeed Insights - Velocidade
- BrowserStack - Compatibilidade

---

## 💡 Dicas Finais

1. **Sempre teste após mudanças** - Use F12 no navegador
2. **Faça backup antes de customizar** - Git ou cópia local
3. **Documente suas mudanças** - Comentários no código
4. **Use Git** - Controle de versão é essencial
5. **Compartilhe suas customizações** - Ajude outros usuários!

---

**Precisa de ajuda?** Veja o console do navegador (F12) para debugar!
