# Rota Cultural - Gerenciador de Eventos Culturais

Projeto final de ciclo desenvolvido para a Alpha Edtech, consistindo em uma aplicação web full-stack para descoberta e gerenciamento de eventos culturais, com funcionalidades premium e sistema de QR Code para promoções.

## Índice

* [Sobre o Projeto](#sobre-o-projeto)
* [Funcionalidades](#funcionalidades)
* [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Como Usar](#como-usar)
    * [Pré-requisitos](#pré-requisitos)
    * [Instalação](#instalação)
    * [Configuração](#configuração)
    * [Execução](#execução)
    * [Papéis de Usuário](#papéis-de-usuário)
* [Estrutura do Projeto](#estrutura-do-projeto)
* [API](#api)

## Sobre o Projeto

O **Rota Cultural** foi desenvolvido como uma plataforma centralizada para conectar pessoas a eventos culturais em sua localidade, ao mesmo tempo que oferece ferramentas para que organizadores (usuários Premium/Admin) possam criar, divulgar e gerenciar seus próprios eventos de forma eficiente.

**Problema:** Muitas vezes, a descoberta de eventos culturais locais é fragmentada, e pequenos organizadores carecem de ferramentas acessíveis para gerenciar promoções, controlar acesso e divulgar suas atividades.

**Solução:** Este projeto oferece uma API RESTful robusta (Node.js/Express/PostgreSQL) e uma interface de usuário SPA (Vanilla JavaScript) que aborda esses desafios, incluindo:
* Descoberta de eventos com filtros e categorias.
* Criação e gerenciamento de eventos para usuários autorizados.
* Sistema de autenticação seguro (Email/Senha e Google OAuth).
* Funcionalidade de "curtidas" para engajamento.
* Um sistema integrado de promoções via QR Code, permitindo que criadores ofereçam benefícios e validem a participação.
* Integração com AWS S3 para armazenamento de imagens.

**Quem Pode se Beneficiar?**
* **Público Geral:** Pessoas buscando eventos culturais diversos em sua região, com a possibilidade de aproveitar promoções exclusivas via QR Code.
* **Criadores de Conteúdo/Produtores Culturais (Premium):** Podem divulgar seus eventos, gerenciar promoções, validar ingressos/benefícios e alcançar um público maior.
* **Administradores:** Têm controle total sobre a plataforma, usuários e eventos.
* **Desenvolvedores:** Podem usar o projeto como um exemplo prático de desenvolvimento full-stack com Node.js, PostgreSQL, autenticação JWT/OAuth, integração AWS S3 e frontend SPA sem frameworks.

Este projeto visa não apenas organizar a informação cultural, mas também fomentar a participação e facilitar a gestão de eventos, servindo como uma ferramenta útil tanto para o público quanto para os organizadores.

## Funcionalidades

* **Autenticação:**
    * Cadastro e Login (Email/Senha).
    * Login Social com Google OAuth 2.0.
    * Gerenciamento de Sessão com JWT (Cookies HttpOnly).
    * Recuperação de Senha por Email.
    * Edição de Perfil (Nome, Telefone, Data Nasc.).
    * Sistema de Papéis (User, Premium, Admin).
* **Eventos:**
    * Criação, Leitura, Atualização e Exclusão (CRUD) por usuários Premium/Admin.
    * Listagem geral com filtros (Categoria, Subcategoria, Data, Busca textual).
    * Visualização de detalhes do evento (inclui imagem, vídeos, descrição, local, etc.).
    * Upload de Imagem para AWS S3.
    * Incorporação de vídeos do YouTube e TikTok.
    * Sistema de "Curtidas" (Likes).
    * Carrosséis de destaque (Mais Curtidos, Acontecendo Hoje).
    * Visualização em formato de Agenda/Calendário.
* **Categorias:**
    * Listagem de categorias e subcategorias pré-definidas.
* **Sistema Premium:**
    * Upgrade de conta para Premium (ativação via API).
    * Acesso a funcionalidades exclusivas (criação de eventos, QR codes).
* **Promoções e QR Code:**
    * Criação de promoções vinculadas a eventos (Desconto, Brinde, VIP, etc.) por Premium/Admin.
    * Definição de limites (quantidade, prazo de geração, prazo de uso).
    * Geração de QR Code único por usuário para uma promoção.
    * Validação de QR Codes (via câmera ou manual) por Premium/Admin para marcar como usado.
    * Visualização de promoções criadas e QR codes gerados.
* **Frontend:**
    * Interface Single Page Application (SPA) interativa.
    * Design responsivo.
    * Modais para feedback, confirmações, filtros e gerenciamento.
* **API:**
    * API REST documentada via Swagger (OpenAPI).

## Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS, ES Modules), JSQR (Scanner QR Code), Qrserver API (Display QR Code)
* **Backend:** Node.js, Express.js
* **Banco de Dados:** PostgreSQL (`pg`)
* **Autenticação:** Passport.js (`passport-google-oauth20`), JWT (`jsonwebtoken`), Bcryptjs
* **Armazenamento de Arquivos:** AWS S3 (`@aws-sdk/client-s3`)
* **Uploads:** Multer
* **Envio de Email:** Nodemailer
* **API Docs:** Swagger (`swagger-ui-express`, `yaml`)
* **Outros:** `dotenv`, `cookie-parser`, `express-session`, `cors`, `uuid`

## Como Usar

### Pré-requisitos

* Node.js (versão LTS recomendada)
* npm (geralmente instalado com o Node.js)
* Servidor de Banco de Dados PostgreSQL instalado e rodando.
* Credenciais configuradas para:
    * Google OAuth 2.0 (Client ID, Client Secret, Callback URL)
    * AWS S3 (Region, Bucket Name, Access Key ID, Secret Access Key)
    * Servidor de Email SMTP (Host, Port, User, Pass, From)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone [https://github.com/rafa-arati/Projeto-Final-de-Ciclo---Alpha-Edtech.git](https://github.com/rafa-arati/Projeto-Final-de-Ciclo---Alpha-Edtech.git)
    cd Projeto-Final-de-Ciclo---Alpha-Edtech
    ```
2.  Instale as dependências do Node.js:
    ```bash
    npm install
    ```

### Configuração

1.  **Banco de Dados:**
    * Crie um banco de dados PostgreSQL para o projeto.
    * Execute o script SQL localizado em `backend/scripts/new_database.sql` para criar as tabelas e inserir os dados iniciais (categorias). Certifique-se de estar conectado ao banco de dados correto antes de executar.
2.  **Variáveis de Ambiente:**
    * Crie um arquivo chamado `.env` dentro da pasta `backend/`.
    * Copie o conteúdo de um arquivo `.env.example` (se existir) ou adicione as seguintes variáveis, preenchendo com suas credenciais e configurações:
        ```env
        # Configuração do Banco de Dados
        DB_HOST=localhost
        DB_PORT=5432
        DB_USER=seu_usuario_postgres
        DB_PASSWORD=sua_senha_postgres
        DB_NAME=nome_do_seu_banco

        # Segredos da Aplicação
        JWT_SECRET=seu_segredo_super_secreto_para_jwt
        SESSION_SECRET=outro_segredo_para_sessoes_express

        # Configuração do Google OAuth
        GOOGLE_CLIENT_ID=seu_google_client_id.apps.googleusercontent.com
        GOOGLE_CLIENT_SECRET=seu_google_client_secret
        GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback # Ou URL de produção

        # Configuração do AWS S3
        AWS_REGION=sua_regiao_aws # ex: us-east-1
        AWS_S3_BUCKET_NAME=nome_do_seu_bucket_s3
        AWS_ACCESS_KEY_ID=sua_aws_access_key_id
        AWS_SECRET_ACCESS_KEY=sua_aws_secret_access_key

        # Configuração de Email (Nodemailer)
        EMAIL_HOST=smtp.example.com
        EMAIL_PORT=587
        EMAIL_USER=seu_email@example.com
        EMAIL_PASS=sua_senha_email
        EMAIL_FROM="Rota Cultural <no-reply@rotacultural.com>" # Email remetente

        # Configurações de Segurança (Opcional - usar padrões se não definido)
        # TOKEN_EXPIRY_HOURS=1
        # RESET_RATE_LIMIT_WINDOW_MS=3600000
        # RESET_RATE_LIMIT_MAX=5
        # PASSWORD_SALT_ROUNDS=10

        # URL do Frontend (para links de email)
        FRONTEND_URL=http://localhost:3000/

        # Porta do Servidor
        PORT=3000
        ```
    * **IMPORTANTE:** Nunca comite o arquivo `.env` no seu repositório Git. Adicione-o ao seu `.gitignore`.

### Execução

1.  Após instalar as dependências e configurar o `.env`, inicie o servidor backend:
    ```bash
    npm start
    ```
2.  O servidor estará rodando na porta definida (padrão 3000).
3.  Acesse a aplicação no seu navegador: `http://localhost:3000`

### Papéis de Usuário

* **Usuário Comum (`user`):** Pode se cadastrar, fazer login (email/senha ou Google), visualizar eventos, filtrar eventos, ver detalhes, curtir eventos, gerar QR Codes para promoções disponíveis, visualizar seus QR Codes gerados, editar seu perfil e solicitar recuperação de senha.
* **Usuário Premium (`premium`):** Todas as funcionalidades do usuário comum, mais a capacidade de criar, editar e excluir *seus próprios* eventos, criar e gerenciar promoções (QR Codes) para *seus* eventos e validar QR Codes de *seus* eventos.
* **Administrador (`admin`):** Todas as funcionalidades dos outros papéis, mais a capacidade de criar/editar/excluir *qualquer* evento ou promoção, e potencialmente gerenciar usuários e categorias (dependendo da implementação completa das rotas de admin).

*Nota: Diferente do exemplo, este projeto não cria usuários padrão automaticamente. Você precisará se registrar.*

## Estrutura do Projeto

O projeto é dividido em duas partes principais:

* **`backend/`**: Contém a API RESTful desenvolvida em Node.js/Express.
    * `config/`: Arquivos de configuração (DB, Passport, AWS, Env).
    * `controllers/`: Lógica de manipulação das requisições.
    * `middleware/`: Funções como autenticação e rate limiting.
    * `models/`: Camada de acesso e manipulação do banco de dados.
    * `routes/`: Definição dos endpoints da API.
    * `scripts/`: Script SQL para criação do banco de dados.
    * `swagger/`: Documentação da API.
    * `utils/`: Funções utilitárias.
    * `app.js`: Configuração central do Express.
    * `server.js`: Ponto de entrada para iniciar o servidor.
* **`frontend/`**: Contém a interface do usuário Single Page Application (SPA).
    * `css/`: Estilos CSS modularizados.
    * `js/`: Código JavaScript (Vanilla JS com módulos).
        * `modules/`: Funções reutilizáveis (auth, router, store, api, utils).
        * `pages/`: Lógica específica de cada tela/página.
    * `index.html`: Ponto de entrada do frontend.

## API

A API RESTful é documentada utilizando Swagger/OpenAPI. Após iniciar o servidor, a documentação interativa pode ser acessada em:

`http://localhost:3000/api-docs` (ou a porta que você configurou)
