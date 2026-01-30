# Fix "quote>" Prompt in Terminal

## What is "quote>"?

The `quote>` prompt appears in zsh when you have an **unclosed quote**. This happens when you:
- Type a quote character (`'` or `"`) and press Enter without closing it
- Copy/paste a command with an unclosed quote
- Have a syntax error in a command

The shell is waiting for you to complete the quote.

## How to Fix It

### Option 1: Cancel and Start Over (Easiest)
Press **Ctrl+C** to cancel the current command and return to normal prompt.

### Option 2: Close the Quote
If you know what quote you opened, type the matching quote and press Enter:
- If you opened with `'`, type `'` and press Enter
- If you opened with `"`, type `"` and press Enter

### Option 3: Exit and Restart Terminal
Close the terminal window and open a new one.

## What Happened in Your Case

Looking at your terminal history, it seems like you might have:
1. Copied a multi-line command that had quotes
2. Or typed a command with an unclosed quote

The shell got stuck waiting for you to close the quote.

## Prevention

When copying commands:
- Make sure to copy the entire command
- Check for matching quotes
- If a command spans multiple lines, copy all lines

## Quick Fix Right Now

Just press **Ctrl+C** in your terminal, then you can run commands normally again.

Then to start your app properly:
```bash
cd mobile
npm start
```
