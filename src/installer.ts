import path from 'path';
import {
  ExtensionContext,
  Uri,
  commands,
  extensions,
  window,
  workspace,
} from 'vscode';
import { FileDownloader, getApi } from '@microsoft/vscode-file-downloader-api';
import { IAutoInstallerConfig } from './config';
import { log } from './logger';
import { convertRelativePath, fileExists, getFileName } from './utils';

export class AutoInstaller {
  private _fileDownloader: FileDownloader | undefined;

  public constructor(
    private _context: ExtensionContext,
    private _config: IAutoInstallerConfig,
  ) {}

  public async install() {
    log('Checking extensions to install');
    if (this._config.disabled) {
      log(
        'Auto installer is disabled (auto-installer.disabled = true). Exiting.',
      );
      return;
    }

    const extensionsToInstall = this._config.extensions;
    log(
      `Auto installing ${extensionsToInstall.length} extensions from config (auto-installer.extensions)`,
    );
    let installedCounter = 0;
    const installExtension = async (ext: string | Uri) => {
      await commands.executeCommand(
        'workbench.extensions.installExtension',
        ext,
      );
      installedCounter++;
    };
    for (const extension of extensionsToInstall) {
      const installed = extensions.getExtension(extension.id);
      if (installed) {
        log(
          `Extension ${extension.id} is already installed. Skipping installation.`,
        );
      } else {
        log(`Installing ${extension.id}`);
        try {
          if (
            extension.uri === undefined ||
            extension.uri === null ||
            extension.uri === ''
          ) {
            log(`No uri for ${extension.id}. Installing from marketplace`);
            await installExtension(extension.id);
          } else {
            let uri = Uri.parse(extension.uri);
            if (uri.scheme === 'file') {
              uri = convertRelativePath(
                extension.uri,
                workspace.workspaceFolders?.[0].uri.path ?? '',
              );
              log(`Installing from file ${uri.path}`);
              if (fileExists(uri.fsPath)) {
                await installExtension(uri);
              } else {
                throw new Error(`File ${uri.fsPath} does not exist.`);
              }
            } else if (uri.scheme.startsWith('http')) {
              const fileDownloader =
                this._fileDownloader ?? (this._fileDownloader = await getApi());
              const filename = getFileName(extension.id);
              const file = await fileDownloader.downloadFile(
                uri,
                filename,
                this._context,
              );
              await installExtension(file);
              await fileDownloader.deleteItem(filename, this._context);
            }
          }
          log(`Successfully installed extension: ${extension.id}`);
        } catch (error) {
          log(`[Error] Failed to install from ${extension.id} [${error}]`);
        }
      }
    }
    log(`Auto installer finished. Installed ${installedCounter} extensions.`);
    if (installedCounter > 0) {
      const action = await window.showInformationMessage(
        'Extensions installed, reload to activate.',
        'Reload',
      );
      if (action === 'Reload') {
        commands.executeCommand('workbench.action.reloadWindow');
      }
    }
  }
}
