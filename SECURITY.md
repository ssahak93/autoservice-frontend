# Security Notes

## Dependency Security

### Current Status

✅ **All vulnerabilities fixed** - `npm audit` shows 0 vulnerabilities

### Regular Maintenance

Run these commands regularly to keep dependencies secure:

```bash
# Check for vulnerabilities
npm audit

# Auto-fix vulnerabilities (if possible)
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Deprecated Warnings

Some warnings about deprecated packages are expected and come from transitive dependencies (dependencies of dependencies). These are typically:

- `inflight` - Used by older versions of some build tools
- `rimraf` - Used by build tools
- `glob` - Used by ESLint and other tools
- `@humanwhocodes/*` - Used by ESLint

These will be updated automatically when their parent packages are updated.

### Security Best Practices

1. **Keep dependencies updated**: Regularly run `npm update`
2. **Review security advisories**: Check `npm audit` before deploying
3. **Use exact versions in production**: Consider using exact versions for critical packages
4. **Monitor dependencies**: Use tools like Dependabot or Snyk

### Known Issues

- ESLint 8.x is used (ESLint 9 has breaking changes with Next.js 14)
- Some deprecated warnings are from transitive dependencies and will be resolved when parent packages update

### Reporting Security Issues

If you find a security vulnerability, please report it privately to the development team.
