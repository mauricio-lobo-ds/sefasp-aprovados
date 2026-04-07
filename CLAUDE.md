# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript application for managing call orders for approved candidates in the **Agente Fiscal de Rendas** competition for **SEFAZ-SP**. The app handles two specialties: "GESTÃO TRIBUTÁRIA" and "TECNOLOGIA DA INFORMAÇÃO".

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Export functionality**: jsPDF, html2canvas, xlsx

## Architecture

The project follows Clean Architecture principles with clear separation of concerns:

### Domain Layer (`src/domain/`)
- **Entities**: `Candidate.ts` - Core business entity with methods for candidate operations
- **Use Cases**: `CallOrderUseCase.ts` - Contains the call order algorithm logic
- **Repositories**: Interface definitions for data access

### Infrastructure Layer (`src/infrastructure/`)
- **Repositories**: Concrete implementations (CSV parsing via Vite raw import, localStorage)

### Application Layer (`src/services/`)
- Application services that orchestrate domain operations

### Presentation Layer (`src/components/`)
- **ui/**: Reusable UI components (Button, Card, Input, etc.)
- **layout/**: Layout components (Header, Footer)
- **pages/**: Page components (HomePage, SpecialtyPage)
- **features/**: Feature-specific components (CallOrderList, CandidatesList, CandidateProfiles, etc.)

### Data Layer (`src/data/`)
- `aprovados_classific.csv` — candidate data, loaded via Vite `?raw` import in `StaticCandidateRepository.ts`
- `candidatesData.ts` — empty file, kept for compatibility (data is loaded from CSV)

## Key Business Logic

### Call Order Algorithm
The core logic is in `CallOrderUseCase.ts`. It implements the SEFAZ-SP call order rules:

1. Generates a dynamic sequence for all candidates via `generateSequence(totalCount)`
2. Manages two quota types: **AC** (General) and **PCD** (Disabled)
3. PCD positions are: **5th, 30th, 50th**, then **every 20** from 50 onwards (70th, 90th, 110th...)
4. Fallback: if no PCD candidates remain, the position is filled with AC
5. Handles candidate removal and sequence modification with automatic full recalculation

```ts
function isPCDPosition(pos: number): boolean {
  if (pos === 5) return true;
  if (pos === 30) return true;
  if (pos >= 50 && (pos - 50) % 20 === 0) return true;
  return false;
}
```

### Candidate Types
- **AC**: General competition position
- **PCD**: Disabled persons quota

Candidates can be in both quotas simultaneously and are called by the most favorable classification.

## Important Files

- `src/types/index.ts` - Core TypeScript interfaces
- `src/domain/usecases/CallOrderUseCase.ts` - Main business logic (PCD sequence algorithm)
- `src/data/aprovados_classific.csv` - Candidate data (semicolon-separated)
- `src/infrastructure/repositories/StaticCandidateRepository.ts` - Loads and parses the CSV
- `src/hooks/useCallOrder.ts` - React hook for call order state management

## Data Format

CSV structure (semicolon-separated):
```
num;nome;cl_ac;tipo;cl_pcd
```

| Column | Description |
|--------|-------------|
| `num` | Candidate registration number (`inscricao`) |
| `nome` | Full name |
| `cl_ac` | AC classification position (integer) |
| `tipo` | Specialty: `GT` = GESTÃO TRIBUTÁRIA, `TI` = TECNOLOGIA DA INFORMAÇÃO |
| `cl_pcd` | PCD classification position (integer, empty if not applicable) |

Empty `cl_pcd` means the candidate is not in the PCD quota.

## Candidate Profiles

- `public/aprovados-info.json` currently contains `{ "profissionais": [] }` — **no data yet**
- The profile tab (`CandidateProfiles.tsx`) is fully functional and will display profiles when data is added to the JSON
- Profile structure uses `useApprovedProfiles.ts` hook which fetches from `/aprovados-info.json`

## State Management

Uses React hooks + localStorage persistence for maintaining call order state between sessions. State is keyed by specialty name.

## Routes

- `/` — Home page with specialty selection
- `/gestao` — GESTÃO TRIBUTÁRIA
- `/tecnologia` — TECNOLOGIA DA INFORMAÇÃO
