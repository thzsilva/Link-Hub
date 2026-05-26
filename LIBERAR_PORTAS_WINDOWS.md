# 🔓 Como Liberar Portas no Windows

## Método 1: PowerShell (Recomendado - Mais Rápido)

### 1️⃣ Encontrar o processo usando a porta

```powershell
netstat -ano | findstr :NUMERO_PORTA
```

**Exemplo para porta 3000:**
```powershell
netstat -ano | findstr :3000
```

**Saída esperada:**
```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    21888
```

O número no final (21888) é o **PID (Process ID)**.

### 2️⃣ Matar o processo

```powershell
Stop-Process -Id PID -Force
```

**Exemplo:**
```powershell
Stop-Process -Id 21888 -Force
```

### 3️⃣ Verificar se a porta foi liberada

```powershell
netstat -ano | findstr :3000
```

Se não retornar nada com "LISTENING", a porta está livre! ✅

---

## Método 2: Gerenciador de Tarefas (GUI)

1. Abra **Gerenciador de Tarefas** (`Ctrl + Shift + Esc`)
2. Vá para a aba **Detalhes**
3. Encontre o processo pelo **PID** (coluna da direita)
4. Clique com botão direito → **Finalizar Tarefa**

---

## Método 3: Procurar por Nome do Processo

Se sabe o nome do processo (ex: `node`, `npm`):

```powershell
Get-Process node | Stop-Process -Force
```

Isso matará **todos** os processos Node.js. Use com cuidado!

---

## 🚀 Atalho: Liberar Múltiplas Portas de Uma Vez

```powershell
# Liberar portas 3000 e 3001
$portas = @(3000, 3001)
foreach ($porta in $portas) {
    $pid = (netstat -ano | findstr ":$porta" | findstr "LISTENING").Split()[4]
    if ($pid) {
        Write-Host "Matando processo $pid na porta $porta..."
        Stop-Process -Id $pid -Force
    }
}
```

---

## ⚠️ Dicas Importantes

### Executar PowerShell como Administrador
- Clique com botão direito em **PowerShell**
- Selecione **Executar como Administrador**
- Se pedir confirmação (UAC), clique **Sim**

### Portas Comuns de Desenvolvimento
- **3000**: React, Next.js, frontend local
- **3001**: Backend local, servidor Node.js
- **5000**: Flask, Python
- **8080**: Servidores diversos
- **8000**: Django

### Ver TODAS as portas em uso
```powershell
netstat -ano
```

### Ver apenas conexões LISTENING
```powershell
netstat -ano | findstr LISTENING
```

---

## 🔄 Reiniciar o Servidor

Após liberar a porta:

```bash
# Na pasta do projeto
cd artifacts/void
npm run dev
```

---

## ✅ Checklist Rápido

- [ ] Abrir PowerShell como **Administrador**
- [ ] Encontrar PID: `netstat -ano | findstr :3000`
- [ ] Matar processo: `Stop-Process -Id PID -Force`
- [ ] Verificar: `netstat -ano | findstr :3000` (sem saída = OK)
- [ ] Reiniciar servidor: `npm run dev`

---

## 🆘 Troubleshooting

### "Acesso Negado"
→ Abra PowerShell como **Administrador**

### "Processo não encontrado"
→ Porta já está livre! Tente rodar a aplicação

### Porta continua em uso depois de matar
→ Pode haver múltiplos processos. Repita o comando `Stop-Process` para cada PID encontrado

---

## 📌 Dica Pro: Usar Portas Diferentes

Se a porta está sempre em conflito, mude no código:

**Vite (frontend):**
```json
// vite.config.ts
export default {
  server: {
    port: 3002  // Mude para qualquer porta livre
  }
}
```

---

Criado em: 2026-05-26 | Atualizado: 2026-05-26
