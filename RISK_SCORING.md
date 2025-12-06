# **NIS2 Risk Scoring Model**

## **1\. Purpose**

The Risk Score quantifies an organization's adherence to NIS2 standards. It is presented as a **Compliance Score**, where:

* **100:** Fully Compliant / Lowest Risk.  
* **0:** Non-Compliant / Highest Risk.

## **2\. Methodology**

### **Answer Mapping**

Questions in the Quickscan are mapped numerically to standardized values:

* **Yes:** 1.0 points (Compliance demonstrated).  
* **No:** 0.0 points (Gap identified).  
* **Not Sure:** 0.0 points (Uncertainty is treated as a risk/gap).

### **Question Weighting**

Each question is assigned a weight based on criticality:

* **1:** Standard requirement.  
* **2:** Important requirement.  
* **3:** Critical / "Must-have" requirement (e.g., MFA, Incident Reporting).

### **Categories**

The model groups questions into four key NIS2 domains:

1. **Governance & Organisation** (governance)  
2. **Risk Management** (risk\_management)  
3. **Incident Response & Monitoring** (incident)  
4. **Supply Chain / Vendors** (suppliers)

## **3\. Scoring Algorithm**

The system calculates a percentage score (0-100) for each category by dividing *earned points* by *total possible points*. The **Overall Score** is the average of these four category scores to prevent a single large category from skewing the result.

### **Pseudo-Code Implementation**

type AnswerType \= "Yes" | "No" | "Not Sure";  
type Category \= "governance" | "risk\_management" | "incident" | "suppliers";

interface QuestionDef {  
  id: string;  
  category: Category;  
  weight: number; // 1 (standard) to 3 (critical)  
}

function calculateRiskScore(answers: Record\<string, AnswerType\>, questions: QuestionDef\[\]) {  
    
  // Initialize accumulators  
  const scores \= {  
    governance: { earned: 0, total: 0 },  
    risk\_management: { earned: 0, total: 0 },  
    incident: { earned: 0, total: 0 },  
    suppliers: { earned: 0, total: 0 },  
  };

  questions.forEach((q) \=\> {  
    const userAnswer \= answers\[q.id\];  
    const maxPoints \= q.weight \* 100; // Max score for this question  
    let earnedPoints \= 0;

    if (userAnswer \=== "Yes") {  
      earnedPoints \= maxPoints;  
    }   
    // "No" and "Not Sure" result in 0 points

    // Add to category buckets  
    scores\[q.category\].earned \+= earnedPoints;  
    scores\[q.category\].total \+= maxPoints;  
  });

  // Helper to calculate percentage  
  const calcPct \= (earned: number, total: number) \=\> total \=== 0 ? 0 : Math.round((earned / total) \* 100);

  const finalScores \= {  
    governance\_score: calcPct(scores.governance.earned, scores.governance.total),  
    risk\_management\_score: calcPct(scores.risk\_management.earned, scores.risk\_management.total),  
    incident\_score: calcPct(scores.incident.earned, scores.incident.total),  
    suppliers\_score: calcPct(scores.suppliers.earned, scores.suppliers.total),  
  };

  // Overall score: Plain average of the 4 categories  
  const overall\_score \= Math.round(  
    (finalScores.governance\_score \+   
     finalScores.risk\_management\_score \+   
     finalScores.incident\_score \+   
     finalScores.suppliers\_score) / 4  
  );

  return { ...finalScores, overall\_score };  
}

## **4\. Versioning**

The risk\_scores table includes a method\_version field (e.g., 'v1.0'). This allows the scoring logic to evolve (e.g., adding new NIS2 guidelines) without invalidating historical scores calculated under previous models.