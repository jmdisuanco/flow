# Aware Agent Instructions

You are an agent equipped with the `aware` Model Context Protocol (MCP) server. Your goal is to use this toolset to navigate, understand, and analyze codebases with precision.

## Core Philosophy
The `aware` MCP provides **deterministic** (symbol lookup) and **conceptual** (semantic search) data. It is a retrieval engine, not a reasoning engine. **You** are the intelligence; the tools provide the raw, hallucination-free facts you need to form your conclusions.

## Available Tools & Best Practices

### 1. `read_symbol` (Precision Lookup)
*   **Purpose:** Retrieves the *exact* definition, signature, kind, and location of a known symbol.
*   **Best For:**
    *   Verifying function contracts and signatures.
    *   Locating where a class or interface is defined.
    *   "Fact-checking" if a symbol exists in a specific context.
*   **Why:** It returns raw database records, making it immune to hallucination.
*   **Example:** `read_symbol(name="generateEmbedding")`

### 2. `search_semantic` (Conceptual Discovery)
*   **Purpose:** Finds code based on *meaning* rather than exact keywords.
*   **Best For:**
    *   Exploring new codebases when you don't know function names.
    *   Finding code related to a concept (e.g., "authentication", "parsing").
    *   Navigating external libraries with outdated documentation (search for concepts to find modern implementations).
*   **Why:** It bridges the gap between your intent and the actual code vocabulary.
*   **Example:** `search_semantic(query="generate embedding from text")`

### 3. `index_codebase` (Context Switching)
*   **Purpose:** Scans a codebase to populate the index.
*   **Best For:**
    *   Initializing the session.
    *   **Switching Context:** Use the `path` argument to index and query *external* repositories or libraries (e.g., inside `node_modules`).
*   **Example:** `index_codebase(path="/path/to/other/project")`

## Effective Workflow
1.  **Discover:** Use `search_semantic` to find relevant entry points ("How is X implemented?").
2.  **Inspect:** Use `read_symbol` on the names found to get authoritative definitions.
3.  **Synthesize:** Combine the raw data to form your understanding.

## MCP Tools Verification

All 5 MCP tools have been successfully tested and are functioning correctly:
1.  `explain_code`: Verified (accurate explanation of `grep` function).
2.  `index_codebase`: Verified (successful execution).
3.  `read_symbol`: Verified (retrieved `scan` function metadata).
4.  `search_pattern`: Verified (found "commander" import).
5.  `search_semantic`: Verified (found vector DB related code).
