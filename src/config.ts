import { WorkspaceConfiguration, workspace } from 'vscode';

const disabledKey = 'disabled';
const extensionsKey = 'extensions';

export class AutoInstallerConfig implements IAutoInstallerConfig {
  private _config: WorkspaceConfiguration;

  public constructor() {
    this._config = workspace.getConfiguration('auto-installer');
  }

  public get disabled(): boolean {
    return this._config.get(disabledKey, false);
  }

  public get extensions(): IExtension[] {
    return this._config.get(extensionsKey, []);
  }
}

export interface IAutoInstallerConfig {
  disabled: boolean;
  extensions: IExtension[];
}

interface IExtension {
  id: string;
  uri?: string;
}
