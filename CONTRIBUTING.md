# Contributing to DataHub

Thank you for your interest in contributing to DataHub! We're building the future of data ownership together.

## Code of Conduct

Be respectful, inclusive, and collaborative. We're here to empower people, not tear them down.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Node version, etc.)

### Suggesting Features

1. Open a Discussion to propose your idea
2. Explain the problem it solves
3. Describe your proposed solution
4. Be open to feedback and iteration

### Submitting Pull Requests

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure all tests pass (`npm test`)
6. Commit with clear messages (`git commit -m 'Add amazing feature'`)
7. Push to your fork (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup

\`\`\`bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/datahub.git
cd datahub

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment
cp backend/.env.example backend/.env
# Edit .env with your local config

# Run tests
npm test

# Start development servers
cd backend && npm run dev
cd frontend && npm run dev
\`\`\`

### Code Style

- Use TypeScript
- Follow existing code patterns
- Write meaningful variable names
- Comment complex logic
- Keep functions small and focused

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Reference issues when applicable (#123)

Good examples:
- \`Add autopilot mode for automatic approvals\`
- \`Fix authentication bug in OAuth flow #456\`
- \`Update analytics dashboard with new charts\`

### Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good coverage, but don't obsess over 100%

## Questions?

Join our Discord or email hello@datahub.app

---

**Thank you for helping build a fairer data economy!** 🚀
