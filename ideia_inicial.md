# Sistema de Ordenação de Candidatos - Concurso Auditor Fiscal Tributário Cuiabá-MT

Crie uma aplicação React com TypeScript seguindo Clean Architecture, SOLID e GRASP principles, com estrutura MVC bem definida.

## 📁 Estrutura de Pastas (Clean Architecture)
```
src/
├── components/           # Presentation Layer
│   ├── ui/              # Componentes básicos reutilizáveis
│   ├── layout/          # Layout components
│   ├── pages/           # Page components
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── services/            # Application Services
├── domain/              # Domain Layer
│   ├── entities/        # Business entities
│   ├── repositories/    # Repository interfaces
│   └── usecases/        # Business logic/use cases
├── infrastructure/      # Infrastructure Layer
│   ├── repositories/    # Repository implementations
│   └── storage/         # Local storage utilities
├── utils/               # Utilities
├── types/               # TypeScript type definitions
└── data/                # Static data files
```

## 🎯 Funcionalidades Principais

### 1. HOMEPAGE
- Design moderno, responsivo e atrativo
- Cards navegáveis para as 3 especialidades:
  - **DIREITO/PROCESSO TRIBUTÁRIO**
  - **GESTÃO TRIBUTÁRIA** 
  - **TECNOLOGIA DA INFORMAÇÃO**

### 2. PÁGINAS DE ESPECIALIDADE
Cada página possui 2 abas principais:

#### ABA 1: Lista de Aprovados
- Tabela filtrada por especialidade
- Filtros interativos (nome, classificação, cotas)
- Paginação
- Export para Excel/PDF

#### ABA 2: Ordem de Chamada (FUNCIONALIDADE PRINCIPAL)
- **Lista dos 20 primeiros** na ordem de chamada
- **Candidatos removidos** (destacados em cor diferente no topo)
- **Botão X** para marcar candidato como "não assume"
- **Ordem editável** por posição (AC/NI/PCD dropdown)
- **Recálculo automático** com loading quando há alterações
- **Algoritmo de ordenação inteligente**

## 📊 Estrutura de Dados

### CSV Headers (separador: ponto e vírgula)
```
Especialidade;Inscrição;Nome;Nascimento;Nota;AC;PCD;NI
```

### Exemplo de Dados:
```
DIREITO/PROCESSO TRIBUTÁRIO;850002684;Igor Silva Do Livramento;19/09/1981;171;2;1;1
GESTÃO TRIBUTÁRIA;850002740;José Antonio Pontes Da Silva Filho;22/08/1995;189;30;;1
TECNOLOGIA DA INFORMAÇÃO;850000526;Rykchard Navarro Lorca;08/09/2002;173;6;1;
```

**Importante**: 
- Campos vazios nas cotas são representados como string vazia ""
- Um candidato pode estar em múltiplas cotas (PCD E NI)
- Se não há candidatos suficientes numa cota, puxar da AC

## 🔄 Algoritmo de Ordenação de Chamada

### Sequências Pré-definidas:

**GESTÃO TRIBUTÁRIA (20 posições):**
```
1AC 2AC 3NI 4AC 5AC 6PCD 7AC 8NI 9AC 10AC 11AC 12AC 13NI 14AC 15PCD 16AC 17AC 18NI 19AC 20AC
```

**DIREITO/PROCESSO TRIBUTÁRIO e TECNOLOGIA DA INFORMAÇÃO (20 posições):**
```
1AC 2AC 3NI 4AC 5PCD 6AC 7AC 8NI 9AC 10AC 11AC 12AC 13NI 14AC 15PCD 16AC 17AC 18NI 19AC 20AC
```

### Lógica do Algoritmo:
1. **Prioridade**: Sempre escolher a melhor posição para o candidato (AC vs Cota)
2. **Remoção inteligente**: Quando chamado por AC, remover das listas de cotas
3. **Fallback**: Se cota esgotada, chamar próximo da AC
4. **Recálculo total**: Quando candidato é removido ou ordem editada
5. **Validação**: Verificar disponibilidade antes de atribuir posição

## 🛠 Especificações Técnicas

### Frontend Stack:
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide Icons** para ícones
- **React Router** para navegação
- **Context API + useReducer** para state management
- **React Hook Form** para formulários
- **Date-fns** para manipulação de datas

### Componentes Principais:

#### 1. Layout Components
```typescript
// HomePage.tsx - Landing page com cards das especialidades
// SpecialtyPage.tsx - Container das abas
// Header.tsx - Navegação
// Footer.tsx - Rodapé
```

