# LP ITS draw.io Desktop 32.5.5

This project produces an unsigned Windows x64 installer based on the exact
draw.io Desktop v32.5.5 source, with only these requested behavior changes:

- The Help menu no longer contains the website item.
- The Help menu no longer contains Check for Updates / Restart to Update.
- The former website position is now **开发团队** and displays **LP ITS**.
- Automatic and manual application updates are disabled so the customized
  build cannot replace itself with the official build.

## Exact upstream source

- `jgraph/drawio-desktop` tag `v32.5.5`, commit
  `8941e0454514d5b4448e4536f4674975e4c1588d`
- `jgraph/drawio` submodule commit
  `17b367b91dbab91804f852645788d7ffb46dcb79`
- Core version: `32.5.5`

The downloaded source archives and working source tree are kept locally under
this directory. The GitHub Actions recipe checks both commit hashes before it
builds.

## Build output

The Windows installer is built on GitHub Actions using the upstream personal
build mechanism (`DRAWIO_UNSIGNED=true`). It is not code-signed, so Windows
SmartScreen can show a warning. The NSIS installer is per-machine and can
replace an existing official draw.io installation.

## License and attribution

draw.io Desktop and draw.io are licensed under GPL-3.0. The upstream copyright,
license files, product name, and attribution remain in the packaged source and
application. This repository stores the customization script and exact source
references needed to reproduce the binary.
