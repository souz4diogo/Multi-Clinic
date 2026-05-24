# RELATÓRIO TÉCNICO COMPLETO - PIM III - SISTEMA MULTI-CLINIC

## SUMÁRIO
1. INTRODUÇÃO
2. ENGENHARIA DE SOFTWARE ÁGIL APLICADA
3. MODELAGEM DE BANCO DE DADOS E NOSQL
4. PROGRAMAÇÃO ORIENTADA A OBJETOS (C#)
5. DESENVOLVIMENTO WEB RESPONSIVO
6. UX E UI DESIGN
7. MACHINE LEARNING E ANÁLISE DE DADOS
8. COMUNICAÇÃO, LIDERANÇA E LIBRAS
9. CONCLUSÃO E REFERÊNCIAS
10. APÊNDICE: CÓDIGO FONTE PRINCIPAL

---

## 1. INTRODUÇÃO
### 1.1. Contextualização do Projeto
O setor de saúde tem passado por uma transformação digital acelerada. Consultórios que antes dependiam de agendas de papel hoje buscam soluções que integrem agendamento, prontuário e gestão financeira em um único lugar. O sistema Multi-Clinic nasce dessa necessidade, focando em uma experiência de usuário simplificada para o paciente e uma gestão baseada em dados para o administrador.

### 1.2. Objetivos do Sistema
- Agilidade: Reduzir o tempo de marcação de consultas através de um portal self-service para o paciente.
- Histórico Centralizado: Garantir que o prontuário do paciente esteja disponível para o médico de forma imediata e segura.
- Transparência: Permitir que pacientes avaliem o atendimento, promovendo a melhoria contínua do corpo clínico.
- Inteligência de Negócio: Fornecer indicadores claros sobre a operação da clínica.

---

## 2. ENGENHARIA DE SOFTWARE ÁGIL APLICADA
### 2.1. Metodologia Scrum
O projeto foi desenvolvido utilizando o framework Scrum. Foram definidas sprints de 1 semana para entregas de funcionalidades específicas (MVP - Minimum Viable Product).
- Product Backlog: Lista de todas as funcionalidades desejadas (Login, Agendamento, Prontuário, Dashboard).
- Sprint Planning: Reunião inicial para definir quais itens do backlog seriam atacados.
- Daily Scrum: Alinhamento diário sobre impedimentos técnicos.

---

## 3. MODELAGEM DE BANCO DE DADOS
### 3.1. Estratégia de Herança (TPT)
Diferente da estratégia TPH (Table Per Hierarchy), onde todos os dados ficam em uma tabela só com muitos campos nulos, a estratégia TPT (Table Per Type) foi escolhida por ser mais normalizada.
- A tabela Usuarios contém a base comum.
- As tabelas Medicos e Pacientes possuem uma relação 1:1 com Usuarios.

---

## 4. PROGRAMAÇÃO ORIENTADA A OBJETOS (C#)
### 4.1. Implementação da Arquitetura
O back-end utiliza o padrão de Injeção de Dependência nativo do .NET. Isso permite que serviços como o TokenService sejam injetados nos Controllers de forma desacoplada.

### 4.2. Exemplos de Pilares da POO
- Encapsulamento: Propriedades get; set; protegendo o estado interno dos modelos.
- Herança: Classe Medico herdando de Usuario.
- Polimorfismo: Métodos de resposta da API que retornam diferentes tipos de objetos dependendo do perfil do usuário logado.

---

## 5. DESENVOLVIMENTO WEB RESPONSIVO
### 5.1. Front-end com React
O uso de React Query (TanStack Query) foi fundamental para gerenciar o cache das requisições, evitando chamadas desnecessárias à API e melhorando a velocidade de navegação.

### 5.2. Estilização com Tailwind CSS
O Tailwind foi utilizado para criar um sistema de design baseado em tokens. As cores da clínica (primária: Azul) são aplicadas de forma consistente em botões, bordas e textos.

---

## 6. UX E UI DESIGN
### 6.1. Fluxo do Usuário (User Flow)
O design foca na redução da carga cognitiva. Por exemplo, no agendamento, o usuário primeiro escolhe o médico e só depois a data, evitando sobrecarga de informação em uma única tela.

---

## 7. MACHINE LEARNING E ANÁLISE DE DADOS
### 7.1. Lógica dos Indicadores
O Dashboard administrativo consome dados processados pela API para exibir:
- Taxa de Cancelamento: Calculada dividindo o total de consultas canceladas pelo total de agendamentos.
- Média de Avaliações: Média aritmética das notas dadas aos médicos.

---

## 8. ACESSIBILIDADE E LIBRAS
### 8.1. Estratégia de Inclusão
O sistema foi testado com ferramentas de leitura de tela e possui suporte para LIBRAS através de componentes informativos e ícones universais que facilitam a compreensão visual.

---

## 9. ORIENTAÇÕES PARA ALCANÇAR 60 PÁGINAS
Para atingir o volume solicitado pela faculdade, siga este roteiro de expansão:
1. Capa, Dedicatória, Agradecimentos, Resumo e Abstract (6 páginas).
2. Sumário Detalhado (2 páginas).
3. Print de Telas (20 páginas): Tire print de cada página do sistema e descreva cada uma.
4. Diagramas de Banco e UML (4 páginas).
5. Apêndice de Código (25 páginas): Copie o código das classes principais (Controllers, Models, Pages).
6. Referências Bibliográficas (3 páginas).
