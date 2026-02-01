## GitHub Repository Push - Clean History (V1.0)

Die GitHub-Publikation ist vorbereitet mit **sauberer History** (1 initialer Commit statt 481).

### Veröffentlichungs-Reihenfolge (WICHTIG!)

#### Phase 1: Cleanup (VOR orphan branch Neuerstellung)
1. ❌ Interne Dev-Artefakte entfernen
2. ❌ K8s/Docker-Dateien entfernen (nicht relevant für Extension)
3. ❌ Orphan Branch `github-v1` neu erstellen mit bereinigtem Code

#### Phase 2: npm Publish (VOR GitHub Push)
```bash
# Version auf 1.0.0 setzen
npm version 1.0.0 --workspaces --no-git-tag-version

# Packages in Reihenfolge publishen
cd packages/shared && npm publish --access public
cd packages/cli && npm publish --access public
cd packages/mcp-server && npm publish --access public
```

#### Phase 3: GitHub Push
```bash
git remote add origin https://github.com/Schnick371/devsteps.git
git push -u origin github-v1:main --force
```

#### Phase 4: VS Code Marketplace
```bash
cd packages/extension
npx vsce publish
```

### Zu entfernende Dateien

**Root:**
- LEGACY-CODE-AUDIT.md, CLEANUP-REPORT.md, DEPLOYMENT-VERIFICATION.md
- NPM-PUBLISH-GUIDE.md, DEPLOYMENT.md, DOCKER.md
- Dockerfile, docker-compose.yml, .dockerignore
- fix-commands.sh

**k8s/ (ganzer Ordner):**
- configmap.yaml, deployment.yaml, hpa.yaml, pvc.yaml, service.yaml, servicemonitor.yaml

**docs/:**
- TODO.md, SAFETY_AUDIT.md
- DATENSCHUTZ-MINIMAL-WEBSITE.txt, DATENSCHUTZ-WEBSITE-TEXT.txt
- WEBSITE-CONTENT.md, "Ideen für...md"
- validation/ (ganzer Ordner)

### Nach dem Push

1. GitHub Repository Description setzen
2. Topics hinzufügen: vscode-extension, mcp-server, ai-development, copilot, typescript
3. GitHub Discussions aktivieren
4. Branch Protection Rules für `main` einrichten