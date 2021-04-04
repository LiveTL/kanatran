const serverVersion = '1.3.0';

// dynamic validation in case a range of versions are supported
const serverVersionSplit = serverVersion.split('.').map(d => parseInt(d));
module.exports.validateVersion = (clientVersion) => {
  try {
    clientVersion = clientVersion.split('.').map(d => parseInt(d));
    return (clientVersion[0] === serverVersionSplit[0] &&
            clientVersion[1] === serverVersionSplit[1]);
  } catch (e) {
    return false;
  }
};