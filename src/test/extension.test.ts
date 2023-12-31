import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as fileDownloader from '@microsoft/vscode-file-downloader-api';
import * as utils from '../utils';
import { AutoInstaller } from '../installer';

const fakeContext: vscode.ExtensionContext = {
  extensionPath: '',
  globalState: sinon.stub() as any,
  globalStoragePath: '',
  logPath: '',
  storagePath: '',
  subscriptions: [],
  workspaceState: sinon.stub() as any,
  asAbsolutePath: sinon.stub() as any,
  environmentVariableCollection: sinon.stub() as any,
  extensionUri: sinon.stub() as any,
  logUri: sinon.stub() as any,
  storageUri: sinon.stub() as any,
  globalStorageUri: sinon.stub() as any,
  extensionMode: vscode.ExtensionMode.Production,
  secrets: sinon.stub() as any,
  extension: sinon.stub() as any,
};

suite('When having extensions to install', () => {
  let installer: AutoInstaller;
  let sandbox: sinon.SinonSandbox;

  let showInformationMessageStub: sinon.SinonStub;
  let executeCommandStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();
    executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand');
    showInformationMessageStub = sandbox.stub(
      vscode.window,
      'showInformationMessage',
    );

    // Assume user clicks 'Reload' when asked to reload window
    showInformationMessageStub.resolves('Reload' as any);

    const getExtensionStub = sandbox.stub(vscode.extensions, 'getExtension');

    // Assume no extensions are installed
    getExtensionStub.returns(undefined);
  });

  teardown(() => {
    sandbox.restore();
  });

  test('should install extension from marketplace if uri is empty', async () => {
    installer = new AutoInstaller(fakeContext, {
      disabled: false,
      extensions: [{ id: 'test' }],
    });

    await installer.install();

    // Check if the methods were called with the correct arguments
    assert.ok(
      executeCommandStub.calledWith(
        'workbench.extensions.installExtension',
        'test',
      ),
    );
    assert.ok(
      showInformationMessageStub.calledWith(
        'Extensions installed, reload to activate.',
        'Reload' as any,
      ),
    );
    assert.ok(executeCommandStub.calledWith('workbench.action.reloadWindow'));
  });

  test('should install extension from file if uri is a file', async () => {
    installer = new AutoInstaller(fakeContext, {
      disabled: false,
      extensions: [{ id: 'test', uri: 'file:///test' }],
    });
    const fileUri = vscode.Uri.parse('file:///test');
    sandbox.stub(utils, 'fileExists').returns(true);
    sandbox.stub(utils, 'convertRelativePath').returns(fileUri);

    await installer.install();

    // Check if the methods were called with the correct arguments
    assert.ok(
      executeCommandStub.calledWith(
        'workbench.extensions.installExtension',
        fileUri,
      ),
    );

    assert.ok(
      showInformationMessageStub.calledWith(
        'Extensions installed, reload to activate.',
        'Reload' as any,
      ),
    );
    assert.ok(executeCommandStub.calledWith('workbench.action.reloadWindow'));
  });

  test('should install extension from url if uri is a url', async () => {
    installer = new AutoInstaller(fakeContext, {
      disabled: false,
      extensions: [{ id: 'test', uri: 'https://test.com/file' }],
    });

    const testFilePath = 'file:///test';
    const testFileUri = vscode.Uri.parse(testFilePath);
    const downloadStub = sandbox.stub();
    downloadStub.resolves(testFileUri);
    sinon.stub(fileDownloader, 'getApi').returns({
      downloadFile: downloadStub,
      deleteItem: () => Promise.resolve(),
    } as any);

    await installer.install();
    assert.ok(
      downloadStub.calledOnceWith(
        vscode.Uri.parse('https://test.com/file'),
        'test.vsix',
        fakeContext,
      ),
    );
    // Check if the methods were called with the correct arguments
    assert.ok(
      executeCommandStub.calledWith(
        'workbench.extensions.installExtension',
        testFileUri,
      ),
    );
    assert.ok(
      showInformationMessageStub.calledWith(
        'Extensions installed, reload to activate.',
        'Reload' as any,
      ),
    );
    assert.ok(executeCommandStub.calledWith('workbench.action.reloadWindow'));
  });
});
