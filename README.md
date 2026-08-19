# AutoRetoma

**Carros baratos. Estado transparente. Diretos do stand.**

Marketplace português de retomas e carros usados de baixo valor vendidos por stands
profissionais. A diferenciação é a transparência: antes de contactar o vendedor, o
comprador vê o que está bem, o que precisa de reparação, que defeitos são conhecidos,
se a inspeção é válida e quem é o stand responsável.

MVP funcional — sem pagamentos, financiamento ou compra online. O contacto e a venda
acontecem diretamente entre comprador e stand.

---

## Índice

- [Stack](#stack)
- [Instalação](#instalação)
- [Contas de demonstração](#contas-de-demonstração)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Base de dados](#base-de-dados)
- [Fluxo funcional](#fluxo-funcional)
- [Segurança e privacidade](#segurança-e-privacidade)
- [SEO](#seo)
- [Publicação](#publicação)
- [Notas jurídicas](#notas-jurídicas)
- [Fora do âmbito deste MVP](#fora-do-âmbito-deste-mvp)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Linguagem | TypeScript (modo estrito) |
| Estilos | Tailwind CSS |
| Base de dados | PostgreSQL via Supabase |
| Autenticação | Supabase Auth (email + palavra-passe) |
| Imagens | Supabase Storage (buckets `listings` e `logos`) |
| Validação | Zod — no cliente e no servidor |
| Segurança | Row Level Security em todas as tabelas |

---

## Instalação

### Requisitos

- Node.js 18.18 ou superior
- Conta Supabase (ou [Supabase CLI](https://supabase.com/docs/guides/local-development)
  com Docker, para desenvolvimento local)

### 1. Dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencher com os valores do projeto Supabase (Dashboard → Project Settings → API):

| Variável | Onde obter |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave `anon` / `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` — **apenas no servidor** |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` em desenvolvimento, `https://autoretoma.pt` em produção |
| `LEAD_IP_SALT` | Valor aleatório longo — `openssl rand -hex 32` |

A chave `service_role` nunca deve ser prefixada com `NEXT_PUBLIC_`. O módulo que a
consome (`src/lib/supabase/admin.ts`) importa `server-only`, o que faz o build falhar
caso seja acidentalmente importado num componente de cliente.

### 3. Base de dados

**Opção A — Supabase local (requer Docker):**

```bash
npx supabase start
```

```bash
npx supabase db reset
```

O `db reset` aplica as migrações de `supabase/migrations/` e executa `supabase/seed.sql`
com os dados de demonstração.

**Opção B — projeto Supabase alojado:**

```bash
npx supabase link --project-ref <project-ref>
```

```bash
npx supabase db push
```

Para carregar os dados de demonstração, executar o conteúdo de `supabase/seed.sql` no
SQL Editor do dashboard. Em produção, omitir este passo.

### 4. Arrancar

```bash
npm run dev
```

Disponível em <http://localhost:3000>.

---

## Contas de demonstração

Criadas por `supabase/seed.sql`. Palavra-passe comum: **`demo12345`**

| Perfil | Email | Acesso |
|---|---|---|
| Administrador | `admin@autoretoma.demo` | `/admin` |
| Stand (Braga) | `stand.norte@autoretoma.demo` | `/painel` |
| Stand (Lisboa) | `stand.lisboa@autoretoma.demo` | `/painel` |
| Stand (Faro) | `stand.algarve@autoretoma.demo` | `/painel` |

Os três stands e as dez viaturas são fictícios e estão marcados como demonstração na
interface. Não correspondem a stands reais nem a pessoas reais. As imagens são
marcadores gráficos gerados (`public/demo/`), não fotografias.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/                  Entrar e registo de stand
│   ├── admin/                   Painel administrativo
│   ├── carros/                  Pesquisa, anúncio e páginas por faceta
│   ├── painel/                  Painel do stand
│   ├── <páginas legais>/        Termos, privacidade, cookies, etc.
│   ├── robots.ts / sitemap.ts   SEO técnico
│   └── layout.tsx
├── components/
│   ├── listing/                 Galeria, estado da viatura, contacto
│   ├── painel/                  Formulário de publicação em 6 passos
│   └── search/                  Filtros, pesquisa, paginação
└── lib/
    ├── supabase/                Clientes (browser, servidor, service role)
    ├── auth.ts                  Sessão e verificação de papéis
    ├── constants.ts             Distritos, estados, etiquetas
    ├── queries.ts               Consultas públicas
    ├── types.ts                 Tipos do esquema
    └── validation.ts            Schemas Zod

supabase/
├── migrations/
│   ├── 00001_schema.sql         Tabelas, enums, triggers e regras de estado
│   ├── 00002_rls.sql            Row Level Security e privilégios
│   └── 00003_storage.sql        Buckets e políticas de upload
└── seed.sql                     Dados de demonstração
```

---

## Base de dados

### Tabelas

| Tabela | Função |
|---|---|
| `profiles` | Papel do utilizador (`stand` ou `admin`), criado por trigger no registo |
| `stands` | Vendedores profissionais e respetivo estado de verificação |
| `brands` / `models` | Marcas e modelos, geridos pelo administrador |
| `listings` | Anúncios, com todo o ciclo de vida de estados |
| `listing_conditions` | Estado das 9 áreas da viatura |
| `listing_issues` | Problemas declarados, com gravidade, foto e estimativa |
| `listing_photos` | Fotografias, com categoria e marcação de defeito |
| `leads` | Pedidos de contacto, ligados ao anúncio e ao stand |
| `platform_settings` | Preço máximo, mínimo de fotografias, limiar das facetas |
| `admin_audit_log` | Registo das ações administrativas |

### Estados

**Stand:** `pendente` → `aprovado` · `suspenso` · `rejeitado`

**Anúncio:**

```
rascunho ──> em_analise ──> publicado ──> reservado
    ^            │              │            │
    │            v              └────────────┴──> vendido ──> arquivado
    └── alteracoes_necessarias
                 │
                 └──> rejeitado
```

As transições são validadas por trigger na base de dados, não apenas na aplicação. Um
stand não consegue publicar diretamente, destacar anúncios, alterar o seu próprio estado
de verificação nem submeter um anúncio sem preço, sem localização ou acima do limite da
plataforma — mesmo com um pedido forjado.

### Regras de acesso (RLS)

- O público lê apenas anúncios `publicado`, `reservado` ou `vendido` de stands aprovados.
- Cada stand vê e edita apenas os seus anúncios e os seus contactos.
- Os leads não têm política de inserção: só entram pela server action, que corre no
  servidor com `service_role` e aplica limitação de pedidos.
- O administrador acede a tudo; as suas ações ficam registadas em `admin_audit_log`.
- No Storage, cada utilizador só escreve na pasta com o seu próprio `id`.

O esquema, o comportamento dos triggers e as políticas RLS foram verificados contra
PostgreSQL (ver [Verificação](#verificação)).

---

## Fluxo funcional

1. **Registo** — O stand regista-se em `/registar` com dados da empresa, NIF e
   responsável. A conta fica **a aguardar verificação**.
2. **Aprovação** — O administrador aprova em `/admin/stands`.
3. **Publicação** — O stand cria o anúncio em `/painel/anuncios/novo`, num formulário
   de seis passos:
   1. Identificação da viatura
   2. Características técnicas
   3. Estado e problemas conhecidos
   4. Fotografias
   5. Preço e localização
   6. Pré-visualização e submissão

   São exigidas no mínimo 8 fotografias, incluindo as sete categorias obrigatórias
   (frontal, traseira, duas laterais, interior, quadrante com quilómetros e motor).
   As imagens são redimensionadas no browser antes do upload.
4. **Moderação** — Nenhum anúncio é publicado automaticamente. O administrador aprova,
   pede alterações (com motivo obrigatório) ou rejeita em `/admin/anuncios`.
5. **Pesquisa** — O anúncio aparece em `/carros`, com filtros por marca, modelo, preço,
   ano, quilómetros, combustível, caixa, distrito, inspeção válida, estado do veículo e
   "apenas carros sem problemas mecânicos graves", ordenação e paginação.
6. **Contacto** — O comprador contacta o stand por telefone, WhatsApp, email ou
   formulário. O lead fica associado ao anúncio e ao stand.
7. **Gestão** — O lead aparece em `/painel/contactos` e em `/admin/leads`. O stand marca
   a viatura como reservada ou vendida.

---

## Segurança e privacidade

- Rotas privadas protegidas por middleware; o papel de administrador é verificado
  no servidor, no layout de `/admin`.
- Validação com Zod no cliente e repetida no servidor, em todas as server actions.
- Leads: consentimento RGPD obrigatório, campo honeypot, limite de 5 pedidos por hora
  por IP e bloqueio de pedidos repetidos ao mesmo anúncio em 24 horas.
- O endereço IP é guardado apenas como hash com sal (`LEAD_IP_SALT`), nunca em claro.
- Uploads limitados a JPEG, PNG e WebP, com limite de tamanho imposto pelo bucket, e
  compressão no cliente antes do envio.
- Aviso de cookies; nesta fase só são usados cookies estritamente necessários.
- Ações administrativas registadas em `admin_audit_log`, consultáveis em `/admin/registo`.

---

## SEO

- URLs amigáveis: `/carros/opel-corsa-2004-guimaraes-2450`
- Títulos, descrições e canonicals únicos por página
- `sitemap.xml` e `robots.txt` gerados dinamicamente
- Open Graph e Twitter Card
- Dados estruturados JSON-LD (`Car`, `Offer`, `BreadcrumbList`)
- Páginas indexáveis por marca, distrito e combustível, criadas apenas quando existirem
  anúncios suficientes (limiar configurável em `/admin/definicoes`)
- Imagens otimizadas com `next/image`

O domínio canónico é definido por `NEXT_PUBLIC_SITE_URL`.

---

## Publicação

### Vercel

1. Importar o repositório na Vercel.
2. Definir as variáveis de ambiente do `.env.example`, com
   `NEXT_PUBLIC_SITE_URL=https://autoretoma.pt`.
3. Aplicar as migrações ao projeto Supabase de produção:

```bash
npx supabase db push
```

4. No Supabase, em Authentication → URL Configuration, definir o Site URL para
   `https://autoretoma.pt` e ativar a confirmação de email.
5. Não carregar `seed.sql` em produção.

### Verificação

```bash
npm run typecheck
```

```bash
npm run build
```

O esquema SQL foi validado executando as migrações e o seed contra PostgreSQL, incluindo
testes ao comportamento dos triggers de transição de estado e às políticas RLS (leitura
pública restrita a anúncios publicados, isolamento entre stands, impossibilidade de
inserir leads sem passar pelo servidor).

---

## Notas jurídicas

> **O conteúdo jurídico deste projeto é provisório e deve ser revisto por advogado
> inscrito na Ordem dos Advogados portuguesa antes do lançamento público.**

A AutoRetoma é apresentada como plataforma intermediária de divulgação e contacto. Não é
proprietária dos veículos nem vendedora; o contrato de compra e venda é celebrado
diretamente entre o comprador e o stand.

Os bens móveis usados vendidos por um profissional a um consumidor têm garantia legal,
podendo o prazo de três anos ser reduzido para 18 meses mediante acordo entre as partes.
A declaração de defeitos num anúncio informa o comprador mas **não elimina os direitos
legais do consumidor**. Não são admitidas expressões como "sem garantia", "não se aceitam
reclamações", "vendido como está e sem qualquer responsabilidade" ou "o comprador renuncia
aos seus direitos".

Páginas provisórias incluídas: termos e condições, política de privacidade, política de
cookies, informação sobre vendedores profissionais, resolução alternativa de litígios,
Livro de Reclamações e contactos.

Antes do lançamento é ainda necessário publicar os dados de identificação da entidade que
explora a plataforma (denominação social, NIF e sede) nas páginas de contactos e de
privacidade.

---

## Fora do âmbito deste MVP

Aplicação móvel · pagamentos online · financiamento · leilões · chat interno ·
avaliações públicas dos stands · publicação por particulares · inteligência artificial ·
comparador complexo · sistema de comissões · planos pagos · notificações avançadas.

Estas funcionalidades só serão consideradas depois de existir utilização real.
