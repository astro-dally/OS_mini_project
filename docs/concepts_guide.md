# 🎓 OS Mini Project — Concepts & Algorithms Guide

This guide provides a structured overview of the technical concepts, cryptographic algorithms, and Operating Systems principles implemented across the three components of your project.

---

## 🏗️ 1. Core Cryptographic Algorithms

All components share a unified, industry-standard encryption core, but also include simpler ciphers for educational or fun purposes.

### 🛡️ AES-256-GCM (The Gold Standard)
*   **What it is:** Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode.
*   **Why we use it:** It provides **Authenticated Encryption**. Not only does it hide the data, but it also ensures the data hasn't been tampered with (integrity).
*   **Implementation:** 
    *   **C Tool:** Uses OpenSSL's `EVP` API.
    *   **CipherChat:** Uses the browser's native `Web Crypto API`.
    *   **CipherVault:** Uses Python's `cryptography` library.
*   **Learnable Highlight:** The "Auth Tag" is a fingerprint created during encryption. If even one bit of the ciphertext is changed, decryption will fail because the tag won't match.

### 🔑 PBKDF2-HMAC-SHA256 (Key Derivation)
*   **What it is:** Password-Based Key Derivation Function 2.
*   **Why we use it:** Computers can guess short passwords instantly. PBKDF2 runs the password through thousands of hashing rounds (250,000 in this project) to make "brute-force" attacks much slower.
*   **Concepts:**
    *   **Salt:** A random unique string added to the password so two people with the same password have different keys.
    *   **Iterations:** The "work factor" (250k rounds).

### 🏷️ Substitution Cipher (Emoji Cipher)
*   **Where:** Found in **CipherChat**.
*   **Concept:** A simple one-to-one mapping where characters are replaced by emojis (e.g., 'A' → 🚀).
*   **Security:** This is **not** secure (easily cracked by frequency analysis) but useful for demonstrating how basic ciphers work.

---

## 📟 2. OS Concepts in the C Tool

The `encrypt_tool` demonstrates how an application interacts directly with the Operating System kernel.

| Concept | Explanation | Real Code Location |
| :--- | :--- | :--- |
| **POSIX Syscalls** | Using functions like `open()`, `read()`, and `write()` to talk to the kernel. | `src/file_io.c` |
| **Manual Memory** | In C, we must manually allocate memory (`malloc`) and free it (`free`). Forgetting leads to memory leaks! | `src/encryption.c` |
| **File Descriptors** | Integers the OS uses to keep track of open files. | `src/file_io.c` |
| **ncurses TUI** | Moving beyond simple text to build a "Terminal User Interface" with colors and menus. | `src/ui.c` |

---

## 🛡️ 3. Security Engineering in CipherVault

CipherVault focuses on **Defensive OS concepts** and monitoring.

### 🕵️ IDS (Intrusion Detection System)
*   **Concept:** A "Host-based" IDS (HIDS) that monitors system behavior for signs of an attack.
*   **Logic (`ids_service.py`):**
    *   **Brute Force:** Flags if more than 5 failed logins occur in 10 minutes.
    *   **Mass Download:** Flags more than 20 decryptions in 5 minutes (potential data theft).
    *   **IP Anomaly:** Flags if a user logs in from an unrecognized location.

### 🧹 Secure Deletion
*   **Concept:** Simply deleting a file (`unlink`) doesn't erase the data from the disk—it just marks the space as "empty."
*   **Implementation:** Performs a **3-pass random overwrite** (filling the file with random bits) before deleting, making forensic recovery impossible.

### 🧱 File Locking
*   **Concept:** Preventing two users from editing the same file at once (Concurrency Control).
*   **Implementation:** A logical locking mechanism that prevents "Race Conditions."

---

## 💬 4. Distributed Systems in CipherChat

### ☁️ IPC & Message Broker
*   **Concept:** Different users are different "processes" on different machines.
*   **Implementation:** **Firebase** acts as the shared memory (Inter-Process Communication) that syncs data across all clients in real-time.

### 🔌 Live Presence (Heartbeats)
*   **Concept:** Detecting if a "process" (user) has crashed or disconnected.
*   **Implementation:** Every 15 seconds, the client sends a "heartbeat" to the server. If a heartbeat is missed for 45 seconds, the OS/App considers the user offline.

---

## ⚡ Quick Cheat Sheet for Questions

*   **Q: How do you verify file integrity?**
    *   **A:** We use **SHA-256** hashing. We compute a hash of the file and store it. If someone modifies the file, the hash will change, and our tool will flag it.
*   **Q: What is "Zero-Knowledge Architecture"?**
    *   **A:** In CipherChat, the server (Firebase) only ever sees encrypted "garbled" text. The decryption key never leaves the user's browser.
*   **Q: Why use PBKDF2 instead of just MD5?**
    *   **A:** MD5 is extremely fast (good for non-security use), but PBKDF2 is intentionally slow to stop hackers from guessing millions of passwords per second.
