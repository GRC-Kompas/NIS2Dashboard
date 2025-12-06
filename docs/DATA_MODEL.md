# **Data Model & Schema**

## **1\. Overview**

The database is **PostgreSQL 15+**. We leverage standard relational tables for core entities (Users, Organisations) and **JSONB** for storing dynamic questionnaire data (quickscan\_results), allowing the survey questions to evolve without requiring schema migrations.

## **2\. Database Schema**

### **1\. Organisations**

The root entity for multi-tenancy.

CREATE TABLE organisations (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    name VARCHAR(255) NOT NULL,  
    nis2\_segment VARCHAR(50), \-- e.g., 'Essential', 'Important'  
    created\_at TIMESTAMPTZ DEFAULT NOW(),  
    updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

### **2\. Users**

Handles authentication and role definition.

CREATE TABLE users (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    email VARCHAR(255) UNIQUE NOT NULL,  
    password\_hash VARCHAR(255) NOT NULL,  
    role VARCHAR(20) CHECK (role IN ('consultant', 'client')) NOT NULL,  
    organisation\_id UUID REFERENCES organisations(id), \-- NULL for Consultants  
    created\_at TIMESTAMPTZ DEFAULT NOW(),  
    updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

### **3\. Quickscan Results**

Stores raw survey submissions.

CREATE TABLE quickscan\_results (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    organisation\_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,  
    submitted\_at TIMESTAMPTZ DEFAULT NOW(),  
    raw\_answers JSONB NOT NULL, \-- Flexible storage: {"q1": "yes", "q2": "no"}  
    source VARCHAR(50) DEFAULT 'manual' \-- 'tally', 'manual', 'csv'  
);

### **4\. Risk Scores**

Stores the calculated compliance posture based on Quickscan results.

CREATE TABLE risk\_scores (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    organisation\_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,  
    calculated\_at TIMESTAMPTZ DEFAULT NOW(),  
    overall\_score INTEGER CHECK (overall\_score BETWEEN 0 AND 100),  
    governance\_score INTEGER CHECK (governance\_score BETWEEN 0 AND 100),  
    risk\_management\_score INTEGER CHECK (risk\_management\_score BETWEEN 0 AND 100),  
    incident\_score INTEGER CHECK (incident\_score BETWEEN 0 AND 100),  
    suppliers\_score INTEGER CHECK (suppliers\_score BETWEEN 0 AND 100),  
    method\_version VARCHAR(10) DEFAULT 'v1.0'  
);

### **5\. Improvement Actions**

Actionable items generated from gaps in the risk assessment.

CREATE TABLE improvement\_actions (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    organisation\_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,  
    title VARCHAR(255) NOT NULL,  
    category VARCHAR(50) CHECK (category IN ('governance', 'risk\_management', 'incident', 'suppliers', 'other')),  
    priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),  
    status VARCHAR(20) CHECK (status IN ('open', 'in\_progress', 'done')) DEFAULT 'open',  
    due\_date DATE,  
    created\_at TIMESTAMPTZ DEFAULT NOW(),  
    updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

## **3\. Relationships & Multi-Tenancy Logic**

### **Relationships**

* **One-to-Many:** An Organisation has many Users, QuickscanResults, RiskScores, and ImprovementActions.  
* **Foreign Keys:** The organisation\_id FK is present on all tenant-specific tables.

### **Multi-Tenancy Enforcement**

* **Consultants:**  
  * users.organisation\_id is NULL.  
  * **Logic:** They are permitted to query WHERE organisation\_id \= $any\_id.  
* **Clients (MSPs):**  
  * users.organisation\_id is set to a specific UUID.  
  * **Logic:** Every query is wrapped in a middleware check ensuring WHERE organisation\_id \= session.user.organisation\_id. Accessing data for a different UUID results in 403 Forbidden.

## **4\. Key Indexes for Performance**

Indexes are critical for dashboard load times, which primarily filter by Organization ID.

1. users(email): Fast login lookups.  
2. quickscan\_results(organisation\_id): Rapid retrieval of survey history per tenant.  
3. risk\_scores(organisation\_id, calculated\_at DESC): Instant access to the *latest* risk score for the dashboard.  
4. improvement\_actions(organisation\_id, status): Filtering open actions for specific tenants.