# 🚀 Como publicar o sistema de graça (passo a passo)

Este guia é para quem **nunca fez deploy**. Vamos colocar o sistema no ar usando 3 serviços gratuitos:

| Parte | Serviço | O que faz |
|---|---|---|
| 🗄️ Banco de dados | **Neon** | Guarda os dados (Postgres grátis) |
| ⚙️ Backend (API) | **Render** | Roda o FastAPI (a "cozinha" do sistema) |
| 🎨 Frontend (tela) | **Vercel** | Mostra a interface React pro usuário |

> ⏱️ Tempo estimado: 30–40 minutos. Você vai criar 3 contas gratuitas (pode usar login com GitHub/Google nas três).

A ordem importa! Faça **Neon → Render → Vercel → ajuste final**. Por quê? O frontend precisa saber o endereço do backend, e o backend precisa saber o endereço do frontend. Seguindo essa ordem, a gente encaixa tudo certinho.

---

## ✅ Passo 0 — Colocar o código no GitHub

Os três serviços publicam a partir de um repositório no GitHub. Se o seu código ainda não está lá:

1. Crie uma conta em https://github.com (se ainda não tiver).
2. Crie um repositório novo (botão **New**), por exemplo `escala-midia`. Deixe **vazio** (sem README).
3. No terminal, dentro da pasta do projeto (`D:\Midia`), rode:

```bash
git add .
git commit -m "Preparar para deploy"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/escala-midia.git
git push -u origin main
```

> Troque `SEU_USUARIO` pelo seu usuário do GitHub. Se pedir login, use seu usuário e um **token** (GitHub não aceita mais senha) — crie em https://github.com/settings/tokens.

✔️ **Resultado:** seu código aparece no GitHub. Agora os serviços conseguem enxergá-lo.

---

## 🗄️ Passo 1 — Banco de dados no Neon

1. Acesse https://neon.tech e clique em **Sign up** (pode entrar com o GitHub).
2. Crie um projeto (**Create project**). Dê um nome, ex.: `escala`. Pode deixar a região padrão.
3. Assim que criar, o Neon mostra uma **Connection string**. Vai ser algo assim:

   ```
   postgresql://usuario:senha@ep-xxxx.sa-east-1.aws.neon.tech/escala?sslmode=require
   ```

4. **Copie** essa string e guarde no bloco de notas. Você vai **trocar uma parte dela**:
   - Onde está `postgresql://` → troque por **`postgresql+psycopg://`**
   - O resto fica igual (incluindo o `?sslmode=require` no final).

   Ficará assim:
   ```
   postgresql+psycopg://usuario:senha@ep-xxxx.sa-east-1.aws.neon.tech/escala?sslmode=require
   ```

✔️ **Resultado:** você tem a `DATABASE_URL` pronta. Guarde-a — vamos usar no Render.

---

## ⚙️ Passo 2 — Backend no Render

1. Acesse https://render.com e clique em **Get Started** (entre com o GitHub).
2. No painel, clique em **New +** → **Blueprint**.
3. Conecte seu repositório `escala-midia`. O Render vai **ler o arquivo `render.yaml`** que já está no projeto e propor criar o serviço `escala-backend`.
4. Ele vai pedir alguns valores (porque são segredos). Preencha:

   | Campo | O que colocar |
   |---|---|
   | `DATABASE_URL` | a string do Neon do Passo 1 (com `postgresql+psycopg://`) |
   | `ADMIN_PASSWORD` | uma senha forte sua (será a senha de login no sistema) |
   | `CORS_ORIGINS` | deixe **temporariamente** assim: `["http://localhost:5173"]` (ajustamos no Passo 4) |

   > `JWT_SECRET` o Render gera sozinho. `ADMIN_USERNAME` já vem como `admin`.

