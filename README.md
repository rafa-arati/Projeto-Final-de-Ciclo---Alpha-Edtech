
# Rota Cultural - Projeto Final de Ciclo (Alpha EdTech)

[![Visite o Projeto](https://img.shields.io/badge/Visitar%20Projeto-Live%20Demo-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+Um90YSBDdWx0dXJhbCBJY29uPC90aXRsZT4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJBcnRib2FyZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIwLjAwMDAwMCwgLTIwLjAwMDAwMCkiIGZpbGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgIDxnIGlkPSJHcm91cCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjAuMDAwMDAwLCAyMC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxjaXJjbGUgaWQ9Ik92YWwiIGZpbGw9IiMxQjFCMUMiIGN4PSI0MCIgY3k9IjQwIiByPSI0MCI+PC9jaXJjbGU+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMzEuNDgzMjQ5Nyw1Ny4wMDkzMzgxIEMzNC4zMjEzMTYxLDU4LjQzMTA3MTUgMzcuNTY3MzUxNiw1OS4yMDkyMTAzIDQxLjAwMDI4MjIsNTkuMjA5MjEwMyBDNDcuNTU1MzU3NSw1OS4yMDkyMTAzIDUzLjE3MDkyODYsNTUuMzEyMTQyNSA1My4xNzA5Mjg2LDQ4LjQ3ODMzMjggQzUzLjE3MDkyODYsNDUuOTEyMTIyNSA1MS44NDMwMTYxLDQzLjcxMDU5OTYgNTAuMDgyNzI1OCw0Mi4wNDM1ODk3IEw0MS4wMDAyODIyLDQ4LjQ3ODMzMjggTDMxLjQ4MzI0OTcsNTcuMDA5MzM4MSBaIiBpZD0iUGF0aCIgZmlsbD0iIzgwMDBGRiI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTUwLjEyODQ4MTIsMzguMTEzNzQxOSBDNDcuOTc0MjE4MSwzNi41MTAyODIxIDQ0LjYxMjIxMjMsMzUuNDA2NTA2IDQwLjk5OTcyNzgsMzUuNDA2NTA2IEMzNC41NTY5NjQzLDM1LjQwNjUwNiAyOC44MzA3MTQ0LDM5LjQzMjU3NzYgMjguODMwNzE0NCw0Ni4xNTU2NDczIEMyOC44MzA3MTQ0LDQ4LjgyMjcwNTcgMzAuMjQ0MzA0NCw1MC45OTkzOTkgMzIuMDkyMTU0NCw1Mi41OTA3MjQyIEw0MC45OTk3Mjc4LDQ2LjE1NTY0NzMgTDUwLjEyODQ4MTIsMzguMTEzNzQxOSBaIiBpZD0iUGF0aCIgZmlsbD0iIzQzOUVGRSI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTQwLjk5OTcyNzgsMzUuMzcxOTUxOSBDNDAuOTk5NzI3OCwyMS41Mjg3NjM0IDUwLjM1NDI3NjEsMjAuNzk1NjQxNiA1MC4zNTQyNzYxLDIwLjc5NTY0MTYgQzUwLjM1NDI3NjEsMjAuNzk1NjQxNiA1MC4wMjQxMjg2LDI0LjgyNDM0NDEgNDAuOTk5NzI3OCwzNS4zNzE5NTE5IFoiIGlkPSJQYXRoLTIiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+)](https://equipe01.alphaedtech.org.br/)

## 📜 Descrição

**Rota Cultural** é uma plataforma web projetada para conectar pessoas a eventos culturais em sua cidade. Usuários podem descobrir, visualizar detalhes, favoritar e participar de eventos. Usuários com perfil *Premium* ou *Administrador* podem criar e gerenciar seus próprios eventos, além de criar promoções exclusivas através de QR Codes. O projeto utiliza uma arquitetura Full Stack com backend em Node.js/Express, frontend em JavaScript puro e banco de dados PostgreSQL.

## ✨ Funcionalidades Principais

* **Autenticação de Usuários:**
    * Cadastro e Login com Email/Senha.
    * Autenticação via Google OAuth2.
    * Fluxo de recuperação de senha por email.
    * Onboarding para novos usuários (coleta de informações adicionais).
* **Gerenciamento de Eventos:**
    * Listagem de eventos com filtros (categoria, data, busca textual).
    * Visualização detalhada de eventos (descrição, data, hora, local, criador, vídeos, mapa).
    * Criação, Edição e Exclusão de eventos (requer permissão Premium/Admin).
    * Sistema de "Likes" para eventos.
* **Perfis de Usuário:**
    * Visualização e Edição de informações básicas do perfil (nome, telefone, data de nascimento).
    * Diferenciação de papéis (Usuário Comum, Premium, Admin).
* **Promoções e QR Codes (Premium/Admin):**
    * Criação de promoções associadas a eventos (descontos, brindes, etc.).
    * Geração de QR Codes únicos para usuários utilizarem as promoções.
    * Visualização e gerenciamento das promoções criadas.
    * Validação de QR Codes (via câmera ou inserção manual) para registrar o uso.
* **Integrações:**
    * **Google Maps:** Exibição de localização de eventos em mapa interativo, autocomplete de endereços.
    * **AWS S3:** Armazenamento de imagens de eventos.
    * **Nodemailer:** Envio de emails (ex: recuperação de senha).
* **Outros:**
    * API documentada com Swagger (`/api-docs`).
    * Frontend responsivo (layout se adapta a diferentes tamanhos de tela).
    * Sistema de navegação SPA (Single Page Application) baseado em hash.

## 💻 Tecnologias Utilizadas

* **Backend:**
    * Node.js
    * Express.js
    * PostgreSQL (`pg`)
    * Passport.js (Estratégias: Local, Google OAuth2)
    * JSON Web Tokens (JWT) para gerenciamento de sessão via cookies HttpOnly
    * Bcrypt.js (Hashing de senhas)
    * Nodemailer (Envio de emails)
    * AWS SDK v3 (`@aws-sdk/client-s3`) para interagir com S3
    * Multer (Middleware para upload de arquivos)
    * `dotenv` (Gerenciamento de variáveis de ambiente)
    * Swagger UI Express & YAML (`swagger-ui-express`, `yaml`) para documentação da API
    * `uuid` (Geração de IDs únicos para QR Codes/Promoções)
* **Frontend:**
    * HTML5
    * CSS3 (Estrutura modular)
    * JavaScript (Vanilla JS, ES Modules)
    * Roteamento SPA (baseado em Hash `#`)
    * Google Maps JavaScript API (Mapas, Places Autocomplete)
    * `jsQR` (Biblioteca para leitura de QR Code via câmera)
* **Banco de Dados:**
    * PostgreSQL
* **Infraestrutura & Serviços:**
    * AWS S3 (Armazenamento de imagens)

## 🚀 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

* [Node.js](https://nodejs.org/) (Versão >= 18.x recomendada, baseada nas dependências AWS SDK v3)
* [npm](https://www.npmjs.com/) (geralmente vem com o Node.js) ou [Yarn](https://yarnpkg.com/)
* Um servidor PostgreSQL em execução.
* Credenciais da AWS (Access Key ID, Secret Access Key) e um bucket S3 configurado com permissões adequadas.
* Credenciais do Google Cloud para OAuth2 (Client ID, Client Secret) e API Key do Google Maps (com as APIs Maps JavaScript e Places habilitadas).
* Credenciais para um serviço de envio de email (ex: Gmail, SendGrid) compatível com Nodemailer.

## ⚙️ Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/rafa-arati/Projeto-Final-de-Ciclo---Alpha-Edtech.git](https://github.com/rafa-arati/Projeto-Final-de-Ciclo---Alpha-Edtech.git)
    cd Projeto-Final-de-Ciclo---Alpha-Edtech
    ```

2.  **Instale as dependências do backend:**
    ```bash
    npm install
    # ou
    # yarn install
    ```
    *(Não há `package.json` na pasta `frontend`, as dependências são carregadas via CDN ou são nativas do navegador)*

3.  **Configure o Banco de Dados PostgreSQL:**
    * Crie um banco de dados para o projeto (ex: `rotacultural_db`).
    * Execute o script SQL para criar as tabelas e inserir dados iniciais:
        ```bash
        # Conecte-se ao seu servidor PostgreSQL (ex: usando psql)
        psql -U <seu_usuario_postgres> -d <nome_do_seu_banco> -f backend/scripts/new_database.sql
        ```
        **Atenção:** O script `new_database.sql` apaga todas as tabelas existentes antes de criar as novas. Use com cuidado!

4.  **Configure as Variáveis de Ambiente:**
    * Crie um arquivo `.env` na raiz do diretório `backend`.
    * Copie o conteúdo abaixo e preencha com suas credenciais:

    ```dotenv
    # Configurações do Banco de Dados
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=<SEU_USUARIO_POSTGRES>
    DB_PASSWORD=<SUA_SENHA_POSTGRES>
    DB_NAME=<NOME_DO_SEU_BANCO>

    # Segredos da Aplicação
    JWT_SECRET=<SEU_SEGREDO_JWT_FORTE>
    SESSION_SECRET=<SEU_SEGREDO_DE_SESSAO_FORTE>
    TOKEN_EXPIRY_HOURS=1 # Tempo de expiração do token de reset de senha

    # Configurações do Google OAuth2
    GOOGLE_CLIENT_ID=<SEU_GOOGLE_CLIENT_ID>
    GOOGLE_CLIENT_SECRET=<SEU_GOOGLE_CLIENT_SECRET>
    GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback # Ou URL de produção/ngrok

    # Configurações da AWS S3
    AWS_REGION=<SUA_REGIAO_AWS> # ex: us-east-1
    AWS_S3_BUCKET_NAME=<NOME_DO_SEU_BUCKET_S3>
    AWS_ACCESS_KEY_ID=<SUA_AWS_ACCESS_KEY_ID>
    AWS_SECRET_ACCESS_KEY=<SUA_AWS_SECRET_ACCESS_KEY>

    # Configurações de Email (Nodemailer)
    EMAIL_HOST=<SEU_SERVIDOR_SMTP>
    EMAIL_PORT=587 # Ou 465 para SSL
    EMAIL_USER=<SEU_USUARIO_EMAIL>
    EMAIL_PASS=<SUA_SENHA_EMAIL_OU_APP_PASSWORD>
    EMAIL_FROM="Rota Cultural <no-reply@exemplo.com>" # Email remetente

    # Configurações Google Maps API
    Maps_API_KEY=<SUA_CHAVE_API_Maps>

    # URL do Frontend (para links de email)
    FRONTEND_URL=http://localhost:3000/

    # Porta do Servidor
    PORT=3000

    # Segurança (Opcional - valores padrão mostrados)
    # RESET_RATE_LIMIT_WINDOW_MS=3600000 # 1 hora
    # RESET_RATE_LIMIT_MAX=5
    # PASSWORD_SALT_ROUNDS=10
    ```

## ▶️ Executando a Aplicação

1.  **Inicie o servidor backend:**
    ```bash
    npm start
    ```
    *(Isso executará `node backend/server.js`)*

2.  **Acesse a aplicação:**
    Abra seu navegador e vá para `http://localhost:3000` (ou a porta definida no seu `.env`).

## 📚 Documentação da API

A documentação da API está disponível via Swagger UI. Após iniciar o servidor, acesse:
`http://localhost:3000/api-docs`

## 🌐 Link da Aplicação (Deploy)

[https://equipe01.alphaedtech.org.br/](https://equipe01.alphaedtech.org.br/)

## 👥 Contribuidores

* **Repositório Original:** [rafa-arati/Projeto-Final-de-Ciclo---Alpha-Edtech](https://github.com/rafa-arati/Projeto-Final-de-Ciclo---Alpha-Edtech)
* Equipe 01 - Alpha EdTech

## 📄 Licença

Este projeto está licenciado sob a **Licença ISC**. Veja o arquivo `package.json` para mais detalhes.
