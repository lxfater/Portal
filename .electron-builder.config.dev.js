/**
 * TODO: Rewrite this config to ESM
 * But currently electron-builder doesn't support ESM configs
 * @see https://github.com/develar/read-config-file/issues/10
 */

/**
 * @type {() => import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
 module.exports = async function () {
    const {getVersion} = await import('./version/getVersion.mjs');
  
    return {
      productName: 'Portal-Dev',
      compression: 'maximum',
      "extraResources": [
        "./buildResources/**"
      ],
      npmRebuild: false,
      win: {
        'requestedExecutionLevel': 'requireAdministrator',
        'target': ['nsis'],
        icon: './buildResources/icons/win/icon.ico',
      },
      mac: {
        target: 'dmg',
        icon: './buildResources/icons/mac/icon.icns',
      },
      nsis: {
        'differentialPackage': true,
      },
      files: ['packages/**/dist/**'],
      extraMetadata: {
        version: getVersion(),
      },
      'publish': [
        {
          'provider': 'github',
          'owner': 'lxfater',
          'repo': 'Portal-dev',
          'releaseType': 'draft',
        },
      ],
      // Specify linux target just for disabling snap compilation
      linux: {
        target: 'deb',
      },
    };
  };