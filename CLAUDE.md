# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript application for managing call orders for approved candidates in a tax auditor position competition for Cuiabá-MT. The app handles three specialties: "DIREITO/PROCESSO TRIBUTÁRIO", "GESTÃO TRIBUTÁRIA", and "TECNOLOGIA DA INFORMAÇÃO".

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
vite build

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
- **Date handling**: date-fns
- **Export functionality**: jsPDF, html2canvas, xlsx

## Architecture

The project follows Clean Architecture principles with clear separation of concerns:

### Domain Layer (`src/domain/`)
- **Entities**: `Candidate.ts` - Core business entity with methods for candidate operations
- **Use Cases**: `CallOrderUseCase.ts` - Contains the complex call order algorithm logic
- **Repositories**: Interface definitions for data access

### Infrastructure Layer (`src/infrastructure/`)
- **Repositories**: Concrete implementations (CSV parsing, localStorage)

### Application Layer (`src/services/`)
- Application services that orchestrate domain operations

### Presentation Layer (`src/components/`)
- **ui/**: Reusable UI components (Button, Card, Input, etc.)
- **layout/**: Layout components (Header, Footer)
- **pages/**: Page components (HomePage, SpecialtyPage)
- **features/**: Feature-specific components (CallOrderList, CandidatesList, CandidateProfiles, etc.)

### Data Layer (`src/data/`)
- Static CSV data file with candidate information

## Key Business Logic

### Call Order Algorithm
The most critical part of the application is in `CallOrderUseCase.ts:20-76`. It implements a complex algorithm that:

1. Uses predefined sequences for each specialty (different for "GESTÃO TRIBUTÁRIA" vs others)
2. Manages three quota types: AC (General), PCD (Disabled), NI (Black/Indigenous)
3. Implements fallback logic when quota candidates are exhausted
4. Handles candidate removal and sequence modification with automatic recalculation

### Candidate Types
- **AC**: General competition position
- **PCD**: Disabled persons quota
- **NI**: Black and Indigenous quota

Candidates can be in multiple quotas simultaneously and are called by the most favorable position.

## Important Files

- `src/types/index.ts` - Core TypeScript interfaces
- `src/domain/usecases/CallOrderUseCase.ts` - Main business logic
- `src/data/dados-aprovados.csv` - Candidate data (semicolon-separated)
- `src/hooks/useCallOrder.ts` - React hook for call order state management

## Data Format

CSV structure (semicolon-separated):
```
Especialidade;Inscrição;Nome;Nascimento;Nota;AC;PCD;NI;Formacao;Experiencia;Aprovacoes
```

Empty quota fields are represented as empty strings, not null values. The new profile fields (Formacao, Experiencia, Aprovacoes) are optional and may be empty.

## State Management

Uses React Context + useReducer pattern for complex state management, with localStorage persistence for maintaining state between sessions.

## Specialty-Specific Sequences

- **GESTÃO TRIBUTÁRIA**: Position 5=AC, Position 6=PCD
- **DIREITO/PROCESSO TRIBUTÁRIO & TECNOLOGIA DA INFORMAÇÃO**: Position 5=PCD, Position 6=AC

These sequences are editable through the UI and trigger full recalculation when modified.