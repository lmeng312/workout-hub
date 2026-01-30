# Install Homebrew (Required for Watchman)

## Step 1: Install Homebrew

Homebrew is a package manager for macOS. Install it by running:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

This will:
- Download and install Homebrew
- Ask for your password (for sudo access)
- Take a few minutes to complete

## Step 2: Add Homebrew to PATH

After installation, you may need to add Homebrew to your PATH. The installer will tell you what to run, but typically it's:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## Step 3: Verify Installation

```bash
brew --version
```

Should show a version number.

## Step 4: Install Watchman

```bash
brew install watchman
```

## Step 5: Start Your App

```bash
cd mobile
npm start
```

The EMFILE error should be gone!
