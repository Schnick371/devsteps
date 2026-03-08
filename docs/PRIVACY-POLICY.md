# Privacy Policy

**Last Updated:** March 8, 2026  
**Version:** 1.1

## 1. Data Controller

**Thomas Hertel**  
Leonhardtstr. 34  
(Full address available on request)  
Germany

**Contact:**  
Email: the@devsteps.dev  
Website: devsteps.dev

---

## 2. Overview

DevSteps is an open-source extension for Visual Studio Code that runs **entirely locally** on your computer. We do not collect, store, or process any personal data through our software or websites.

### 2.1 Core Principles

- **Zero data collection:** DevSteps does not collect any data from you
- **Local-only processing:** All project data stays on your machine
- **No telemetry:** We do not track usage, features, or behavior
- **Full transparency:** The entire source code is publicly available

---

## 3. Data Processing by DevSteps

### 3.1 VS Code Extension

The DevSteps extension processes the following data **exclusively on your local machine**:

- **Project data:** Work items (Epics, Stories, Tasks, Bugs, Spikes) that you create
- **Configuration:** Extension settings stored by VS Code
- **File paths:** Links between work items and files in your project

**This data never leaves your computer.** DevSteps does not transmit any data to us or any third party.

### 3.2 Websites

DevSteps operates two websites:

| Website | Provider | Purpose |
|---------|----------|---------|
| **devsteps.dev** | IONOS SE (Germany) | Project homepage |
| **github.com/Schnick371/devsteps** | GitHub, Inc. (Microsoft Corporation, USA) | Source code, issues, collaboration |

**DevSteps itself does not store any data on either website.** We do not operate any server-side application, database, analytics, or logging infrastructure on these sites.

Any data that may be collected when you visit these websites is processed solely by the respective hosting providers (IONOS and GitHub) under their own privacy policies:

- **IONOS:** https://www.ionos.de/terms-gtc/datenschutzerklaerung/
- **GitHub:** https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement

We have no access to and no control over any data these providers may collect (such as server logs, IP addresses, or browser metadata).

### 3.3 Cookies and Tracking

DevSteps websites use **none** of the following:

- No cookies
- No analytics (Google Analytics or similar)
- No social media plugins
- No advertising trackers
- No fingerprinting

---

## 4. Third-Party Data Sharing

DevSteps does **not** share any data with third parties because DevSteps does not collect any data in the first place.

When you interact with our GitHub repository (issues, pull requests, discussions), GitHub processes your data as an independent data controller. Please refer to GitHub's privacy statement linked above.

---

## 5. Your Rights Under the GDPR

Since DevSteps does not collect or store personal data, there is typically no personal data for us to provide, correct, or delete. However, under the GDPR you retain the following rights, which you may exercise at any time by contacting us:

| Right | GDPR Article | Description |
|-------|-------------|-------------|
| Access | Art. 15 | Request information about any stored personal data |
| Rectification | Art. 16 | Request correction of inaccurate data |
| Erasure | Art. 17 | Request deletion of personal data |
| Restriction | Art. 18 | Request restriction of processing |
| Data portability | Art. 20 | Receive your data in a structured, machine-readable format |
| Objection | Art. 21 | Object to processing of your data |
| Complaint | Art. 77 | Lodge a complaint with a supervisory authority |

**Supervisory authority (Germany):**  
Der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)  
Graurheindorfer Str. 153, 53117 Bonn  
Phone: +49 (0)228 997799-0  
Email: poststelle@bfdi.bund.de  
Website: https://www.bfdi.bund.de

---

## 6. Data Retention

| Data Type | Retention | Controlled By |
|-----------|-----------|---------------|
| Extension data (local) | Until you delete it | You |
| Website visitor data | Per IONOS / GitHub policies | IONOS / GitHub |

**Deleting local data:** Remove the `.devsteps/` folder in your project directory, or uninstall the extension.

---

## 7. Security

- All website connections use HTTPS encryption
- All project data is stored locally (no cloud transmission)
- Open-source code enables independent security audits
- No tracking technologies are used

---

## 8. International Data Transfers

The DevSteps extension performs **no international data transfers** — all data remains on your local machine.

When visiting our GitHub repository, data may be transferred to the United States. GitHub participates in the EU-US Data Privacy Framework. For details, see GitHub's privacy statement.

The devsteps.dev website is hosted by IONOS SE within the European Union.

---

## 9. Children

DevSteps is a developer tool and does not target children. Under Art. 8 GDPR, persons under 16 should obtain parental consent before providing personal data online.

---

## 10. Changes to This Policy

We may update this privacy policy to reflect legal requirements or clarifications. Material changes will be announced via our GitHub repository.

**Current version:** Always available at [docs/PRIVACY-POLICY.md](https://github.com/Schnick371/devsteps/blob/main/docs/PRIVACY-POLICY.md)

---

## 11. Contact

For questions, complaints, or to exercise your rights:

**Email:** the@devsteps.dev  
**GitHub:** https://github.com/Schnick371/devsteps/issues  
**Response time:** Within 30 days (Art. 12 GDPR)

---

## 12. Technical Details for Developers

### 12.1 Open Source Transparency
DevSteps is fully open source (Apache License 2.0):
- **Source code:** https://github.com/Schnick371/devsteps
- No hidden tracking mechanisms
- Community audits welcome

### 12.2 Local Data Storage
All project data is stored in:
```
<project-root>/.devsteps/
├── items/           # Work items (JSON + Markdown)
├── index/           # Search indices
└── config.json      # Project configuration
```

You can inspect, edit, or delete these files at any time.

### 12.3 No Telemetry
DevSteps collects **no** usage statistics or telemetry data. We do not know:
- How often the extension is used
- Which features you use
- How many work items you create
- Which commands you run

**Complete Privacy by Design.**

---

## 13. Summary (TL;DR)

- **Extension:** All data stays on your computer — zero transmission
- **Websites:** DevSteps stores nothing; only IONOS and GitHub handle hosting-level data per their own policies
- **No cookies, no tracking, no analytics**
- **Open source:** Full transparency through public code
- **GDPR compliant:** EU data protection standards
- **Your control:** Delete all local data at any time

---

**Effective:** March 8, 2026  
**Version:** 1.1
