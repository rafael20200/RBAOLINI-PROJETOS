# Área administrativa — RBAOLINI-PROJETOS

Este pacote acrescenta um painel administrativo ligado ao Supabase. O site continua estático no GitHub Pages; autenticação, banco e imagens ficam no Supabase.

## 1. Configurar o banco
1. Abra o projeto Supabase `kkvvtsjtyrxoiqcwcybl`.
2. Vá a **Authentication → Users → Add user** e crie o usuário administrador com seu e-mail e uma senha forte. Se houver a opção de confirmação de e-mail, confirme o usuário.
3. Abra **SQL Editor → New query**, copie e execute todo o conteúdo de `supabase/setup.sql`.
4. Em **Authentication → Users**, copie o UUID (ID) do usuário que acabou de criar.
5. No SQL Editor, execute, substituindo o texto pelo UUID real:
   ```sql
   insert into public.admin_users (user_id) values ('UUID-DO-USUARIO-AQUI');
   ```
6. Em **Storage → New bucket**, crie um bucket chamado `project-images` e marque **Public bucket**. As políticas de upload e gerenciamento já estão no SQL.

## 2. Publicar no GitHub
Envie para a raiz do repositório `rafael20200/RBAOLINI-PROJETOS` os arquivos deste pacote, mantendo as pastas. Se o GitHub perguntar se deseja substituir `portfolio.html`, confirme. O pacote inclui o site atual, a nova página `admin.html`, os scripts e o SQL.

A publicação do GitHub Pages ocorre após o commit. Endereços esperados:
- Site: `https://rafael20200.github.io/RBAOLINI-PROJETOS/`
- Painel: `https://rafael20200.github.io/RBAOLINI-PROJETOS/admin.html`

## 3. Usar o painel
Entre em `admin.html` com o e-mail e a senha criados no Supabase. Cadastre título, descrição, categoria, tecnologias, imagem, links e ordem. Marque **Publicar no site** para que o projeto apareça em `portfolio.html`.

## Segurança
- O arquivo `assets/js/supabase-config.js` contém apenas Project URL e publishable key. A chave publishable pode ser usada no navegador quando as políticas RLS estiverem ativas.
- Nunca coloque `service_role`, secret key ou senha do banco em HTML/JavaScript.
- As políticas SQL restringem inserção, edição, exclusão e upload a usuários cujo UUID esteja em `public.admin_users`.
- A lista pública só retorna projetos publicados. O site mantém os cards antigos como fallback até existir pelo menos um projeto publicado.

## Observações
- Este painel gerencia registros no Supabase; ele não faz commits automáticos no GitHub.
- O painel aceita imagens JPG, PNG e WebP de até 5 MB.
- O link de vídeo é exibido como link externo; não incorpora automaticamente o player.
