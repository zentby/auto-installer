# Extension Auto Installer

This extension is designed for users who want to install extensions that are privately listed. E.g. In a large organization/enterprise, you may have your own extensions that are not published to the marketplace. You can use this extension to install those extensions.

The extension would work better if the private extensions are integrated with [Extension Auto Updater](https://marketplace.visualstudio.com/items?itemName=yangzhao.auto-updater), which can automatically update your extensions from a private sources.

- Extension Auto Installer (this extension) will install the extensions.
- [Extension Auto Updater](https://marketplace.visualstudio.com/items?itemName=yangzhao.auto-updater) will manage the future updates for your extensions.

**If you only want to install extensions from the marketplace, you probably don't need this extension. Use [workspace recommended extension](https://code.visualstudio.com/docs/editor/extension-marketplace#_workspace-recommended-extensions) instead.**


## Features

Auto install extensions from a list of extensions in a file. The extension source can be:
- Marketplace (with extension id)
- VSIX (with file path)
- Web (with url)

## Usage

Add the extension you want to install to your workspace's `.vscode/settings.json` file:

```json
    "auto-installer.extensions": [
        {
            "id": "esbenp.prettier-vscode" // If the uri leaves empty, it will be installed from marketplace
        },
        {
            "id": "yangzhao.awesome-extension",
            "uri": "https://.../extension.vsix" // The extension is hosted on a web server
        },
        {
            "id": "yangzhao.config-inspector",
            "uri": "../extensions/auto-updater.vsix"
        }
    ]
```

## Release Notes

See [CHANGELOG](./CHANGELOG.md) section.
