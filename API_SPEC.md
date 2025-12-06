# **API Specification**

## **Overview**

This API serves the Next.js frontend. It is REST-ish and uses JSON for request/response bodies.  
Base URL: /api

## **Authentication**

### **Login**

* **POST** /auth/login  
* **Purpose:** Authenticate user and set session cookie.  
* **Request Body:** { "email": "user@example.com", "password": "securepassword" }  
* **Response:** 200 OK (Set-Cookie header)  
* **Errors:** 401 Unauthorized (Invalid credentials)

### **Logout**

* **POST** /auth/logout  
* **Purpose:** Clear session cookie.  
* **Response:** 200 OK

## **Organisations**

### **List Organisations**

* **GET** /organisations  
* **Auth:** Consultant only.  
* **Purpose:** Get portfolio list for consultants.  
* **Response:**  
  \[  
    {  
      "id": "uuid",  
      "name": "MSP Alpha",  
      "nis2\_segment": "Essential",  
      "overall\_score": 85,  
      "updated\_at": "2023-10-01T12:00:00Z"  
    }  
  \]

### **Get Organisation Details**

* **GET** /organisations/:id  
* **Auth:** Consultant OR Client (if user.org\_id \== :id).  
* **Purpose:** Get full details for a single tenant.  
* **Response:** { "id": "...", "name": "...", "created\_at": "..." }  
* **Errors:** 403 Forbidden (If client requests different org).

## **Quickscan**

### **Submit Quickscan**

* **POST** /organisations/:id/quickscan  
* **Auth:** Consultant or Client (Owner).  
* **Purpose:** Ingest survey data, save raw results, trigger scoring, and generate actions.  
* **Request Body:**  
  {  
    "source": "tally",  
    "answers": { "q\_mfa": "Yes", "q\_backup": "No" }  
  }

* **Response:** 201 Created \- Returns the ID of the created result.

## **Risk Scores**

### **Get Latest Risk Score**

* **GET** /organisations/:id/risk-score  
* **Auth:** Consultant or Client (Owner).  
* **Purpose:** Retrieve the most recent calculated score for the dashboard.  
* **Response:**  
  {  
    "overall\_score": 85,  
    "governance\_score": 90,  
    "risk\_management\_score": 80,  
    "incident\_score": 85,  
    "suppliers\_score": 70,  
    "calculated\_at": "..."  
  }

### **Recalculate Score**

* **POST** /organisations/:id/risk-score/recalculate  
* **Auth:** Consultant only.  
* **Purpose:** Force re-run of scoring logic on latest data (e.g., after algorithm update).  
* **Response:** 200 OK (New scores returned).

## **Improvement Actions**

### **List Actions**

* **GET** /organisations/:id/actions?status=open  
* **Auth:** Consultant or Client (Owner).  
* **Purpose:** Get list of actionable items.  
* **Response:**  
  \[  
    {  
      "id": "uuid",  
      "title": "Enable MFA",  
      "priority": "high",  
      "status": "open",  
      "category": "governance"  
    }  
  \]

### **Create Action**

* **POST** /organisations/:id/actions  
* **Auth:** Consultant.  
* **Purpose:** Manually add an improvement action.  
* **Request Body:** { "title": "...", "priority": "high", "category": "incident" }

### **Update Action Status**

* **PATCH** /actions/:actionId  
* **Auth:** Consultant or Client (Owner).  
* **Purpose:** Update status (e.g., mark as done).  
* **Request Body:** { "status": "in\_progress" }