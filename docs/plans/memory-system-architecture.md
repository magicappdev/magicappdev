# Memory for Agents

```mermaid
graph TB
    subgraph "File System Layer"
        FW[File Watcher Service]
        CR[Conflict Resolution Engine]
    end

    subgraph "Core Memory Engine"
        ME[Memory Engine]
        SE[Summarization Engine]
        SRE[Spaced Repetition Engine]
        SSE[Semantic Search Engine]
        VC[Version Control System]
    end

    subgraph "Data Layer"
        D1[(D1 Database)]
        FT[files table]
        VT[versions table]
        RT[relationships table]
        ST[summaries table]
        AT[access_logs table]
    end

    subgraph "API Layer"
        WS[WebSocket Service]
        REST[REST API Endpoints]
        AFL[Agent Feedback Loop]
    end

    subgraph "Integration Layer"
        AI[AI Gateway Integration]
        AG[MagicAgent Interface]
        HI[Human-in-the-Loop Interface]
    end

    FW --> ME
    CR --> ME
    ME --> SE
    ME --> SRE
    ME --> SSE
    ME --> VC

    SE --> AI
    SSE --> AI

    ME --> D1
    D1 --> FT
    D1 --> VT
    D1 --> RT
    D1 --> ST
    D1 --> AT

    ME --> WS
    ME --> REST
    ME --> AFL

    AG --> ME
    HI --> AFL
    AFL --> ME
```

## System Architecture Overview

### Core Components

1. **File Watcher Service**
   - Monitors .md files in designated directories
   - Detects real-time changes (create, update, delete)
   - Triggers synchronization events

2. **Conflict Resolution Engine**
   - Detects concurrent modifications
   - Implements merge strategies for conflicting changes
   - Maintains data integrity across distributed operations

3. **Memory Engine** (Central Coordinator)
   - Orchestrates all memory operations
   - Manages file indexing and metadata
   - Coordinates between all subsystems

4. **Summarization Engine**
   - Generates context-aware summaries using AI
   - Filters redundancy and preserves key insights
   - Updates summaries on content changes

5. **Spaced Repetition Engine**
   - Schedules memory reinforcement based on access patterns
   - Implements adaptive intervals for optimal retention
   - Tracks engagement metrics

6. **Semantic Search Engine**
   - Provides contextual retrieval of memory segments
   - Cross-references related files and concepts
   - Supports natural language queries

7. **Version Control System**
   - Maintains lightweight history of all changes
   - Enables selective restoration of previous states
   - Tracks authorship and timestamps

8. **Agent Feedback Loop**
   - Allows agents to flag inconsistencies
   - Supports human-in-the-loop validation
   - Enables structural improvement suggestions

### Data Model

- **files**: Core file metadata (path, hash, last_modified, status)
- **versions**: Change history with diffs and timestamps
- **relationships**: Links between related files and concepts
- **summaries**: AI-generated summaries with confidence scores
- **access_logs**: Usage patterns for spaced repetition

### Integration Points

- **AI Gateway**: Leverages existing Cloudflare AI Gateway for summarization and search
- **MagicAgent**: Primary consumer of memory services
- **Human Interface**: Admin panel for monitoring and manual interventions
- **WebSocket Streaming**: Real-time updates for connected clients
