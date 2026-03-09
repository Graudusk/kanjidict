# KanjiDict – Kanji Dictionary Game

KanjiDict is a **kanji learning and dictionary game** designed to help learners of Japanese reinforce their knowledge of kanji through interactive quizzes and lookup functionality.

The application combines a **kanji dictionary** with a **gamified quiz system**, allowing users to explore kanji meanings while testing their recognition and recall skills.

The project demonstrates **full-stack web development**, including frontend UI, API integration, and educational game mechanics.

---

# Features

* 🔎 **Kanji lookup** – Search for kanji and view readings and meanings
* 🎮 **Quiz mode** – Test your knowledge of kanji meanings and readings
* 📚 **Dictionary browsing** – Explore kanji entries interactively
* ⚡ **Fast client-side interactions** for smooth gameplay
* 🌏 Designed for **Japanese language learners**

---

# Tech Stack

## Frontend

* JavaScript
* HTML
* CSS

## Backend

* Node.js
* Express

## Other Tools

* Git
* REST APIs
* JSON data processing

---

# Architecture Overview

The system follows a simple **client-server architecture**:

```
Frontend (Browser)
        |
        v
Node.js / Express API
        |
        v
Kanji Dictionary Data
```

### Frontend

https://github.com/Graudusk/kanjidict_flutter

Responsible for:

* rendering quiz interfaces
* handling user interactions
* displaying kanji information

### Backend API

Handles:

* dictionary queries
* quiz data generation
* kanji lookup requests

---

# Quiz System

The quiz component generates questions such as:

* Meaning of a kanji
* Reading of a kanji
* Kanji identification

Users select answers and receive feedback immediately.

This design makes the application useful both as a **learning tool** and a **practice game**.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/kanjidict.git
cd kanjidict
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Open the application in your browser.

---

# Project Goals

The main goals of this project were to:

* experiment with **educational game mechanics**
* build a **kanji learning tool**
* practice **JavaScript and API design**
* explore **interactive learning experiences**

---

# Future Improvements

Potential future improvements include:

* spaced repetition learning
* difficulty levels
* user progress tracking
* mobile UI improvements
* expanded kanji datasets

---

# License

MIT License
