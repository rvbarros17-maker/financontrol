# 🚀 IMPORTANTE - Criar Índices no Firestore

## ⚡ Isso vai resolver a LENTIDÃO do app!

Os índices fazem as buscas no banco de dados ficarem **muito mais rápidas**.

---

## 📝 Como criar os índices:

### 1. Acesse o Firebase Console
https://console.firebase.google.com/

### 2. Selecione seu projeto
`financontrol-16ae8`

### 3. Vá em "Firestore Database"
Menu lateral esquerdo → **Cloud Firestore** → **Índices**

### 4. Clique em "Adicionar índice"

---

## 🔥 ÍNDICE 1 - Transações

- **ID da coleção**: `transactions`
- **Campos a indexar**:
  - Campo: `userId` | Modo: Crescente (Ascending)
  - Campo: `date` | Modo: Decrescente (Descending)
- **Status da consulta**: Ativado
- Clique em **CRIAR**

Aguarde alguns minutos até ficar "Ativado" (pode demorar 2-5 min)

---

## 🔥 ÍNDICE 2 - Lembretes

- **ID da coleção**: `reminders`
- **Campos a indexar**:
  - Campo: `userId` | Modo: Crescente (Ascending)
  - Campo: `dueDate` | Modo: Crescente (Ascending)
- **Status da consulta**: Ativado
- Clique em **CRIAR**

---

## 🔥 ÍNDICE 3 - Orçamentos

- **ID da coleção**: `budgets`
- **Campos a indexar**:
  - Campo: `userId` | Modo: Crescente (Ascending)
  - Campo: `month` | Modo: Crescente (Ascending)
- **Status da consulta**: Ativado
- Clique em **CRIAR**

---

## ✅ Pronto!

Depois que os 3 índices estiverem **"Ativados"** (verdinho ✓), o app vai ficar **MUITO mais rápido**!

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────┐
│ Índice 1: transactions                  │
│ ├─ userId (↑)                          │
│ └─ date (↓)                            │
├─────────────────────────────────────────┤
│ Índice 2: reminders                     │
│ ├─ userId (↑)                          │
│ └─ dueDate (↑)                         │
├─────────────────────────────────────────┤
│ Índice 3: budgets                       │
│ ├─ userId (↑)                          │
│ └─ month (↑)                           │
└─────────────────────────────────────────┘
```

**Legenda:**
- (↑) = Crescente (Ascending)
- (↓) = Decrescente (Descending)

---

## ❓ Perguntas Frequentes

**P: Quanto tempo demora?**
R: 2-5 minutos por índice. Pode criar os 3 ao mesmo tempo!

**P: Preciso fazer isso toda vez?**
R: Não! Só precisa criar UMA VEZ. Os índices ficam salvos.

**P: O que acontece se eu não criar?**
R: O app vai funcionar, mas vai ficar MUITO lento, especialmente quando tiver muitas transações.

**P: Tem custo?**
R: Não! Os índices são gratuitos no plano gratuito do Firebase.

---

**Dica**: Deixe essa janela aberta enquanto os índices são criados. Quando todos estiverem verdes, recarregue o app!
