<h1 align="center">Check-MateData</h1>

<a id="readme-top"></a>

<p align="center">
    <img src="https://img.shields.io/github/license/CapyBlaze/Check-MateData?style=flat-square" alt="LICENSE"/>
    <img src="https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite" alt="https://vitejs.dev/"/>
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" alt="https://reactjs.org/"/>
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" alt="https://www.typescriptlang.org/"/>
    <img src="https://img.shields.io/badge/tailwindcss-4.1-38B2AC?style=flat-square&logo=tailwind-css" alt="https://tailwindcss.com/"/>
</p>

A secure web tool for encrypting, compressing, and encoding any file in chess notation (PGN) format. Restore your files instantly, all 100% client-side for complete privacy.

<div align="center">
    <h3>
        <a href="https://CapyBlaze.github.io/Check-MateData/" target="_blank">
        👉 Live Demo 👈
        </a>
    </h3>
</div>

<br />

<details>
    <summary>🗂️ Table of Contents</summary>
    <ol>
        <li>
            <a href="#🔎-overview">🔎 Overview</a>
        </li>
        <li>
            <a href="#📸-screenshots">📸 Screenshots</a>
        </li>
        <li>
            <a href="#🚀-getting-started">🚀 Getting Started</a>
        </li>
        <li>
            <a href="#🛠️-architecture-and-tech-stack">🛠️ Architecture and Tech Stack</a>
        </li>
        <li>
            <a href="#📘-encodingdecoding-documentation">📘 Encoding/Decoding Documentation</a>
        </li>
        <li>
            <a href="#🤝-contributing">🤝 Contributing</a>
        </li>
        <li>
            <a href="#📝-license">📝 License</a>
        </li>
        <li>
            <a href="#👤-author">👤 Author</a>
        </li>
    </ol>
</details>

---

## 🔎 Overview

The workflow is simple: you import a file, the app encrypts it, then converts it into a sequence of valid chess moves (PGN format). Recovery does the opposite: from a PGN file, it reconstructs the original bitstream and decrypts it.

### Features

- Client-side encryption and decryption.
- Encoding into chess games (PGN).
- Decoding from PGN back to the original file.
- Async processing via Web Workers.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📸 Screenshots

<table>
    <tr>
        <td>
            <img src="./docs/CheckMateData1.png" width="500" alt="CheckMateData Screenshot 1"/>
        </td>
        <td>
            <img src="./docs/CheckMateData2.png" width="500" alt="CheckMateData Screenshot 2"/>
        </td>
    </tr>
    <tr>
        <td>
            <img src="./docs/CheckMateData3.png" width="500" alt="CheckMateData Screenshot 3"/>
        </td>
        <td>
            <img src="./docs/CheckMateData4.png" width="500" alt="CheckMateData Screenshot 4"/>
        </td>
    </tr>
</table>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🚀 Getting Started

### Prerequisites

- Node.js (v24 or higher)
- npm, yarn or pnpm

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/CapyBlaze/Check-MateData.git
    cd Check-MateData
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:5173`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🛠️ Architecture and Tech Stack

### Architecture

- **Main UI** : [src/App.tsx](src/App.tsx)
- **Components** : [src/Components](src/Components)
- **Encryption/processing services** : [src/Services](src/Services)
- **Binary utilities** : [src/Utils](src/Utils)
- **Web Workers** : [src/worker](src/worker)

### Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Chess.js** - Chess rules engine
- **Vite** - Build tool
- **Tailwind CSS** - Styling

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📘 Encoding/Decoding Documentation

This section precisely describes the protocol implemented by [src/Services/encryptFile.ts](src/Services/encryptFile.ts) and [src/Services/decryptFile.ts](src/Services/decryptFile.ts).

### 1) Input and data preparation

- The file is read into a `Uint8Array`.
- A guard byte `0x01` is prepended to preserve leading zeros during reconstruction.
- The result is converted to a single big integer using hexadecimal encoding.
- No compression or encryption is applied in the current implementation.

### 2) Encoding data -> chess moves (PGN)

The encoder transforms the big integer into a sequence of legal chess moves, using a mixed-radix base defined by the number of legal moves at each position:

1. Initialize a standard chessboard (initial position).

2. List the legal moves for the current position and let `n = number_of_legal_moves`.

3. If the list is empty, force the end of the game (flag `endGame`).
    - If there is only one legal move, play it directly without consuming any data.
    - If `n > 1`, select `index = value mod n`, play `movesList[index]`, then update `value = floor(value / n)`.

4. Repeat until the integer value becomes `0`.

When a game ends (or is forced), a PGN is finalized and a new game starts:

- PGN headers set: Event, Site, Date, White, Black, Round, Result.
- Result values used: `1-0`, `0-1`, `1/2-1/2`, or `*`.
- Each PGN is appended to an array, then the board is reset.

#### Output format

- Encoding output: an array of PGN strings (one game per element).
- Each PGN contains the move list representing the bitstream.

### 3) Decoding chess moves -> data

Decoding reverses the same mixed-radix process:

1. Read one or more PGN files.
2. Split games with the separator `\n+(?=\[Event ")`.
3. For each game (processed from last to first), load the PGN and replay moves one by one.
4. Before each move, list legal moves for the current position and let `n = number_of_legal_moves`.
5. If `n > 1`, record the move index and `n` (the radix for that step).
6. Rebuild the integer by iterating recorded moves from last to first: `value = value * n + index`.

#### File reconstruction

- The final integer is converted back to a byte array via hex, then the leading guard byte is removed.
- The final file name is derived from the first input PGN file name:
  - Remove any prefix before the first `_` (counter).
  - Remove the `.pgn` extension.
  - Add the original extension from the PGN header `Black` field (first word), or `.bin` if missing.
- If no name can be derived, the default name is `decrypted_file`.

### 4) Exposed progress info

The UI can display metrics based on:

- Number of generated games.
- Number of moves played.
- Percentage progress during encoding and decoding.

These metrics are returned through the `onProgress` callbacks in both services.

### 5) Security and limits

- Encoding is handled client-side; no data is sent.
- PGN files can become large for big inputs, which impacts performance, so there is a practical file size limit (50KB).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 👤 Author

### Code

- GitHub: [@CapyBlaze](https://github.com/CapyBlaze)

### Design

- GitHub: [@CapyBlaze](https://github.com/CapyBlaze)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

Made with ❤️ by [Capy Blaze](https://github.com/CapyBlaze)
