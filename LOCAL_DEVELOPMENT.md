Local development helper

Files added:

- `.ic-assets.json5` — minimal security policy for project assets to silence dfx warnings.
- `scripts/local-deploy.sh` — convenience script that stops any running replica, starts a clean local replica in the background, and runs `dfx deploy`.

Usage:

1. Make sure `dfx` is installed and on your PATH.
2. From the project root run:

```
./scripts/local-deploy.sh
```

This starts the replica with a clean state (equivalent to `dfx start --clean --background`) and runs `dfx deploy`.

Why this helps:

- If dfx reports "The network state can't be reused with this configuration", starting with `--clean` resolves the conflict.
- The `.ic-assets.json5` file defines a default security policy for assets and removes the dfx warning about missing asset policies.