5. Clique em **Apply** / **Create**. O Render vai construir e subir o backend (demora alguns minutos na primeira vez).
6. Quando terminar, no topo da página do serviço aparece a URL pública, algo como:
   ```
   https://escala-backend.onrender.com
   ```
7. Teste: abra `https://escala-backend.onrender.com/health` no navegador. Tem que aparecer `{"status":"ok"}`.

> 💤 **Importante:** no plano grátis, o backend "dorme" depois de ~15 min sem uso. No primeiro acesso depois disso, ele demora ~30–50s pra "acordar". É normal.

✔️ **Resultado:** backend no ar. Guarde a URL (`https://escala-backend.onrender.com`).

---

## 🎨 Passo 3 — Frontend na Vercel

1. Acesse https://vercel.com e clique em **Sign Up** (entre com o GitHub).
2. No painel, clique em **Add New...** → **Project**.
3. Encontre o repositório `escala-midia` e clique em **Import**.
4. Agora a parte mais importante da configuração:
   - **Root Directory:** clique em **Edit** e selecione a pasta **`frontend`**. (Isso diz pra Vercel que o site está dentro dessa subpasta.)
   - **Framework Preset:** ela deve detectar **Vite** sozinha. Se não, selecione Vite.
   - **Build Command** e **Output Directory:** deixe o padrão (`npm run build` e `dist`).
5. Abra a seção **Environment Variables** e adicione uma:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** a URL do backend do Render, **sem barra no final**, ex.: `https://escala-backend.onrender.com`
6. Clique em **Deploy**. Em ~1 minuto ela publica.
7. A Vercel mostra a URL do seu site, algo como:
   ```
   https://escala-midia.vercel.app
   ```

✔️ **Resultado:** o site está no ar! Mas ainda não vai logar — falta liberar a conversa entre frontend e backend. É o próximo passo.

---

## 🔗 Passo 4 — Ligar os dois (CORS)

Por segurança, o backend só aceita pedidos de endereços que você autorizar. Vamos autorizar a URL da Vercel.

1. Volte ao **Render** → seu serviço `escala-backend` → aba **Environment**.
2. Edite a variável **`CORS_ORIGINS`** e coloque a URL da Vercel **dentro de colchetes e aspas, sem barra no final**:
   ```
   ["https://escala-midia.vercel.app"]
   ```
   > ⚠️ Tem que ser exatamente esse formato (é uma lista JSON). Use a **sua** URL real da Vercel.
3. Salve. O Render reinicia o backend sozinho (aguarde ~1 min).

✔️ **Resultado:** frontend e backend conversando.

---

## 🎉 Passo 5 — Testar

1. Abra a URL da Vercel (`https://escala-midia.vercel.app`).
2. Vai cair na tela de **login**.
3. Entre com:
   - **Usuário:** `admin`
   - **Senha:** a que você definiu no `ADMIN_PASSWORD` (Passo 2).

> Se der erro no primeiro clique, pode ser o backend "acordando" (passo 2, aviso do soninho). Espere ~30s e tente de novo.

Pronto — está no ar e de graça! 🥳

---

## 🔄 Como atualizar depois

Sempre que você mudar o código e der `git push`, **Render e Vercel publicam automaticamente** a nova versão. Não precisa repetir nada deste guia.

## ❓ Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Login dá erro de "rede"/CORS | `CORS_ORIGINS` errado | Confira o formato `["https://...vercel.app"]`, sem barra final, com a URL exata |
| Primeira chamada muito lenta | Backend dormindo (plano free) | Normal; espere ~30–50s |
| `/health` não responde | Backend não subiu | Veja os **Logs** no Render; cheque se a `DATABASE_URL` tem `postgresql+psycopg://` |
| Página em branco / 404 ao recarregar | Falta o `vercel.json` | Ele já está no projeto; confirme que o **Root Directory** na Vercel é `frontend` |
| Não loga, senha "errada" | `ADMIN_PASSWORD` diferente | Confira a variável no Render |
