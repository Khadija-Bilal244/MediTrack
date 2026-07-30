<div align="center">

# 💊 MediTrack

### Medication Adherence & Side-Effect Monitoring System

A healthcare-focused web app that helps patients schedule medications, track dose completion, log side effects, and monitor adherence — all in one place.

[![Repo](https://img.shields.io/badge/GitHub-MediTrack-1E2A3A?style=for-the-badge&logo=github)](https://github.com/Khadija-Bilal244/MediTrack.git)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)](#technology-stack)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](#technology-stack)
[![Status](https://img.shields.io/badge/Status-Academic_Project-EFB06B?style=for-the-badge)](#academic-integrity)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Objectives](#-objectives)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Future Enhancements](#-future-enhancements)
- [Academic Integrity](#-academic-integrity)

---

## 📖 Overview

Medication adherence is a key factor in successful treatment outcomes — yet many patients struggle to follow schedules, track missed doses, or monitor side effects.

**MediTrack** provides a centralized platform that helps patients:

- 🗓️ Schedule medications
- ✅ Track dose completion
- 📝 Record side effects
- 📊 Monitor adherence statistics
- 📈 Review treatment progress

The system helps improve medication compliance and promotes better healthcare management.

##  Problem Statement

Medication non-adherence is a major challenge in healthcare. Patients often:

- Forget medication timings
- Miss doses without tracking them
- Ignore or forget to record side effects
- Lack visibility into their medication routines

These issues reduce treatment effectiveness and can lead to health complications.

> **MediTrack solves this by offering a structured medication monitoring and tracking system.**

## 🎯 Objectives

- Develop a comprehensive medication management system
- Allow patients to schedule and manage medications
- Track completed and missed doses
- Record medication side effects
- Generate adherence reports and statistics
- Provide a simple, user-friendly healthcare tracking platform

##  Features

### 👤 User Profile Management
- Create and update patient profiles
- Store personal and health-related information

### 💊 Medication Scheduling
- Add medications with dosage information
- Set medication timings
- Define treatment duration
- Manage multiple medications at once

### ✅ Dose Tracking
- Mark medications as taken
- Automatically record missed doses

### ⚠️ Side-Effect Logging
- Record symptoms experienced after medication intake
- Assign severity levels:

  | Level | Description |
  |---|---|
  | 🟢 Mild | Minor, manageable symptoms |
  | 🟡 Moderate | Noticeable symptoms affecting daily activity |
  | 🔴 Severe | Symptoms requiring attention |

### 📊 Adherence Reports
- Calculate medication adherence percentage
- Display missed-dose statistics
- Generate summary reports for medication tracking

## 🏗️ System Architecture

```
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│       Frontend         │  ───▶  │       Backend          │  ───▶  │       Database          │
│  (UI / scheduling &     │        │  (Business logic,       │        │  (Patients, meds,        │
│   dose tracking)         │  ◀───  │   API endpoints)         │  ◀───  │   doses, side effects)   │
└──────────────────────┘        └──────────────────────┘        └──────────────────────┘
```

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Backend | Node.js |
| Database | MySQL |
| Core Logic | JavaScript |

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/Khadija-Bilal244/MediTrack.git
cd MediTrack

# Install dependencies
npm install

# Configure your MySQL database
# (create the database and update your connection config)

# Start the application
npm start
```

## 🔮 Future Enhancements

- 🔔 Automated reminder notifications for upcoming doses
- 📱 Mobile app companion
- 🩺 Doctor/caregiver dashboard for remote monitoring
- 📤 Exportable adherence reports (PDF/CSV)
- 🔐 Enhanced authentication & data privacy controls

## 🎓 Academic Integrity

This project is developed for **academic and educational purposes**. It demonstrates the design and development of a healthcare-based medication tracking application.

---

<div align="center">
<sub>Built by Khadija Bilal — Computer Science student, FAST-NUCES Lahore.</sub>
</div>