#### 2. Feature Components
```typescript
// CandidatesList.tsx - Aba 1: Lista completa
// CallOrderList.tsx - Aba 2: Ordem de chamada
// CandidateRow.tsx - Linha da tabela
// CallOrderPosition.tsx - Posição editável
// RemovedCandidates.tsx - Lista de removidos
// FilterPanel.tsx - Filtros interativos
// ExportButtons.tsx - Botões de export
```

#### 3. Custom Hooks
```typescript
// useCandidates.tsx - Gerencia dados dos candidatos
// useCallOrder.tsx - Lógica de ordenação
// useFilters.tsx - Estado dos filtros
// useExport.tsx - Funcionalidades de export
// useLocalStorage.tsx - Persistência local
```

### Business Logic (Domain Layer):

```typescript
interface Candidate {
  especialidade: string;
  inscricao: string;
  nome: string;
  nascimento: string;
  nota: number;
  ac: number;
  pcd: number | null;
  ni: number | null;
  removed?: boolean;
}

interface CallPosition {
  position: number;
  type: 'AC' | 'PCD' | 'NI';
  candidate: Candidate | null;
  editable: boolean;
}

interface CallOrderState {
  positions: CallPosition[];
  removedCandidates: Candidate[];
  sequence: string[]; // ['AC', 'AC', 'NI', 'AC', 'PCD', ...]
  loading: boolean;
}
```

### Algoritmo Core (UseCase):
```typescript
class CallOrderUseCase {
  calculateCallOrder(
    candidates: Candidate[], 
    sequence: string[], 
    removedIds: string[]
  ): CallPosition[]
  
  removeCandidate(candidateId: string): void
  
  updatePositionType(position: number, newType: 'AC' | 'PCD' | 'NI'): void
  
  recalculateOrder(): void
}
```

## 🎨 Design System

### Cores:
- **Primary**: Blue-600 (#2563eb)
- **Secondary**: Slate-600 (#475569)
- **Success**: Green-500 (#10b981)
- **Warning**: Yellow-500 (#eab308)
- **Error**: Red-500 (#ef4444)
- **Removed**: Red-300 background, Red-800 text

### Componentes UI:
- **Cards responsivos** com hover effects
- **Tabelas** com zebra stripes
- **Botões** com loading states
- **Modals** para confirmações
- **Toast notifications** para feedback
- **Loading spinners** para recálculos

## 📱 Responsividade
- **Mobile first** design
- **Breakpoints**: sm:640px, md:768px, lg:1024px, xl:1280px
- **Tabelas responsivas** com scroll horizontal
- **Cards empilhados** em mobile

## 💾 Persistência
- **localStorage** para manter estado entre sessões
- **Chave por especialidade**: `callOrder_${especialidade}`
- **Auto-save** a cada alteração
- **Reset option** para voltar ao estado inicial

## 📤 Export Features
- **Excel export**: Usando SheetJS (xlsx)
- **PDF export**: Usando jsPDF + html2canvas
- **Incluir**: Data/hora, especialidade, lista ordenada
- **Botões**: "Exportar Excel" e "Exportar PDF"

## 🧪 Validações e Error Handling
- **Validação de CSV** na inicialização
- **Verificação de cotas** disponíveis
- **Fallback** para AC quando cota esgota
- **Error boundaries** para componentes
- **Try-catch** em operações críticas
- **Loading states** em todas as operações assíncronas

## 🚀 Performance
- **React.memo** para componentes pesados
- **useMemo** para cálculos complexos
- **useCallback** para funções passadas como props
- **Lazy loading** para componentes não críticos
- **Debounce** nos filtros de pesquisa

## 📋 Checklist de Implementação
- [ ] Estrutura de pastas Clean Architecture
- [ ] Tipos TypeScript bem definidos
- [ ] Homepage com navegação
- [ ] Páginas de especialidade com abas
- [ ] Carregamento e parsing do CSV
- [ ] Lista de candidatos com filtros
- [ ] Algoritmo de ordenação de chamada
- [ ] Interface de edição da ordem
- [ ] Remoção de candidatos
- [ ] Recálculo automático
- [ ] Export Excel/PDF
- [ ] Persistência localStorage
- [ ] Responsividade completa
- [ ] Loading states
- [ ] Error handling
- [ ] Validações

**Arquivo de dados**: Inclua um arquivo `dados-aprovados.csv` na pasta `src/data/` com a estrutura fornecida.

**Importante**: Mantenha o código bem comentado, siga as boas práticas do React/TypeScript, e implemente todos os padrões SOLID solicitados. O foco principal deve estar no algoritmo de ordenação que é o coração da aplicação.