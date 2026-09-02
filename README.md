# 30 Seconds Board Game Companion

A highly interactive, digital companion web app for the "30 Seconds" board game. This project is built entirely with vanilla JavaScript, HTML, and CSS, and is designed to be hosted via GitHub Pages and projected onto a large screen while playing with physical cards in person.

## Features

- **Projector-Ready Board**: Uses a full-screen background of the game board.
- **Draggable Team Chips**: 6 colored chips that can be dragged and dropped directly on the board to track team progress.
- **30-Second Timer**: A built-in timer with retro visual cues (changes color as time runs out) and smart play/pause/reset states. The timer uses absolute timestamps to remain accurate even if the browser tab is backgrounded.
- **Digital Dice**: Accurately simulates the official handicap die (faces: `0, 0, 1, 1, 2, 2`) with rolling animations.
- **Retro Audio System**: Built-in 8-bit style sound effects generated via the Web Audio API for timer ticks, dice rolls, and alarms.
- **Modular Interface**: Glassmorphism UI panel that lets you toggle the visibility of the timer, dice, or chips, and mute sounds—perfect for substituting digital elements for physical ones on the fly.
- **Auto-Save & Reset**: The application automatically saves your chip positions and panel settings to your browser's local storage. If you accidentally close the tab, your game state is perfectly preserved! A built-in reset button allows you to quickly clear the board for a new game.

## Setup & Deployment

Because this is a completely static, vanilla web application, there is no build step required.

### Local Usage
1. Clone this repository.
2. Open `index.html` in any modern web browser.

### Hosting on GitHub Pages
1. Push this repository to GitHub.
2. Go to your repository **Settings** > **Pages**.
3. Select the `main` branch as your source and save.
4. Your digital board will be live!

## Technologies Used

- **HTML5** & **CSS3** (Glassmorphism styling, animations, flexbox layouts)
- **Vanilla JavaScript** (Drag-and-drop mechanics, timer logic)
- **Web Audio API** (Procedural synthesizer sound effects)
- **FontAwesome** (Icons)
- **Google Fonts** (Press Start 2P, Roboto)
