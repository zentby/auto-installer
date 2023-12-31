import * as vscode from 'vscode';
import { AutoInstaller } from './installer';
import { AutoInstallerConfig } from './config';

export function activate(context: vscode.ExtensionContext) {
  const installer = new AutoInstaller(context, new AutoInstallerConfig());
  void installer.install();
}
