# Datapath Web App – CS3339

An interactive web application for visualizing and learning how instructions move through a single-cycle datapath.

This project was built for **CS3339 (Computer Architecture)** at **Texas State University**. It helps users explore how major instruction types flow through the datapath step by step, while also offering quiz-based practice to test understanding.

## Overview

Understanding datapath execution from static diagrams alone can be difficult. This project turns the datapath into an interactive visual tool where users can:

- select an instruction type
- run a guided **Learn** mode
- test themselves in **Quiz** mode
- click on individual datapath components to read what each one does
- step through the execution process visually

The goal of the app is to make datapath flow easier to understand, especially for students learning how instructions are fetched, decoded, executed, and written back.

## Features

- Interactive datapath visualization
- Support for multiple instruction types
- **Learn mode** with guided step-by-step explanations
- **Quiz mode** with multiple-choice questions for each step
- Clickable datapath components with informational popups
- Run, step, and reset controls
- Styled UI with draggable simulation/info panels

## Supported Instructions

The app currently includes instruction walkthroughs for:

- ALU
- Load
- Store
- Branch
- Jump

Each instruction has its own step sequence and explanation content.

## How It Works

1. Choose an instruction from the sidebar.
2. Select either **Learn** or **Quiz** mode.
3. Click **Run** to begin the simulation.
4. Use **Step** to move through the datapath one stage at a time.
5. Click on components like the **PC**, **Register File**, **ALU**, or **Memory** blocks to view more information.
6. Click **Reset** to return the app to its default state.

## Educational Purpose

This project is designed to help students:

- understand the role of each datapath component
- see how different instruction types use different hardware paths
- compare ALU, memory, branch, and jump behavior
- reinforce learning through guided explanations and quiz questions

## Tech Stack

- **HTML**
- **CSS**
- **JavaScript**
- **Konva.js** for drawing and interacting with the datapath canvas

## Project Structure

```text
DatapathWebApp-CS3339/
│
├── datapath/          # Component drawing and wire logic
├── instructions/      # Step-by-step instruction definitions
├── ui/                # Popups, panels, tour, and quiz UI
├── src/               # Shared application state / control logic
├── index.html         # Main entry point
├── style.css          # Main styling
└── README.md
