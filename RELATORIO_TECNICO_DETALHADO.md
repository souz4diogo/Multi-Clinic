# RELATÓRIO TÉCNICO DETALHADO: SISTEMA INTEGRADO MULTI-CLINIC

## 1. INTRODUÇÃO
Este documento descreve detalhadamente o sistema **Multi-Clinic**, desenvolvido como uma solução de gestão de saúde para clínicas e consultórios. O sistema foi projetado para integrar três frentes fundamentais: atendimento ao paciente, gestão médica e análise administrativa.

---

## 2. ARQUITETURA DO SISTEMA
O Multi-Clinic utiliza uma arquitetura moderna baseada em microserviços/front-back desacoplado.

### 2.1. Back-end (API REST)
*   **Tecnologia:** ASP.NET Core 10.0.
*   **Padrão de Projeto:** MVC (Model-View-Controller) para a estrutura da API.
*   **Segurança:** Implementação de JWT (JSON Web Tokens) para controle de sessão sem estado (stateless) e criptografia de senhas com BCrypt.
*   **Gerenciamento de Dados:** Entity Framework Core com abordagem Code-First (Migrações).

### 2.2. Front-end (Aplicação Web)
*   **Tecnologia:** React 19 + Vite.
*   **Estilização:** Tailwind CSS v4, proporcionando uma interface ultra-rápida e totalmente responsiva.
*   **Gerenciamento de Estado:** React Context API para persistência de dados do usuário logado.
*   **Bibliotecas de UI:** Lucide React para iconografia e componentes customizados focados em acessibilidade.

---

## 3. MODELAGEM DE DADOS E POO (C#)
O sistema aplica conceitos avançados de Programação Orientada a Objetos para garantir reuso e organização de código.

### 3.1. Herança e TPT (Table-Per-Type)
A base do sistema de usuários utiliza herança. No banco de dados, isso se traduz em uma tabela base e tabelas filhas que compartilham a chave primária.
*   **Classe Base:** Usuario (ID, Nome, Email, Senha, Perfil).
*   **Classe Derivada Paciente:** Adiciona CPF, Data_Nascimento e Score_Assiduidade.
*   **Classe Derivada Medico:** Adiciona CRM e vínculo com Especialidade.

### 3.2. Estrutura de Tabelas (SQL Server)
1.  **Especialidades:** Cadastro das áreas de atuação médica.
2.  **Agendamentos:** Tabela central que cruza Médicos, Pacientes e Horários. Possui estados: Agendado, Concluido, Cancelado.
3.  **Prontuarios:** Registros clínicos de cada consulta (Evolução e Prescrição).
4.  **Avaliacoes:** Notas de 1 a 5 estrelas atribuídas pelos pacientes.

---

## 4. FUNCIONALIDADES DETALHADAS

### 4.1. Módulo de Autenticação e Perfis
*   **Registro Público:** Apenas pacientes podem se cadastrar sozinhos.
*   **Controle de Acesso:** O sistema valida o ClaimTypes.Role no Token JWT para restringir o acesso a rotas específicas (ex: apenas MedicoAdmin pode criar médicos).

### 4.2. Fluxo de Atendimento (Médico & Paciente)
*   **Busca por Médicos:** O paciente visualiza a média de estrelas de cada médico antes de agendar.
*   **Validação de Perfil:** O sistema impede agendamentos caso o paciente não tenha completado seu cadastro (CPF).
*   **Evolução Clínica:** Médicos registram o atendimento gerando um prontuário digital inalterável após a criação.

### 4.3. Dashboard de Análise de Dados
O painel administrativo realiza cálculos em tempo real para tomada de decisão:
*   **Taxa de Cancelamento:** Identifica perdas financeiras ou operacionais.
*   **Score de Assiduidade:** Algoritmo que pontua o paciente de 0 a 100 com base em presenças e faltas.
*   **Análise de Especialidades:** Ranking das áreas mais procuradas para expansão do corpo clínico.

---

## 5. ENGENHARIA DE SOFTWARE E UX
*   **Responsividade:** O layout utiliza Grid e Flexbox para se adaptar perfeitamente a smartphones, tablets e monitores widescreen.
*   **Feedback ao Usuário:** Implementação de Skeleton Screens, loaders e alertas animados para melhorar a percepção de performance.
*   **Clean Code:** Código estruturado com nomes de variáveis semânticos em português e separação de DTOs para proteção dos modelos internos.

---

## 6. CONCLUSÃO TÉCNICA
O sistema Multi-Clinic atende aos requisitos do PIM III ao integrar:
1.  Modelagem de Dados Relacional.
2.  Desenvolvimento Web Moderno (React).
3.  Lógica de Negócios Robusta (C#/.NET).
4.  Análise de Dados Estratégica.

---
**Desenvolvido como parte do projeto acadêmico PIM III - Análise e Desenvolvimento de Sistemas.**
